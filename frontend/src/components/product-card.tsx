"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

type ProductCardProps = {
  product: Product;
  onAdd?: (productId: number) => void;
};

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAdd() {
    addItem(product.id_article, qty);
    if (onAdd) onAdd(product.id_article);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const isOutOfStock = product.quantite_disponible === 0;

  return (
    <article className="card-hover flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-fade-in">
      {/* Image — clickable */}
      <Link href={`/produit/${product.id_article}`} className="relative overflow-hidden block">
        <img
          src={
            !product.imageUrl
              ? "https://placehold.co/400x250?text=Image"
              : product.imageUrl.includes("unsplash.com")
              ? `${product.imageUrl}?w=400&h=250&fit=crop&auto=format`
              : product.imageUrl
          }
          alt={product.designation}
          className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => { e.currentTarget.src = "https://placehold.co/400x250?text=Image"; }}
        />
        {/* Category badge */}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-md">
          {product.famille_libelle}
        </span>
        {/* Stock badge */}
        <span
          className={`absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-sm ${
            isOutOfStock
              ? "bg-red-100 text-red-700"
              : product.quantite_disponible <= 5
              ? "bg-amber-100 text-amber-700"
              : "bg-white/90 text-slate-700"
          }`}
        >
          {isOutOfStock ? "Rupture" : `Stock : ${product.quantite_disponible}`}
        </span>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          <Link href={`/produit/${product.id_article}`}>
            <h3 className="font-semibold leading-snug text-slate-900 line-clamp-2 hover:text-brand-700 transition-colors">{product.designation}</h3>
          </Link>
          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{product.description}</p>
        </div>

        {/* Vendor name (Amazon-style) */}
        {product.vendorName && (
          <p className="text-xs text-slate-500">
            🏪 Vendu par <span className="font-semibold text-slate-700">{product.vendorName}</span>
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <p className="text-xl font-extrabold text-brand-700">{product.prix_vente.toFixed(2)} MAD</p>
          {product.quantite_disponible <= 5 && product.quantite_disponible > 0 && (
            <span className="animate-pulse-soft text-xs font-medium text-amber-600">
              Dernières unités !
            </span>
          )}
        </div>

        {/* Qty controls + add button */}
        <div className="mt-auto flex items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={isOutOfStock}
              className="qty-btn w-9 text-center text-lg font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-40"
            >
              −
            </button>
            <span className="flex w-9 items-center justify-center text-sm font-bold text-slate-800">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(product.quantite_disponible, q + 1))}
              disabled={isOutOfStock}
              className="qty-btn w-9 text-center text-lg font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-bold text-white transition-all ${
              added
                ? "bg-emerald-500 scale-95"
                : isOutOfStock
                ? "cursor-not-allowed bg-slate-300"
                : "bg-blue-500 hover:bg-blue-600 hover:shadow-md active:scale-95"
            }`}
          >
            {added ? <>✓ Ajouté !</> : isOutOfStock ? <>Indisponible</> : <>🛒 Ajouter</>}
          </button>
        </div>
      </div>
    </article>
  );
}
