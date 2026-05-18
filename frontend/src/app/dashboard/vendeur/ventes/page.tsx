"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const salesBreakdown: any[] = [];

export default function VendeurVentesPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "vendeur") { router.replace("/login"); return; }
  }, [router]);

  return (
    <section className="space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <Link href="/dashboard/vendeur" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          ← Retour au dashboard
        </Link>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-xl shadow-sm">💰</span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Ventes ce mois</h1>
            <p className="text-sm text-slate-500">TechNova Store</p>
          </div>
        </div>
      </div>

      {/* KPI card */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="card-hover rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-xs text-slate-500">Ventes ce mois</span>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
              0%
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-400">0 MAD</p>
        </article>
      </div>

      {/* Sales breakdown table */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📊</span>
          <h2 className="text-lg font-extrabold text-slate-900">Détail des ventes ce mois</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-4 font-semibold text-slate-500">Produit</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Quantité vendue</th>
                <th className="pb-3 font-semibold text-slate-500">Chiffre d&apos;affaires</th>
              </tr>
            </thead>
            <tbody>
              {salesBreakdown.length > 0 ? (
                salesBreakdown.map((row) => (
                  <tr key={row.product} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-slate-800">{row.product}</td>
                    <td className="py-3 pr-4 text-slate-600">{row.qty} unités</td>
                    <td className="py-3 font-bold text-brand-700">{row.revenue}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">
                    Aucune vente pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
