import Image from "next/image";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "../../../lib/supabaseClient";
import AddToCartForm from "../../../components/AddToCartForm";

export const dynamic = "force-dynamic";

async function getProduct(id) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  // PGRST116 = "no rows found" from PostgREST — a genuine 404, not a connection problem.
  if (error && error.code !== "PGRST116") throw error;
  if (error) return null;
  return data;
}

export default async function ProductPage({ params }) {
  let product;
  try {
    product = await getProduct(params.id);
  } catch (err) {
    return (
      <div className="text-center text-sm text-black/60 border border-black/10 p-8">
        Store not connected yet. See README for setup.
      </div>
    );
  }

  if (!product) return notFound();

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div className="aspect-[3/4] relative bg-black/5">
        <Image src={product.image_url} alt={product.name} fill className="object-cover" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-black/50">{product.category}</p>
        <h1 className="text-2xl font-semibold mt-1">{product.name}</h1>
        <p className="text-lg mt-2">Rs. {Number(product.price).toLocaleString()}</p>
        <p className="mt-4 text-black/70 leading-relaxed">{product.description}</p>
        <AddToCartForm product={product} />
      </div>
    </div>
  );
}
