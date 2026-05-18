"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { getArticle, logArticleVisit } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth";
import { SimilarProducts } from "@/components/similar-products";
import { Product } from "@/lib/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const id = Number(params.id);
    getArticle(id).then((found) => {
      if (!found) { router.replace("/catalogue"); return; }
      setProduct(found);
      
      // Log the visit for the Recommendation engine if user is logged in
      const user = getCurrentUser();
      if (user) {
        logArticleVisit(id, 60); // simulated 60s visit
      }
    });
  }, [params.id, router]);

  if (!product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-500">Chargement...</p>
      </div>
    );
  }

  const isOutOfStock = product.quantite_disponible === 0;

  function handleAdd() {
    addItem(product!.id_article, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <section className="space-y-10 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700 transition-colors">Accueil</Link>
        <span>/</span>
        <Link href="/catalogue" className="hover:text-brand-700 transition-colors">Catalogue</Link>
        <span>/</span>
        <Link
          href={`/categorie/${encodeURIComponent(product.famille_libelle)}`}
          className="hover:text-brand-700 transition-colors"
        >
          {product.famille_libelle}
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800 line-clamp-1">{product.designation}</span>
      </nav>

      {/* Main product block */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <img
            src={
              !product.imageUrl
                ? "https://placehold.co/700x500?text=Image"
                : product.imageUrl.includes("unsplash.com")
                ? `${product.imageUrl}?w=700&h=500&fit=crop&auto=format`
                : product.imageUrl
            }
            alt={product.designation}
            className="h-80 w-full object-cover lg:h-[420px]"
            onError={(e) => { e.currentTarget.src = "https://placehold.co/700x500?text=Image"; }}
          />
          <span className="absolute left-4 top-4 rounded-full bg-brand-700 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-sm">
            {product.famille_libelle}
          </span>
          {isOutOfStock && (
            <span className="absolute right-4 top-4 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
              Rupture de stock
            </span>
          )}
          {!isOutOfStock && product.quantite_disponible <= 5 && (
            <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 animate-pulse">
              Plus que {product.quantite_disponible} unité{product.quantite_disponible > 1 ? "s" : ""} !
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          {/* Name + vendor */}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{product.designation}</h1>
            {product.vendorName && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                🏪 Vendu par <span className="font-bold text-slate-800">{product.vendorName}</span>
              </p>
            )}
          </div>

          {/* Price */}
          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4">
            <p className="text-3xl font-extrabold text-brand-700">{product.prix_vente.toFixed(2)} MAD</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {product.quantite_disponible > 0
                ? `${product.quantite_disponible} unité${product.quantite_disponible > 1 ? "s" : ""} en stock`
                : "Produit actuellement indisponible"}
            </p>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-extrabold text-slate-700">Description</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity + add to cart */}
          {!isOutOfStock && (
            <div className="flex items-center gap-3">
              <div className="flex overflow-hidden rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="qty-btn flex h-11 w-11 items-center justify-center text-lg font-bold text-slate-500 hover:bg-slate-100"
                >
                  −
                </button>
                <span className="flex w-12 items-center justify-center font-bold text-slate-800">
                  {qty}
                </span>
          <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.quantite_disponible, q + 1))}
                  className="qty-btn flex h-11 w-11 items-center justify-center text-lg font-bold text-slate-500 hover:bg-slate-100"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-bold text-white transition-all ${
                  added ? "bg-emerald-500 scale-95" : "bg-blue-500 hover:bg-blue-600 hover:shadow-md active:scale-95"
                }`}
              >
                {added ? "✓ Ajouté au panier !" : "🛒 Ajouter au panier"}
              </button>
            </div>
          )}

          {isOutOfStock && (
            <div className="rounded-xl bg-slate-100 py-3 text-center text-sm font-semibold text-slate-500">
              Produit indisponible
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            <div><div className="text-base">🔒</div>Paiement sécurisé</div>
            <div><div className="text-base">↩️</div>Retour 30 jours</div>
            <div><div className="text-base">🚚</div>Livraison rapide</div>
          </div>
        </div>
      </div>

      {/* Similar products */}
      <div className="border-t border-slate-200 pt-8">
        <SimilarProducts
          excludeIds={[product.id_article]}
          categories={[product.famille_libelle]}
          title="Produits Similaires"
        />
      </div>
    </section>
  );
}
