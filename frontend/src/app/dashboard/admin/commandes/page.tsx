"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getAdminProductsAPI,
  updateAdminProductAPI,
  deleteAdminProductAPI,
} from "@/lib/api-client";
import { Product } from "@/lib/types";

const kpi = {
  icon: "📦",
  label: "Commandes validées",
  value: "4 291",
  trend: "+8%",
  up: true,
};

const orderStats = [
  { label: "En attente", count: 312, color: "bg-amber-100 text-amber-700" },
  { label: "En préparation", count: 584, color: "bg-purple-100 text-purple-700" },
  { label: "Expédiées", count: 1203, color: "bg-orange-100 text-orange-700" },
  { label: "Livrées", count: 2192, color: "bg-emerald-100 text-emerald-700" },
];

export default function AdminCommandesPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();

    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }

    loadData();
    setMounted(true);
  }, [router]);

  async function loadData() {
    const allProducts = await getAdminProductsAPI();
    setProducts(allProducts);
  }

  async function handleToggleDisable(product: Product) {
    const newActif = !product.actif;
    const res = await updateAdminProductAPI(product.id_article, { actif: newActif });
    if (res.ok) {
      loadData();
    } else {
      alert(res.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce produit définitivement ?")) return;

    const res = await deleteAdminProductAPI(id);
    if (res.ok) {
      loadData();
    } else {
      alert(res.message);
    }
  }

  const filtered = products.filter((p) => {
    const searchValue = search.toLowerCase();

    return (
      p.designation.toLowerCase().includes(searchValue) ||
      p.famille_libelle.toLowerCase().includes(searchValue) ||
      (p.vendorName || "").toLowerCase().includes(searchValue)
    );
  });

  if (!mounted) return null;

  return (
    <section className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin"
            className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2"
          >
            ← Dashboard Admin
          </Link>

          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            Commandes & Produits
          </h1>

          <p className="text-sm text-slate-500">
            Suivi des commandes et modération des produits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
            {products.filter(p => !p.actif).length} produit{products.filter(p => !p.actif).length !== 1 ? "s" : ""} désactivé{products.filter(p => !p.actif).length !== 1 ? "s" : ""}
          </span>

          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
            {products.filter(p => p.actif).length} actif{products.filter(p => p.actif).length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* KPI + Order stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <article className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{kpi.icon}</span>
              <span className="text-xs text-slate-500">{kpi.label}</span>
            </div>

            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
              {kpi.trend}
            </span>
          </div>

          <p className="mt-3 text-2xl font-extrabold text-brand-700">{kpi.value}</p>
          <p className="mt-1 text-xs text-slate-500">Ce mois-ci, toutes plateformes</p>
        </article>

        {orderStats.map((s) => (
          <article
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs text-slate-500">{s.label}</p>

            <p className="mt-2 text-2xl font-extrabold text-slate-800">
              {s.count.toLocaleString("fr-FR")}
            </p>

            <span
              className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${s.color}`}
            >
              {((s.count / 4291) * 100).toFixed(1)}%
            </span>
          </article>
        ))}
      </div>

      {/* Product moderation table */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-slate-900">
            Modération des Produits
          </h2>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 min-w-52">
            <span className="text-slate-400">🔍</span>

            <input
              className="flex-1 bg-transparent text-sm placeholder-slate-400 outline-none"
              placeholder="Rechercher par nom, catégorie, vendeur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-4 font-semibold text-slate-500">Produit</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Vendeur</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Catégorie</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Prix</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Stock</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Statut</th>
                <th className="pb-3 font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((product) => {
                const isDisabled = !product.actif;

                return (
                  <tr
                    key={product.id_article}
                    className={`border-b border-slate-50 transition-colors ${
                      isDisabled ? "bg-slate-50 opacity-60" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="py-3 pr-4 max-w-[180px]">
                      <Link
                        href={`/produit/${product.id_article}`}
                        className="font-medium text-slate-800 line-clamp-2 leading-snug hover:text-brand-700 transition-colors"
                      >
                        {product.designation}
                      </Link>
                    </td>

                    <td className="py-3 pr-4 text-slate-600 text-xs">
                      {product.vendorName || "Marketplace"}
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
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          product.quantite_disponible === 0
                            ? "bg-red-100 text-red-700"
                            : product.quantite_disponible <= 5
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {product.quantite_disponible}
                      </span>
                    </td>

                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          isDisabled
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isDisabled ? "Désactivé" : "Actif"}
                      </span>
                    </td>

                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleDisable(product)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                            isDisabled
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          {isDisabled ? "Activer" : "Désactiver"}
                        </button>

                        <button
                          onClick={() => handleDelete(product.id_article)}
                          className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                          title="Supprime définitivement"
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

          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              Aucun produit trouvé
            </p>
          )}
        </div>
      </article>
    </section>
  );
}