"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { CategorySidebar, CATEGORIES } from "@/components/sidebar";
import { getProducts } from "@/lib/api-client";
import { Product } from "@/lib/types";
import { SimilarProducts } from "@/components/similar-products";

const sortOptions = [
  { value: "default",    label: "Pertinence" },
  { value: "price-asc",  label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
];

export default function CategoryPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

  const [query, setQuery]   = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setAllProducts).catch(console.error);
  }, []);

  const catConfig = CATEGORIES.find((c) => c.slug === slug);

  const filtered = useMemo(() => {
    let result = allProducts.filter((p) => p.famille_libelle === slug);

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.designation.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-asc":  result = [...result].sort((a, b) => a.prix_vente - b.prix_vente); break;
      case "price-desc": result = [...result].sort((a, b) => b.prix_vente - a.prix_vente); break;
    }

    return result;
  }, [slug, query, sortBy, allProducts]);

  const filteredIds = filtered.map((p) => p.id_article);

  return (
    <div className="flex gap-6 items-start">
      <CategorySidebar activeCategory={slug} />

      <section className="flex-1 min-w-0 space-y-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-brand-700 transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/catalogue" className="hover:text-brand-700 transition-colors">Catalogue</Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">{slug}</span>
        </nav>

        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {catConfig && (
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${catConfig.bg}`}
              >
                {catConfig.icon}
              </span>
            )}
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{slug}</h1>
              <p className="text-sm text-slate-500">{filtered.length} produit{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-1 min-w-48 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-slate-400">🔍</span>
            <input
              className="flex-1 bg-transparent text-sm placeholder-slate-400"
              placeholder={`Rechercher dans ${slug}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-100"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Products */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <div className="text-5xl">{catConfig?.icon ?? "😕"}</div>
            <p className="mt-4 text-lg font-semibold text-slate-700">
              {query ? "Aucun résultat" : "Aucun produit dans cette catégorie"}
            </p>
            <div className="mt-4 flex justify-center gap-3">
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
                >
                  Effacer la recherche
                </button>
              )}
              <Link href="/catalogue" className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
                Voir tout le catalogue
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id_article} product={product} />
            ))}
          </div>
        )}

        {/* Similar products from other categories */}
        {filtered.length > 0 && (
          <div className="border-t border-slate-200 pt-8">
            <SimilarProducts
              excludeIds={filteredIds}
              title="D'autres produits qui pourraient vous intéresser"
            />
          </div>
        )}
      </section>
    </div>
  );
}
