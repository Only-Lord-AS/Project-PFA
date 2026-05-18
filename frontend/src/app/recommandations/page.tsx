"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import { getProducts } from "@/lib/api-client";
import { Product } from "@/lib/types";

export default function RecommandationsPage() {
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [alsoBrowsed, setAlsoBrowsed] = useState<Product[]>([]);
  const [cartCategory, setCartCategory] = useState<string>("High-Tech");
  const [hasCart, setHasCart] = useState(false);

  useEffect(() => {
    getProducts().then((all) => {

    // Read cart from localStorage
    let cartCategories: string[] = [];
    try {
      const raw = localStorage.getItem("marocshop_cart");
      const cartItems: { productId: number; quantity: number }[] = raw ? JSON.parse(raw) : [];
      if (cartItems.length > 0) {
        const cartIds = cartItems.map((i) => i.productId);
        cartCategories = all
          .filter((p) => cartIds.includes(p.id_article))
          .map((p) => p.famille_libelle);
        setHasCart(true);
      }
    } catch { /* ignore */ }

    const primaryCategory = cartCategories[0] ?? "High-Tech";
    setCartCategory(primaryCategory);

    if (cartCategories.length > 0) {
      // Recommend products from same categories as cart
      const fromCart = all
        .filter((p) => cartCategories.includes(p.famille_libelle))
        .sort((a, b) => b.prix_vente - a.prix_vente)
        .slice(0, 6);
      setRecommended(fromCart);
      // Also browsed: from primary category
      setAlsoBrowsed(
        all
          .filter((p) => p.famille_libelle === primaryCategory && !fromCart.find((r) => r.id_article === p.id_article))
          .sort((a, b) => b.prix_vente - a.prix_vente)
          .slice(0, 4)
      );
    } else {
      // Fallback: featured products
      const accessoryKeywords = ["cable", "manette", "charge", "station", "ecouteurs", "écouteurs"];
      const featured = all
        .filter((p) => {
          const name = p.designation.toLowerCase();
          return p.famille_libelle === "Accessoires" || accessoryKeywords.some((kw) => name.includes(kw));
        })
        .slice(0, 6);
      setRecommended(featured.length >= 3 ? featured : all.slice(0, 6));
      setAlsoBrowsed(all.filter((p) => p.famille_libelle === "High-Tech").slice(0, 4));
    }
    });
  }, []);

  return (
    <section className="space-y-10 animate-fade-in">

      {/* Header */}
      <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-purple-50 p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-xl">🤖</span>
          <h1 className="text-2xl font-extrabold text-slate-900">Recommandations personnalisées</h1>
        </div>
        <p className="text-sm text-slate-600 ml-13">
          {hasCart
            ? <>Basé sur votre panier en{" "}<span className="font-bold text-brand-700">{cartCategory}</span>, voici nos suggestions.</>
            : <>Nos meilleures sélections du moment — <span className="font-bold text-brand-700">Accessoires &amp; High-Tech</span>.</>
          }
        </p>
      </div>

      {/* Main recommendations */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h2 className="text-xl font-extrabold text-slate-900">
            {hasCart ? "Suggestions basées sur votre panier" : "Suggestions — Câbles, accessoires & plus"}
          </h2>
        </div>
        {recommended.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((product) => (
              <ProductCard key={product.id_article} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-8 text-center">Chargement des recommandations...</p>
        )}
      </div>

      {/* Also browsed */}
      {alsoBrowsed.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">👀</span>
              <h2 className="text-xl font-extrabold text-slate-900">Dans la même catégorie — {cartCategory}</h2>
            </div>
            <Link
              href={`/categorie/${encodeURIComponent(cartCategory)}`}
              className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2"
            >
              Voir tout →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {alsoBrowsed.map((product) => {
              return (
                <div key={product.id_article} className="card-hover overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <Link href={`/produit/${product.id_article}`} className="block">
                    <img
                      src={
                        product.imageUrl.includes("unsplash.com")
                          ? `${product.imageUrl}?w=300&h=180&fit=crop&auto=format`
                          : product.imageUrl
                      }
                      alt={product.designation}
                      className="h-36 w-full object-cover"
                      onError={(e) => { e.currentTarget.src = "https://placehold.co/300x180?text=Image"; }}
                    />
                  </Link>
                  <div className="p-3">
                    <Link href={`/produit/${product.id_article}`}>
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug hover:text-brand-700 transition-colors">
                        {product.designation}
                      </h3>
                    </Link>
                    <p className="mt-1 font-extrabold text-brand-700">{product.prix_vente.toFixed(2)} MAD</p>
                    <Link
                      href={`/produit/${product.id_article}`}
                      className="mt-2 block rounded-xl bg-brand-50 py-1.5 text-center text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors"
                    >
                      Voir le produit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-700 to-purple-600 p-6 text-white text-center">
        <h3 className="text-xl font-extrabold">Vous voulez plus de choix ?</h3>
        <p className="mt-1 text-sm text-blue-100">Explorez notre catalogue complet avec plus de 2 500 produits.</p>
        <Link
          href="/catalogue"
          className="mt-4 inline-block rounded-2xl bg-white px-6 py-2.5 text-sm font-bold text-brand-700 hover:bg-blue-50 transition-colors"
        >
          🛍️ Voir tout le catalogue
        </Link>
      </div>
    </section>
  );
}
