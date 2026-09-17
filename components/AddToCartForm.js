"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";

export default function AddToCartForm({ product }) {
  const sizes = product.sizes.split(",").map((s) => s.trim());
  const [size, setSize] = useState(sizes[0]);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  function handleAdd() {
    addItem(product, size, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addItem(product, size, 1);
    router.push("/cart");
  }

  return (
    <div className="mt-6">
      <p className="text-sm uppercase tracking-wide mb-2">Size</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSize(s)}
            className={`px-4 py-2 border text-sm ${
              size === s ? "bg-ink text-white border-ink" : "border-black/20 hover:border-ink"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={handleAdd} className="btn-outline">
          {added ? "Added ✓" : "Add to cart"}
        </button>
        <button type="button" onClick={handleBuyNow} className="btn">
          Buy now
        </button>
      </div>
    </div>
  );
}
