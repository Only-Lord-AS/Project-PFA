"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { CategorySidebar } from "@/components/sidebar";
import { getProducts } from "@/lib/api-client";
import { Product } from "@/lib/types";

const sortOptions = [
  { value: "default",    label: "Pertinence" },
  { value: "price-asc",  label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "stock",      label: "En stock" },
];

function CatalogueContent() {
  const searchParams = useSearchParams();
  const [query, setQuery]   = useState(searchParams.get("q") ?? "");
  const [sortBy, setSortBy] = useState("default");
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setAllProducts).catch(console.error);
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...allProducts];

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.designation.toLowerCase().includes(q) ||
          p.famille_libelle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.vendorName.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-asc":  result.sort((a, b) => a.prix_vente - b.prix_vente); break;
      case "price-desc": result.sort((a, b) => b.prix_vente - a.prix_vente); break;
      case "stock":      result.sort((a, b) => b.quantite_disponible - a.quantite_disponible); break;
    }

    return result;
  }, [query, sortBy, allProducts]);

  return (
    <div className="flex gap-6 items-start">
      {/* Sidebar */}
      <CategorySidebar activeCategory="Tous" />

      {/* Main content */}
      <section className="flex-1 min-w-0 space-y-5">

        {/* Page title + count */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Catalogue Produits</h1>
            <p className="text-sm text-slate-500">Découvrez toute notre sélection de produits</p>
          </div>
          <span className="rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700 border border-brand-200">
            {filtered.length} produit{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-1 min-w-52 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-slate-400">🔍</span>
            <input
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400"
              placeholder="Rechercher par nom, catégorie, marque..."
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
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-300 transition-colors focus:ring-2 focus:ring-brand-100"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <div className="text-5xl">😕</div>
            <p className="mt-4 text-lg font-semibold text-slate-700">Aucun produit trouvé</p>
            <p className="mt-1 text-sm text-slate-500">
              Essayez d'autres mots-clés ou{" "}
              <button onClick={() => setQuery("")} className="text-brand-700 font-semibold hover:underline">
                effacez la recherche
              </button>
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id_article} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense>
      <CatalogueContent />
    </Suspense>
  );
}
