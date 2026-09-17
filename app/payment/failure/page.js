import Link from "next/link";
import { getSupabaseServerClient } from "../../../lib/supabaseClient";
import { decodeAndVerifyEsewaResponse } from "../../../lib/esewa";

export const dynamic = "force-dynamic";

export default async function PaymentFailurePage({ searchParams }) {
  const raw = searchParams?.data;

  if (raw) {
    const { payload } = decodeAndVerifyEsewaResponse(raw);
    if (payload?.transaction_uuid) {
      try {
        const supabase = getSupabaseServerClient();
        await supabase
          .from("orders")
          .update({ payment_status: "FAILED" })
          .eq("transaction_uuid", payload.transaction_uuid);
      } catch (err) {
        // Best-effort — still show the failure message either way.
      }
    }
  }

  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white text-2xl bg-red-500">
        !
      </div>
      <h1 className="text-xl font-semibold mt-6">Payment cancelled or failed</h1>
      <p className="text-black/60 mt-2">
        Your payment wasn&apos;t completed. No money was charged. You can try again from your
        cart.
      </p>
      <div className="flex gap-3 justify-center mt-8">
        <Link href="/cart" className="btn-outline">
          Back to cart
        </Link>
        <Link href="/" className="btn">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
