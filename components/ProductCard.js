import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="aspect-[3/4] w-full overflow-hidden bg-black/5 relative">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="mt-3">
        <h3 className="text-sm">{product.name}</h3>
        <p className="text-sm text-black/60">Rs. {Number(product.price).toLocaleString()}</p>
      </div>
    </Link>
  );
}
