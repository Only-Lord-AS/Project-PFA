"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/api-client";
import { Product } from "@/lib/types";
import { ProductImage } from "@/components/product-image";

type ClientProductGridProps = {
  sliceStart?: number;
  count: number;
  columns?: "3" | "4";
};

export function ClientProductGrid({ sliceStart = 0, count, columns = "3" }: ClientProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then((all) => {
      setProducts(all.slice(sliceStart, sliceStart + count));
    });
  }, [sliceStart, count]);

  const gridClass = columns === "4"
    ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={gridClass}>
      {products.map((product) => {
        return (
          <div key={product.id_article} className="card-hover overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Link href={`/produit/${product.id_article}`} className="relative block">
              <ProductImage
                src={
                  !product.imageUrl
                    ? "https://placehold.co/400x240?text=Image"
                    : product.imageUrl.includes("unsplash.com")
                    ? `${product.imageUrl}?w=400&h=240&fit=crop&auto=format`
                    : product.imageUrl
                }
                alt={product.designation}
                className="h-44 w-full object-cover"
              />
              <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-md">
                {product.famille_libelle}
              </span>
            </Link>
            <div className="p-4">
              <Link href={`/produit/${product.id_article}`}>
                <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 hover:text-brand-700 transition-colors">
                  {product.designation}
                </h3>
              </Link>
              {product.vendorName && (
                <p className="mt-1 text-xs text-slate-500">
                  🏪 Vendu par <span className="font-semibold text-slate-700">{product.vendorName}</span>
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xl font-extrabold text-brand-700">{product.prix_vente.toFixed(2)} MAD</p>
                <Link
                  href={`/produit/${product.id_article}`}
                  className="rounded-xl bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-800 transition-colors"
                >
                  Voir →
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
