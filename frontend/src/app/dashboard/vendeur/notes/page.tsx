"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const ratingsBreakdown = [
  { product: "Apple iPhone 15 128 Go",              rating: "4.9★", reviews: 38 },
  { product: "Sony PlayStation 5 Slim",             rating: "4.8★", reviews: 21 },
  { product: "Samsung Galaxy Tab S9",               rating: "4.7★", reviews: 29 },
  { product: "Ecouteurs Bluetooth JBL Tune 230NC",  rating: "4.7★", reviews: 54 },
  { product: "Aspirateur Robot Xiaomi S10+",        rating: "4.6★", reviews: 17 },
  { product: "Cable USB-C tressé 2m 100W",          rating: "4.5★", reviews: 89 },
  { product: "Nike Air Max Excee Homme",            rating: "4.6★", reviews: 33 },
  { product: "The Witcher 3 Complete Edition PS5",  rating: "4.8★", reviews: 12 },
];

export default function VendeurNotesPage() {
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
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-xl shadow-sm">⭐</span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Note moyenne</h1>
            <p className="text-sm text-slate-500">TechNova Store</p>
          </div>
        </div>
      </div>

      {/* KPI card */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="card-hover rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-xs text-slate-500">Note moyenne</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
              Excellent
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-brand-700">4.8★</p>
        </article>
      </div>

      {/* Ratings breakdown table */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⭐</span>
          <h2 className="text-lg font-extrabold text-slate-900">Notes par produit</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-4 font-semibold text-slate-500">Produit</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Note</th>
                <th className="pb-3 font-semibold text-slate-500">Nombre d&apos;avis</th>
              </tr>
            </thead>
            <tbody>
              {ratingsBreakdown.map((row) => (
                <tr key={row.product} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-slate-800">{row.product}</td>
                  <td className="py-3 pr-4 font-bold text-brand-700">{row.rating}</td>
                  <td className="py-3 text-slate-600">{row.reviews} avis</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
