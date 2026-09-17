import crypto from "crypto";

/**
 * eSewa ePay v2 (sandbox) integration helpers.
 * Docs: https://developer.esewa.com.np/pages/Epay#introduction
 *
 * Flow:
 *  1. We build a small set of fields and sign a subset of them (signed_field_names)
 *     with HMAC-SHA256 using the merchant secret key, base64-encoded.
 *  2. We render a form that auto-submits (POST) to eSewa's payment URL with all
 *     fields + the signature. The customer completes payment on eSewa's site.
 *  3. eSewa redirects back to our success_url / failure_url. On success, a
 *     base64-encoded JSON payload is appended as ?data=... — we decode it and
 *     re-verify the signature before trusting it.
 */

function sign(message, secretKey) {
  return crypto.createHmac("sha256", secretKey).update(message).digest("base64");
}

/**
 * Build the full field set + signature needed for the eSewa payment form.
 */
export function buildEsewaPaymentFields({
  amount,
  taxAmount = 0,
  serviceCharge = 0,
  deliveryCharge = 0,
  totalAmount,
  transactionUuid,
  successUrl,
  failureUrl
}) {
  const productCode = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
  const secretKey = process.env.ESEWA_SECRET_KEY;

  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const signature = sign(message, secretKey);

  return {
    amount: String(amount),
    tax_amount: String(taxAmount),
    total_amount: String(totalAmount),
    transaction_uuid: transactionUuid,
    product_code: productCode,
    product_service_charge: String(serviceCharge),
    product_delivery_charge: String(deliveryCharge),
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: signedFieldNames,
    signature
  };
}

/**
 * Decode the base64 `data` query param eSewa appends on the success redirect,
 * and verify its signature was really produced by eSewa using our secret key.
 * Returns { valid, payload }.
 */
export function decodeAndVerifyEsewaResponse(base64Data) {
  const secretKey = process.env.ESEWA_SECRET_KEY;
  let payload;
  try {
    const json = Buffer.from(base64Data, "base64").toString("utf-8");
    payload = JSON.parse(json);
  } catch (err) {
    return { valid: false, payload: null, error: "Could not decode eSewa response" };
  }

  const fieldNames = (payload.signed_field_names || "").split(",");
  const message = fieldNames.map((f) => `${f}=${payload[f]}`).join(",");
  const expectedSignature = sign(message, secretKey);

  const valid = expectedSignature === payload.signature;
  return { valid, payload };
}

/**
 * Defense-in-depth: independently ask eSewa's server-to-server status API
 * whether a transaction really completed, instead of trusting the redirect
 * alone. eSewa recommends this to guard against a tampered/replayed
 * redirect. Returns the raw status payload, e.g. { status: "COMPLETE", ... }.
 */
export async function checkEsewaTransactionStatus({ totalAmount, transactionUuid }) {
  const productCode = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
  const base = process.env.ESEWA_STATUS_CHECK_URL;
  const url = `${base}?product_code=${encodeURIComponent(productCode)}&total_amount=${encodeURIComponent(
    totalAmount
  )}&transaction_uuid=${encodeURIComponent(transactionUuid)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`eSewa status check failed with HTTP ${res.status}`);
  }
  return res.json();
}
