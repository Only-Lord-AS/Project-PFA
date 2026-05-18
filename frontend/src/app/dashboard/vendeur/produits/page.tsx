"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getVendorProductsAPI, updateArticle } from "@/lib/api-client";
import { Product } from "@/lib/types";

const vendorName = "Ma Boutique";

export default function VendeurProduitsPage() {
  const router = useRouter();
  const [searchProduct, setSearchProduct] = useState("");
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "vendeur") { router.replace("/login"); return; }
    refreshProducts();
  }, [router]);

  function refreshProducts() {
    getVendorProductsAPI().then(setVendorProducts);
  }

  async function handleDelete(id_article: number) {
    if (!confirm("Supprimer ce produit ? Cette action est irréversible.")) return;
    await updateArticle(id_article, { actif: false });
    refreshProducts();
  }

  const filteredProducts = vendorProducts.filter((p) =>
    p.designation.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <section className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/vendeur" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            ← Retour au dashboard
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-xl shadow-sm">🛍️</span>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Mes Produits</h1>
              <p className="text-sm text-slate-500">{vendorName}</p>
            </div>
          </div>
        </div>
        <Link
          href="/dashboard/vendeur/ajouter-produit"
          className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
        >
          + Ajouter un produit
        </Link>
      </div>

      {/* Products table */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛍️</span>
            <h2 className="text-lg font-extrabold text-slate-900">Mes Produits</h2>
          </div>
          <input
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm"
            placeholder="Rechercher..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-4 font-semibold text-slate-500">Produit</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Catégorie</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Prix</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Stock</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Note</th>
                <th className="pb-3 font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                return (
                  <tr key={product.id_article} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-slate-800 max-w-[160px]">
                      <Link href={`/produit/${product.id_article}`} className="line-clamp-2 leading-snug hover:text-brand-700 transition-colors">
                        {product.designation}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                        {product.famille_libelle}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-bold text-brand-700">
                      {product.prix_vente.toFixed(2)} MAD
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        product.quantite_disponible <= 5
                          ? "bg-red-100 text-red-700"
                          : product.quantite_disponible <= 15
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {product.quantite_disponible} unités
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/vendeur/modifier-produit/${product.id_article}`}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id_article)}
                          className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">Aucun produit trouvé</p>
          )}
        </div>
      </article>

      {/* Stock alerts */}
      <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span>⚠️</span>
          <h3 className="text-sm font-bold text-amber-800">Alertes Stock</h3>
        </div>
        {vendorProducts.filter((p) => p.quantite_disponible <= 5).length > 0 ? (
          vendorProducts.filter((p) => p.quantite_disponible <= 5).map((p) => (
            <div key={p.id_article} className="mb-2 rounded-lg bg-white/70 px-3 py-2">
              <p className="text-xs font-semibold text-amber-900 line-clamp-1">{p.designation}</p>
              <p className="text-xs text-amber-700">Plus que {p.quantite_disponible} unité{p.quantite_disponible !== 1 ? "s" : ""} !</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-amber-700">✓ Tous vos stocks sont suffisants</p>
        )}
      </article>
    </section>
  );
}
