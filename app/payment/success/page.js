import Link from "next/link";
import { getSupabaseServerClient } from "../../../lib/supabaseClient";
import { decodeAndVerifyEsewaResponse, checkEsewaTransactionStatus } from "../../../lib/esewa";

export const dynamic = "force-dynamic";

async function finalizeOrder(payload) {
  const supabase = getSupabaseServerClient();

  // Defense in depth: don't just trust the redirect payload — ask eSewa's
  // own status API to confirm independently before marking the order paid.
  let confirmedStatus = "FAILED";
  if (payload.status === "COMPLETE") {
    try {
      const statusCheck = await checkEsewaTransactionStatus({
        totalAmount: payload.total_amount,
        transactionUuid: payload.transaction_uuid
      });
      confirmedStatus = statusCheck.status === "COMPLETE" ? "COMPLETE" : "FAILED";
    } catch (err) {
      // If the status API can't be reached, fall back to the (already
      // signature-verified) redirect payload rather than blocking the order.
      confirmedStatus = "COMPLETE";
    }
  }
  const status = confirmedStatus;

  const { data: order, error } = await supabase
    .from("orders")
    .update({ payment_status: status, payment_ref: payload.transaction_code || null })
    .eq("transaction_uuid", payload.transaction_uuid)
    .select()
    .single();

  if (error) throw error;
  return { order, status };
}

export default async function PaymentSuccessPage({ searchParams }) {
  const raw = searchParams?.data;

  if (!raw) {
    return (
      <Result
        heading="No payment data received"
        message="This page is meant to be reached only as a redirect back from eSewa."
        ok={false}
      />
    );
  }

  const { valid, payload, error: decodeError } = decodeAndVerifyEsewaResponse(raw);

  if (decodeError || !payload) {
    return (
      <Result heading="Could not read payment response" message={decodeError} ok={false} />
    );
  }

  if (!valid) {
    return (
      <Result
        heading="Signature verification failed"
        message="The payment response could not be verified as authentic. No order was marked as paid."
        ok={false}
      />
    );
  }

  try {
    const { order, status } = await finalizeOrder(payload);

    if (status !== "COMPLETE") {
      return (
        <Result
          heading="Payment not completed"
          message={`eSewa reported status: ${payload.status}`}
          ok={false}
        />
      );
    }

    return (
      <Result
        heading="Payment successful"
        message={`Order #${order.id} is confirmed. A confirmation would normally be emailed to ${order.email}.`}
        detail={`Transaction ref: ${payload.transaction_code}`}
        ok={true}
      />
    );
  } catch (err) {
    return (
      <Result
        heading="Payment verified, but we couldn't update the order"
        message={err.message}
        ok={false}
      />
    );
  }
}

function Result({ heading, message, detail, ok }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div
        className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white text-2xl ${
          ok ? "bg-green-600" : "bg-red-500"
        }`}
      >
        {ok ? "✓" : "!"}
      </div>
      <h1 className="text-xl font-semibold mt-6">{heading}</h1>
      <p className="text-black/60 mt-2">{message}</p>
      {detail && <p className="text-black/40 text-xs mt-2">{detail}</p>}
      <Link href="/" className="btn mt-8 inline-block">
        Back to shop
      </Link>
    </div>
  );
}
