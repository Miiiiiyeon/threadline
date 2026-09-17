"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export default function Navbar() {
  const { count } = useCart();

  return (
    <header className="border-b border-black/10 bg-cream sticky top-0 z-10">
      <div className="container-page flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-semibold tracking-widest uppercase">
          Threadline
        </Link>
        <nav className="flex items-center gap-6 text-sm uppercase tracking-wide">
          <Link href="/">Shop</Link>
          <Link href="/cart" className="relative">
            Cart
            {count > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-accent text-white rounded-full align-middle">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
