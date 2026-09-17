"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "../../components/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-black/60 mb-6">Your cart is empty.</p>
        <Link href="/" className="btn">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2 space-y-6">
        {items.map((item) => (
          <div key={item.key} className="flex gap-4 border-b border-black/10 pb-6">
            <div className="w-24 h-32 relative bg-black/5 flex-shrink-0">
              <Image src={item.image_url} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-black/50">Size: {item.size}</p>
                </div>
                <p className="text-sm">Rs. {(item.price * item.quantity).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button
                  className="w-8 h-8 border border-black/20"
                  onClick={() => updateQuantity(item.key, item.quantity - 1)}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  className="w-8 h-8 border border-black/20"
                  onClick={() => updateQuantity(item.key, item.quantity + 1)}
                >
                  +
                </button>
                <button
                  className="ml-4 text-xs uppercase text-black/50 hover:text-accent"
                  onClick={() => removeItem(item.key)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-black/10 p-6 h-fit">
        <div className="flex justify-between text-sm mb-2">
          <span>Subtotal</span>
          <span>Rs. {subtotal.toLocaleString()}</span>
        </div>
        <p className="text-xs text-black/50 mb-6">Delivery charge calculated at checkout.</p>
        <Link href="/checkout" className="btn w-full text-center block">
          Checkout
        </Link>
      </div>
    </div>
  );
}
