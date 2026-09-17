import Link from "next/link";
import { getSupabaseServerClient } from "../lib/supabaseClient";
import ProductCard from "../components/ProductCard";

export const dynamic = "force-dynamic";

const CATEGORIES = ["All", "T-Shirts", "Hoodies", "Jackets", "Jeans", "Dresses", "Footwear"];

async function getProducts(category) {
  const supabase = getSupabaseServerClient();
  let query = supabase.from("products").select("*").order("id", { ascending: true });
  if (category && category !== "All") {
    query = query.eq("category", category);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export default async function HomePage({ searchParams }) {
  const category = searchParams?.category || "All";

  let products = [];
  let loadError = null;
  try {
    products = await getProducts(category);
  } catch (err) {
    loadError = err.message || "Could not load products.";
  }

  return (
    <div>
      <section className="mb-10 text-center py-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Everyday clothing, made simple.
        </h1>
        <p className="mt-3 text-black/60 max-w-xl mx-auto">
          A small clothing brand storefront — browse the catalog and check out
          with eSewa.
        </p>
      </section>

      <nav className="flex flex-wrap gap-3 justify-center mb-10 text-sm uppercase tracking-wide">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={c === "All" ? "/" : `/?category=${encodeURIComponent(c)}`}
            className={`px-4 py-2 border ${
              c === category ? "bg-ink text-white border-ink" : "border-black/20 hover:border-ink"
            }`}
          >
            {c}
          </Link>
        ))}
      </nav>

      {loadError ? (
        <div className="text-center text-sm text-black/60 border border-black/10 p-8">
          <p className="font-medium mb-1">Store not connected yet.</p>
          <p>
            Set <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> in your
            environment (see README) and run <code>supabase/schema.sql</code> in your Supabase
            project&apos;s SQL editor.
          </p>
          <p className="mt-2 text-black/40">({loadError})</p>
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-black/60">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
