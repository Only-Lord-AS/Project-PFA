"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getVendorProductsAPI, updateArticle } from "@/lib/api-client";
import { Product } from "@/lib/types";

const vendorName = "Ma Boutique";

export default function VendeurStockPage() {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [stockInputs, setStockInputs] = useState<Record<number, string>>({});


  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "vendeur") { router.replace("/login"); return; }
    loadProducts();
  }, [router]);

  function loadProducts() {
    getVendorProductsAPI().then((products) => {
      setAllProducts(products);
      const inputs: Record<number, string> = {};
      products.forEach((p) => { inputs[p.id_article] = String(p.quantite_disponible); });
      setStockInputs(inputs);
    });
  }

  async function handleSaveStock(id_article: number) {
    const newStock = parseInt(stockInputs[id_article] ?? "0", 10);
    if (isNaN(newStock) || newStock < 0) return;
    await updateArticle(id_article, { stock: String(newStock) });
    loadProducts();
  }

  const lowStockProducts = allProducts.filter((p) => p.quantite_disponible <= 5);

  return (
    <section className="space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <Link href="/dashboard/vendeur" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          ← Retour au dashboard
        </Link>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-xl shadow-sm">📦</span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Gestion du Stock</h1>
            <p className="text-sm text-slate-500">{vendorName}</p>
          </div>
        </div>
      </div>

      {/* Alertes Stock summary */}
      {lowStockProducts.length > 0 ? (
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span>⚠️</span>
            <h3 className="text-sm font-bold text-amber-800">
              Alertes Stock — {lowStockProducts.length} produit{lowStockProducts.length !== 1 ? "s" : ""} en stock critique
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.map((p) => (
              <div key={p.id_article} className="rounded-lg bg-white/70 px-3 py-2">
                <p className="text-xs font-semibold text-amber-900 line-clamp-1">{p.designation}</p>
                <p className="text-xs text-amber-700">Plus que {p.quantite_disponible} unité{p.quantite_disponible !== 1 ? "s" : ""} !</p>
              </div>
            ))}
          </div>
        </article>
      ) : (
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-700">✓ Tous vos stocks sont suffisants</p>
        </article>
      )}

      {/* Stock table */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📦</span>
          <h2 className="text-lg font-extrabold text-slate-900">Stock par produit</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-4 font-semibold text-slate-500">Produit</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Catégorie</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Stock actuel</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Statut</th>
                <th className="pb-3 font-semibold text-slate-500">Modifier stock</th>
              </tr>
            </thead>
            <tbody>
              {allProducts.map((product) => {
                return (
                  <tr key={product.id_article} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-slate-800 max-w-[180px]">
                      <Link href={`/produit/${product.id_article}`} className="line-clamp-2 leading-snug hover:text-brand-700 transition-colors">
                        {product.designation}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                        {product.famille_libelle}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-bold text-slate-700">
                      {product.quantite_disponible} unités
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        product.quantite_disponible <= 5
                          ? "bg-red-100 text-red-700"
                          : product.quantite_disponible <= 15
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {product.quantite_disponible <= 5 ? "Critique" : product.quantite_disponible <= 15 ? "Faible" : "Suffisant"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={stockInputs[product.id_article] ?? String(product.quantite_disponible)}
                          onChange={(e) =>
                            setStockInputs((prev) => ({ ...prev, [product.id_article]: e.target.value }))
                          }
                          className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-100"
                        />
                        <button
                          onClick={() => handleSaveStock(product.id_article)}
                          className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          Sauvegarder
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {allProducts.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">Aucun produit trouvé</p>
          )}
        </div>
      </article>
    </section>
  );
}
