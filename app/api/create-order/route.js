import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServerClient } from "../../../lib/supabaseClient";
import { buildEsewaPaymentFields } from "../../../lib/esewa";

const DELIVERY_CHARGE = 100;

export async function POST(request) {
  try {
    const body = await request.json();
    const { customer, items } = body;

    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
      return NextResponse.json({ error: "Missing customer details." }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Re-fetch authoritative prices from the DB — never trust prices sent from the client.
    const productIds = items.map((i) => i.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price")
      .in("id", productIds);

    if (productsError) throw productsError;

    const productMap = new Map(products.map((p) => [p.id, p]));
    let amount = 0;
    const orderItemsPayload = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found.` },
          { status: 400 }
        );
      }
      const quantity = Number(item.quantity) || 1;
      amount += Number(product.price) * quantity;
      orderItemsPayload.push({
        product_id: product.id,
        product_name: product.name,
        size: item.size,
        quantity,
        price: product.price
      });
    }

    const totalAmount = amount + DELIVERY_CHARGE;
    const transactionUuid = `TL-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        payment_status: "PENDING"
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const itemsWithOrderId = orderItemsPayload.map((i) => ({ ...i, order_id: order.id }));
    const { error: itemsError } = await supabase.from("order_items").insert(itemsWithOrderId);
    if (itemsError) throw itemsError;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

    const esewaFields = buildEsewaPaymentFields({
      amount,
      taxAmount: 0,
      deliveryCharge: DELIVERY_CHARGE,
      totalAmount,
      transactionUuid,
      successUrl: `${baseUrl}/payment/success`,
      failureUrl: `${baseUrl}/payment/failure`
    });

    return NextResponse.json({
      esewaUrl: process.env.ESEWA_PAYMENT_URL,
      fields: esewaFields
    });
  } catch (err) {
    console.error("create-order error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong creating the order." },
      { status: 500 }
    );
  }
}
