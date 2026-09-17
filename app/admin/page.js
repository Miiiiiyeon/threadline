import { cookies } from "next/headers";
import { getSupabaseServerClient } from "../../lib/supabaseClient";
import AdminLoginForm from "../../components/AdminLoginForm";

export const dynamic = "force-dynamic";

async function getOrders() {
  const supabase = getSupabaseServerClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return orders;
}

const STATUS_STYLES = {
  COMPLETE: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  FAILED: "bg-red-100 text-red-800"
};

export default async function AdminPage() {
  const isAuthed = cookies().get("threadline_admin")?.value === "granted";

  if (!isAuthed) {
    return <AdminLoginForm />;
  }

  let orders = [];
  let loadError = null;
  try {
    orders = await getOrders();
  } catch (err) {
    loadError = err.message;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Orders</h1>

      {loadError ? (
        <p className="text-sm text-black/60">Could not load orders: {loadError}</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-black/60">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-black/10 p-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="font-medium">
                    #{order.id} — {order.customer_name}
                  </p>
                  <p className="text-xs text-black/50">
                    {order.email} · {order.phone}
                  </p>
                  <p className="text-xs text-black/50">{order.address}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      STATUS_STYLES[order.payment_status] || "bg-black/10"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                  <p className="text-sm mt-1">Rs. {Number(order.total_amount).toLocaleString()}</p>
                </div>
              </div>
              <ul className="mt-3 text-sm text-black/70 space-y-1">
                {order.order_items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.product_name} ({item.size}) — Rs.{" "}
                    {Number(item.price * item.quantity).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
