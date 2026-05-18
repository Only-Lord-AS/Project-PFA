"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getVendorProductsAPI, updateArticle } from "@/lib/api-client";
import { Product } from "@/lib/types";

const vendorName = "Ma Boutique";

const vendorStats = [
  { label: "Ventes ce mois",   value: "0 MAD", icon: "💰", trend: "0%",      href: "/dashboard/vendeur/ventes" },
  { label: "Commandes reçues", value: "0",         icon: "📦", trend: "0%",       href: "/dashboard/vendeur/ventes" },
  { label: "Note moyenne",     value: "N/A",        icon: "⭐", trend: "Nouveau", href: "/dashboard/vendeur" },
];

export default function VendeurDashboardPage() {
  const router = useRouter();
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [searchProduct, setSearchProduct] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "vendeur") { router.replace("/login"); return; }
    refreshProducts();
  }, [router]);

  function refreshProducts() {
    getVendorProductsAPI().then(setVendorProducts);
  }

  async function handleDelete(id_article: number) {
    if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      await updateArticle(id_article, { actif: false });
      refreshProducts();
    }
  }

  const filteredProducts = vendorProducts.filter((p) =>
    p.designation.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <section className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Dashboard Vendeur</h1>
              <p className="text-sm text-slate-500">{vendorName}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/vendeur/ajouter-produit"
            className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors shadow-sm"
          >
            + Ajouter un produit
          </Link>
          <Link
            href="/dashboard/vendeur/stock"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            📊 Gérer mon stock
          </Link>
          <Link
            href="/dashboard/vendeur/ventes"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            📊 Rapports
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vendorStats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <article className="card-hover rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-xs text-slate-500">{stat.label}</span>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                  {stat.trend}
                </span>
              </div>
              <p className="mt-3 text-2xl font-extrabold text-brand-700">{stat.value}</p>
            </article>
          </Link>
        ))}
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
                <th className="pb-3 pr-4 font-semibold text-slate-500">Actions</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Produit</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Catégorie</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Prix</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                return (
                  <tr key={product.id_article} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/vendeur/modifier-produit/${product.id_article}`}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Modifier le produit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id_article)}
                          className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                        >
                          Supprimer le produit
                        </button>
                      </div>
                    </td>
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

    </section>
  );
}
