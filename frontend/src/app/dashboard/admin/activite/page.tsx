"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

type Action = {
  id: number;
  action: string;
  user: string;
  time: string;
  icon: string;
  category: string;
};

const allActions: Action[] = [
  { id:  1, action: "Utilisateur supprimé",            user: "admin@marocshop.ma",    time: "03/05/2026 13:48", icon: "🗑️", category: "Utilisateurs" },
  { id:  2, action: "Alerte IDS marquée Critique",     user: "admin@marocshop.ma",    time: "03/05/2026 13:31", icon: "🛡️", category: "Sécurité" },
  { id:  3, action: "Produit désactivé",               user: "admin@marocshop.ma",    time: "03/05/2026 12:55", icon: "🚫", category: "Produits" },
  { id:  4, action: "Produit mis en avant",             user: "vendeur1@marocshop.ma", time: "03/05/2026 12:10", icon: "⭐", category: "Produits" },
  { id:  5, action: "Compte vendeur suspendu",         user: "admin@marocshop.ma",    time: "03/05/2026 11:42", icon: "🔒", category: "Utilisateurs" },
  { id:  6, action: "Catégorie créée",                 user: "admin@marocshop.ma",    time: "03/05/2026 10:30", icon: "🗂️", category: "Catalogue" },
  { id:  7, action: "Alerte IDS résolue",              user: "admin@marocshop.ma",    time: "03/05/2026 09:55", icon: "✅", category: "Sécurité" },
  { id:  8, action: "Paramètres de la plateforme modifiés", user: "admin@marocshop.ma", time: "02/05/2026 22:14", icon: "⚙️", category: "Système" },
  { id:  9, action: "Export CSV des commandes",        user: "admin@marocshop.ma",    time: "02/05/2026 18:30", icon: "📤", category: "Commandes" },
  { id: 10, action: "Utilisateur réactivé",            user: "admin@marocshop.ma",    time: "02/05/2026 17:05", icon: "✔️", category: "Utilisateurs" },
  { id: 11, action: "Nouveau vendeur approuvé",        user: "client1@marocshop.ma",  time: "02/05/2026 15:22", icon: "🏪", category: "Utilisateurs" },
  { id: 12, action: "Produit supprimé définitivement", user: "vendeur1@marocshop.ma", time: "02/05/2026 14:01", icon: "🗑️", category: "Produits" },
  { id: 13, action: "Rapport mensuel généré",          user: "admin@marocshop.ma",    time: "02/05/2026 12:00", icon: "📊", category: "Rapports" },
  { id: 14, action: "Bannière promotionnelle mise à jour", user: "vendeur1@marocshop.ma", time: "02/05/2026 10:45", icon: "🎨", category: "Catalogue" },
  { id: 15, action: "IP bloquée manuellement",         user: "admin@marocshop.ma",    time: "01/05/2026 23:30", icon: "🛡️", category: "Sécurité" },
  { id: 16, action: "Remboursement approuvé",          user: "client1@marocshop.ma",  time: "01/05/2026 20:15", icon: "💳", category: "Commandes" },
  { id: 17, action: "Sauvegarde manuelle déclenchée", user: "admin@marocshop.ma",    time: "01/05/2026 18:00", icon: "💾", category: "Système" },
  { id: 18, action: "Alerte IDS résolue",              user: "admin@marocshop.ma",    time: "01/05/2026 16:20", icon: "✅", category: "Sécurité" },
  { id: 19, action: "Commission vendeur ajustée",      user: "admin@marocshop.ma",    time: "01/05/2026 14:00", icon: "💰", category: "Finances" },
  { id: 20, action: "Connexion admin depuis nouvel IP", user: "admin@marocshop.ma",   time: "01/05/2026 08:05", icon: "🔑", category: "Système" },
];

const categoryColors: Record<string, string> = {
  Utilisateurs: "bg-blue-100 text-blue-700",
  Sécurité:     "bg-red-100 text-red-700",
  Produits:     "bg-purple-100 text-purple-700",
  Catalogue:    "bg-emerald-100 text-emerald-700",
  Commandes:    "bg-amber-100 text-amber-700",
  Rapports:     "bg-sky-100 text-sky-700",
  Finances:     "bg-green-100 text-green-700",
  Système:      "bg-slate-100 text-slate-600",
};

const ALL_CATEGORIES = ["Tous", ...Array.from(new Set(allActions.map((a) => a.category)))];

export default function ActivitePage() {
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState("Tous");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") router.replace("/login");
  }, [router]);

  const filtered = allActions.filter(
    (a) =>
      (filterCategory === "Tous" || a.category === filterCategory) &&
      (search.trim() === "" ||
        a.action.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <section className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/admin" className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2">
            ← Dashboard Admin
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Historique des Actions Admin</h1>
          <p className="text-sm text-slate-500">{allActions.length} actions enregistrées — toutes les opérations administratives</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
          📋 Audit log
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-1 min-w-52 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-slate-400">🔍</span>
          <input
            className="flex-1 bg-transparent text-sm placeholder-slate-400 outline-none"
            placeholder="Rechercher une action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                filterCategory === cat
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Actions list */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-500">Aucune action trouvée.</p>
          )}
          {filtered.map((action) => (
            <div
              key={action.id}
              className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base">
                {action.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{action.action}</p>
                <p className="truncate text-xs text-slate-500">{action.user}</p>
              </div>
              <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${categoryColors[action.category] ?? "bg-slate-100 text-slate-600"}`}>
                {action.category}
              </span>
              <span className="shrink-0 text-xs text-slate-400 whitespace-nowrap">{action.time}</span>
            </div>
          ))}
        </div>
      </article>

    </section>
  );
}
