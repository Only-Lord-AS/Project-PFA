"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const kpi = { label: "Taux de conversion", value: "3.7%", icon: "📈", trend: "+0.3%", up: true };

const funnelSteps = [
  { step: "Visiteurs",     count: 496_000, pct: 100,  convFrom: null,   icon: "🌐", color: "bg-slate-200" },
  { step: "Catalogue",     count: 148_800, pct:  30.0, convFrom: 30.0,  icon: "🛍️", color: "bg-blue-200"  },
  { step: "Panier",        count:  29_760, pct:   6.0, convFrom: 20.0,  icon: "🛒", color: "bg-purple-200"},
  { step: "Commande",      count:   5_952, pct:   1.2, convFrom: 20.0,  icon: "✅", color: "bg-amber-200" },
  { step: "Livré",         count:   5_298, pct:   1.07,convFrom: 89.0,  icon: "🚚", color: "bg-emerald-200"},
];

const monthlyConversion = [
  { month: "Nov 2025", rate: 2.9, visitors: 380_000, orders: 2_890 },
  { month: "Déc 2025", rate: 3.1, visitors: 420_000, orders: 3_410 },
  { month: "Jan 2026", rate: 3.0, visitors: 395_000, orders: 3_020 },
  { month: "Fév 2026", rate: 3.2, visitors: 415_000, orders: 3_340 },
  { month: "Mar 2026", rate: 3.4, visitors: 452_000, orders: 3_870 },
  { month: "Avr 2026", rate: 3.7, visitors: 496_000, orders: 4_291 },
];

const maxRate = Math.max(...monthlyConversion.map((r) => r.rate));

export default function ConversionPage() {
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
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Taux de conversion</h1>
          <p className="text-sm text-slate-500">Analyse du tunnel de conversion — Visiteurs vers Livraisons</p>
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
          <p className="mt-1 text-xs text-slate-500">Pourcentage de visiteurs ayant passé commande</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌐</span>
            <span className="text-xs text-slate-500">Visiteurs ce mois</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-800">496 000</p>
          <p className="mt-1 text-xs text-slate-500">+9.7% vs mars 2026</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📊</span>
            <span className="text-xs text-slate-500">Moyenne secteur</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-800">2.5%</p>
          <p className="mt-1 text-xs text-emerald-600 font-semibold">MarocShop +1.2 pts au-dessus</p>
        </article>
      </div>

      {/* Conversion funnel */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl">🔽</span>
          <h2 className="text-base font-extrabold text-slate-900">Tunnel de conversion — Avril 2026</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-6 font-semibold text-slate-500">Étape</th>
                <th className="pb-3 pr-6 font-semibold text-slate-500">Utilisateurs</th>
                <th className="pb-3 pr-6 font-semibold text-slate-500">% du total</th>
                <th className="pb-3 pr-6 font-semibold text-slate-500">Taux de passage</th>
                <th className="pb-3 font-semibold text-slate-500">Visualisation</th>
              </tr>
            </thead>
            <tbody>
              {funnelSteps.map((step, i) => (
                <tr key={step.step} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-6">
                    <div className="flex items-center gap-2">
                      <span>{step.icon}</span>
                      <span className="font-semibold text-slate-800">{step.step}</span>
                      {i === funnelSteps.length - 1 && (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700">Objectif</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-6 font-bold text-slate-800">{step.count.toLocaleString("fr-FR")}</td>
                  <td className="py-3 pr-6">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                      {step.pct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 pr-6">
                    {step.convFrom !== null ? (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        step.convFrom >= 50 ? "bg-emerald-100 text-emerald-700" :
                        step.convFrom >= 20 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {step.convFrom.toFixed(1)}% de l'étape précédente
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Point de départ</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="w-32 overflow-hidden rounded-full bg-slate-100 h-2.5">
                      <div className={`h-2.5 rounded-full ${step.color}`} style={{ width: `${step.pct}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {/* Monthly evolution */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl">📅</span>
          <h2 className="text-base font-extrabold text-slate-900">Évolution mensuelle du taux de conversion</h2>
        </div>
        <div className="space-y-3 mb-6">
          {monthlyConversion.map((row) => (
            <div key={row.month} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs font-semibold text-slate-600">{row.month}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-slate-100 h-2.5">
                <div
                  className="h-2.5 rounded-full bg-brand-700 transition-all"
                  style={{ width: `${(row.rate / maxRate) * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-bold text-brand-700">{row.rate.toFixed(1)}%</span>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto border-t border-slate-100 pt-4">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-6 font-semibold text-slate-500">Mois</th>
                <th className="pb-3 pr-6 font-semibold text-slate-500">Visiteurs</th>
                <th className="pb-3 pr-6 font-semibold text-slate-500">Commandes</th>
                <th className="pb-3 font-semibold text-slate-500">Taux</th>
              </tr>
            </thead>
            <tbody>
              {[...monthlyConversion].reverse().map((row, i) => (
                <tr key={row.month} className={`border-b border-slate-50 transition-colors ${i === 0 ? "bg-brand-50" : "hover:bg-slate-50"}`}>
                  <td className="py-3 pr-6 font-semibold text-slate-800">
                    {row.month}
                    {i === 0 && <span className="ml-2 rounded-full bg-brand-100 px-1.5 py-0.5 text-xs font-bold text-brand-700">Ce mois</span>}
                  </td>
                  <td className="py-3 pr-6 text-slate-700">{row.visitors.toLocaleString("fr-FR")}</td>
                  <td className="py-3 pr-6 text-slate-700">{row.orders.toLocaleString("fr-FR")}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      {row.rate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

    </section>
  );
}
