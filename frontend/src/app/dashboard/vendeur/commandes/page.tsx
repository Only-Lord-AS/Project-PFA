"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const allOrders = [
  { id: "#ORD-8821", product: "Apple iPhone 15 128 Go",                qty: 1, total: "7 990 MAD",  status: "En attente", statusColor: "bg-amber-100 text-amber-700" },
  { id: "#ORD-8820", product: "Cable USB-C tressé 2m 100W",            qty: 3, total: "387 MAD",    status: "Livré",      statusColor: "bg-emerald-100 text-emerald-700" },
  { id: "#ORD-8819", product: "Sony PlayStation 5 Slim",               qty: 1, total: "6 490 MAD",  status: "En cours",   statusColor: "bg-blue-100 text-blue-700" },
  { id: "#ORD-8818", product: "Ecouteurs Bluetooth JBL Tune 230NC",    qty: 1, total: "790 MAD",    status: "Livré",      statusColor: "bg-emerald-100 text-emerald-700" },
  { id: "#ORD-8815", product: "Samsung Galaxy Tab S9",                 qty: 1, total: "7 890 MAD",  status: "En attente", statusColor: "bg-amber-100 text-amber-700" },
  { id: "#ORD-8812", product: "The Witcher 3 Complete Edition PS5",    qty: 2, total: "798 MAD",    status: "Livré",      statusColor: "bg-emerald-100 text-emerald-700" },
  { id: "#ORD-8809", product: "Aspirateur Robot Xiaomi S10+",          qty: 1, total: "3 190 MAD",  status: "En cours",   statusColor: "bg-blue-100 text-blue-700" },
  { id: "#ORD-8805", product: "Robot de cuisine Moulinex i-Companion", qty: 1, total: "4 299 MAD",  status: "Livré",      statusColor: "bg-emerald-100 text-emerald-700" },
  { id: "#ORD-8801", product: "Nike Air Max Excee Homme",              qty: 1, total: "1 090 MAD",  status: "En attente", statusColor: "bg-amber-100 text-amber-700" },
  { id: "#ORD-8798", product: "Cable USB-C tressé 2m 100W",            qty: 5, total: "645 MAD",    status: "En cours",   statusColor: "bg-blue-100 text-blue-700" },
];

const STATUS_FILTERS = ["Tous", "En attente", "Livré", "En cours"];

export default function VendeurCommandesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("Tous");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "vendeur") { router.replace("/login"); return; }
  }, [router]);

  const filteredOrders = filter === "Tous"
    ? allOrders
    : allOrders.filter((o) => o.status === filter);

  return (
    <section className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/vendeur" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            ← Retour au dashboard
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-xl shadow-sm">📦</span>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Commandes Reçues</h1>
              <p className="text-sm text-slate-500">{filteredOrders.length} commande{filteredOrders.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === s
                  ? "bg-blue-700 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📦</span>
          <h2 className="text-lg font-extrabold text-slate-900">Commandes Récentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-4 font-semibold text-slate-500">N° Commande</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Produit</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Qté</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500">Total</th>
                <th className="pb-3 font-semibold text-slate-500">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs font-semibold text-slate-700">{order.id}</td>
                  <td className="py-3 pr-4 text-slate-800">{order.product}</td>
                  <td className="py-3 pr-4 text-slate-600">×{order.qty}</td>
                  <td className="py-3 pr-4 font-bold text-brand-700">{order.total}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">Aucune commande pour ce statut</p>
          )}
        </div>
      </article>
    </section>
  );
}
