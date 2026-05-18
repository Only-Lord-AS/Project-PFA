"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/api-client";
import { Product } from "@/lib/types";
import { ProductImage } from "@/components/product-image";

type SimilarProductsProps = {
  excludeIds?: number[];
  categories?: string[];   // famille_libelle values
  title?: string;
};

export function SimilarProducts({
  excludeIds = [],
  categories = [],
  title = "Vous pourriez aussi aimer",
}: SimilarProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then((all) => {
      const byCategory = all
        .filter((p) => !excludeIds.includes(p.id_article))
        .filter((p) => categories.length === 0 || categories.includes(p.famille_libelle))
        .slice(0, 4);

      const fallback = all
        .filter((p) => !excludeIds.includes(p.id_article))
        .slice(0, 4);

      setProducts(byCategory.length >= 2 ? byCategory : fallback);
    });
  }, [excludeIds.join(","), categories.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  if (products.length === 0) return null;

  return (
    <section className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-100 text-lg">💡</div>
        <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          return (
            <div
              key={product.id_article}
              className="card-hover overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <Link href={`/produit/${product.id_article}`} className="relative block">
                <ProductImage
                  src={
                    !product.imageUrl
                      ? "https://placehold.co/300x180?text=Image"
                      : product.imageUrl.includes("unsplash.com")
                      ? `${product.imageUrl}?w=300&h=180&fit=crop&auto=format`
                      : product.imageUrl
                  }
                  alt={product.designation}
                  className="h-36 w-full object-cover"
                />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-md">
                  {product.famille_libelle}
                </span>
              </Link>
              <div className="p-3">
                <Link href={`/produit/${product.id_article}`}>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 hover:text-brand-700 transition-colors">
                    {product.designation}
                  </h3>
                </Link>
                {product.vendorName && (
                  <p className="mt-1 text-xs text-slate-500">
                    🏪 <span className="font-semibold text-slate-600">{product.vendorName}</span>
                  </p>
                )}
                <p className="mt-1 text-base font-extrabold text-brand-700">
                  {product.prix_vente.toFixed(2)} MAD
                </p>
                <Link
                  href={`/produit/${product.id_article}`}
                  className="mt-2 block rounded-xl bg-brand-50 py-1.5 text-center text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  Voir le produit →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
