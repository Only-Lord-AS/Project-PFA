"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const kpi = { label: "Chiffre d'affaires", value: "1 842 000 MAD", icon: "💰", trend: "+12%", up: true };

const monthlyData = [
  { month: "Novembre 2025", ca: 1_120_000, growth: null,    orders: 2_890, avgOrder: 387 },
  { month: "Décembre 2025", ca: 1_380_000, growth: +23.2,   orders: 3_410, avgOrder: 405 },
  { month: "Janvier 2026",  ca: 1_190_000, growth:  -13.8,  orders: 3_020, avgOrder: 394 },
  { month: "Février 2026",  ca: 1_310_000, growth:  +10.1,  orders: 3_340, avgOrder: 392 },
  { month: "Mars 2026",     ca: 1_560_000, growth:  +19.1,  orders: 3_870, avgOrder: 403 },
  { month: "Avril 2026",    ca: 1_842_000, growth:  +18.1,  orders: 4_291, avgOrder: 429 },
];

const maxCA = Math.max(...monthlyData.map((r) => r.ca));

const topCategories = [
  { name: "High-Tech",             ca: 712_000, pct: 38.7 },
  { name: "Consoles & Jeux Vidéo", ca: 368_400, pct: 20.0 },
  { name: "Électronique",          ca: 276_300, pct: 15.0 },
  { name: "Maison & Cuisine",      ca: 184_200, pct: 10.0 },
  { name: "Autres",                ca: 301_100, pct: 16.3 },
];

export default function ChiffreAffairesPage() {
  const router = useRouter();
  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") router.replace("/login");
  }, [router]);

  return (
    <section className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/admin" className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2">
            ← Dashboard Admin
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Chiffre d'affaires</h1>
          <p className="text-sm text-slate-500">Revenus de la plateforme — évolution et répartition</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
          {kpi.trend} vs mois précédent
        </span>
      </div>

      {/* KPI card */}
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{kpi.icon}</span>
              <span className="text-xs text-slate-500">{kpi.label}</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{kpi.trend}</span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-brand-700">{kpi.value}</p>
          <p className="mt-1 text-xs text-slate-500">Total des ventes réalisées sur la plateforme ce mois-ci</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎯</span>
            <span className="text-xs text-slate-500">Objectif mensuel</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-700">2 000 000 MAD</p>
          <div className="mt-3 overflow-hidden rounded-full bg-slate-100 h-2">
            <div className="h-2 rounded-full bg-brand-700" style={{ width: "92.1%" }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">92.1% de l'objectif atteint</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🧾</span>
            <span className="text-xs text-slate-500">Panier moyen (Avr.)</span>
          </div>
          <p className="text-2xl font-extrabold text-brand-700">429 MAD</p>
          <p className="mt-1 text-xs text-slate-500">+6.4% par rapport à mars</p>
        </article>
      </div>

      {/* Monthly bar chart */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl">📊</span>
          <h2 className="text-base font-extrabold text-slate-900">Évolution mensuelle du chiffre d'affaires</h2>
        </div>
        <div className="space-y-3">
          {monthlyData.map((row) => (
            <div key={row.month} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-xs font-semibold text-slate-600">{row.month}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-slate-100 h-3">
                <div
                  className="h-3 rounded-full bg-brand-700 transition-all"
                  style={{ width: `${Math.round((row.ca / maxCA) * 100)}%` }}
                />
              </div>
              <span className="w-32 shrink-0 text-right text-xs font-bold text-slate-700">
                {row.ca.toLocaleString("fr-FR")} MAD
              </span>
              {row.growth !== null && (
                <span className={`w-14 shrink-0 text-right text-xs font-bold ${row.growth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {row.growth >= 0 ? "+" : ""}{row.growth.toFixed(1)}%
                </span>
              )}
              {row.growth === null && <span className="w-14 shrink-0" />}
            </div>
          ))}
        </div>
      </article>

      {/* Monthly detail table */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📅</span>
          <h2 className="text-base font-extrabold text-slate-900">Tableau récapitulatif mensuel</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-6 font-semibold text-slate-500">Mois</th>
                <th className="pb-3 pr-6 font-semibold text-slate-500">Chiffre d'affaires</th>
                <th className="pb-3 pr-6 font-semibold text-slate-500">Évolution</th>
                <th className="pb-3 pr-6 font-semibold text-slate-500">Commandes</th>
                <th className="pb-3 font-semibold text-slate-500">Panier moyen</th>
              </tr>
            </thead>
            <tbody>
              {[...monthlyData].reverse().map((row, i) => (
                <tr key={row.month} className={`border-b border-slate-50 transition-colors ${i === 0 ? "bg-brand-50" : "hover:bg-slate-50"}`}>
                  <td className="py-3 pr-6 font-semibold text-slate-800">
                    {row.month}
                    {i === 0 && <span className="ml-2 rounded-full bg-brand-100 px-1.5 py-0.5 text-xs font-bold text-brand-700">Ce mois</span>}
                  </td>
                  <td className="py-3 pr-6 font-bold text-brand-700">{row.ca.toLocaleString("fr-FR")} MAD</td>
                  <td className="py-3 pr-6">
                    {row.growth !== null ? (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.growth >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {row.growth >= 0 ? "+" : ""}{row.growth.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-6 text-slate-700">{row.orders.toLocaleString("fr-FR")}</td>
                  <td className="py-3 text-slate-700">{row.avgOrder} MAD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {/* Top categories */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🗂️</span>
          <h2 className="text-base font-extrabold text-slate-900">Répartition par catégorie (Avr. 2026)</h2>
        </div>
        <div className="space-y-3">
          {topCategories.map((cat) => (
            <div key={cat.name} className="flex items-center gap-3">
              <span className="w-44 shrink-0 text-xs font-semibold text-slate-700">{cat.name}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-slate-100 h-2.5">
                <div className="h-2.5 rounded-full bg-brand-700" style={{ width: `${cat.pct}%` }} />
              </div>
              <span className="w-28 shrink-0 text-right text-xs font-bold text-slate-700">
                {cat.ca.toLocaleString("fr-FR")} MAD
              </span>
              <span className="w-10 shrink-0 text-right text-xs text-slate-400">{cat.pct}%</span>
            </div>
          ))}
        </div>
      </article>

    </section>
  );
}
