"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../components/CartContext";

const DELIVERY_CHARGE = 100;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const formRef = useRef(null);
  const [esewaFields, setEsewaFields] = useState(null);
  const [esewaUrl, setEsewaUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  if (items.length === 0 && !esewaFields) {
    return (
      <div className="text-center py-20 text-black/60">
        Your cart is empty. Add something from the shop first.
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create order.");

      setEsewaUrl(data.esewaUrl);
      setEsewaFields(data.fields);
      clearCart();

      // Give React a tick to render the hidden form, then submit it to eSewa.
      setTimeout(() => {
        formRef.current?.submit();
      }, 50);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-6">Checkout</h1>

      <div className="mb-8 text-sm border border-black/10 p-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>Rs. {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Delivery</span>
          <span>Rs. {DELIVERY_CHARGE}</span>
        </div>
        <div className="flex justify-between mt-2 font-medium border-t border-black/10 pt-2">
          <span>Total</span>
          <span>Rs. {(subtotal + DELIVERY_CHARGE).toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Full name</label>
          <input
            required
            className="w-full border border-black/20 px-3 py-2"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            required
            type="email"
            className="w-full border border-black/20 px-3 py-2"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input
            required
            className="w-full border border-black/20 px-3 py-2"
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Delivery address</label>
          <textarea
            required
            rows={3}
            className="w-full border border-black/20 px-3 py-2"
            value={customer.address}
            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="btn w-full">
          {submitting ? "Redirecting to eSewa…" : "Pay with eSewa"}
        </button>
      </form>

      {/* Hidden auto-submitting form that sends the customer to eSewa's payment page. */}
      {esewaFields && (
        <form ref={formRef} action={esewaUrl} method="POST" className="hidden">
          {Object.entries(esewaFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}
    </div>
  );
}
