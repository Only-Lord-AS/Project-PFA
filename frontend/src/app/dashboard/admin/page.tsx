"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminDashboardStats } from "@/lib/api-client";

type DashboardData = {
  users: { total: number; clients: number; vendeurs: number; admins: number; actifs: number; nouveaux_30j: number };
  orders: { total: number; par_statut: Record<string, number>; recents_30j: number };
  revenue: { chiffre_affaires_ht: number; chiffre_affaires_ttc: number; revenue_30j: number };
  products: { total: number; actifs: number; rupture_stock: number; categories: number };
  security: {
    total_alertes: number; nouvelles: number;
    par_severite: Record<string, number>;
    par_type: Record<string, number>;
    recentes: { id_alerte: number; type_attaque: string; niveau_severite: string; ip_source: string; horodatage: string; details: string | null; statut_alerte: string }[];
  };
  top_vendeurs: { nom: string; ventes: number; commandes: number }[];
  recent_actions: { action: string; user: string; time: string; montant: number }[];
};

function formatMAD(n: number) {
  return n.toLocaleString("fr-MA", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " MAD";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Il y a ${days}j`;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [specialite, setSpecialite] = useState<string>("SUPER");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") { router.replace("/login/admin"); return; }
    setSpecialite(user.admin_specialite ?? "SUPER");

    getAdminDashboardStats().then((raw) => {
      if (raw) setData(raw as unknown as DashboardData);
      setLoading(false);
    });
  }, [router]);

  const canSee = (section: string) =>
    specialite === "SUPER" || specialite === section;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-slate-500">
        Impossible de charger les statistiques. Vérifiez votre connexion.
      </div>
    );
  }

  const specLabels: Record<string, string> = {
    SUPER: "Super Administrateur",
    UTILISATEURS: "Gestion des Utilisateurs",
    COMMANDES: "Gestion des Commandes",
    PRODUITS: "Gestion des Produits",
    SECURITE: "Sécurité & IDS",
  };

  const kpis = [
    canSee("COMMANDES") && { label: "Chiffre d'affaires (TTC)", value: formatMAD(data.revenue.chiffre_affaires_ttc), icon: "💰", sub: `30j: ${formatMAD(data.revenue.revenue_30j)}`, href: "/dashboard/admin/chiffre-affaires" },
    canSee("COMMANDES") && { label: "Commandes totales",        value: String(data.orders.total), icon: "📦", sub: `30j: ${data.orders.recents_30j}`, href: "/dashboard/admin/commandes" },
    canSee("PRODUITS") && { label: "Produits actifs",          value: `${data.products.actifs} / ${data.products.total}`, icon: "🛍️", sub: `${data.products.rupture_stock} en rupture`, href: "/dashboard/admin/produits" },
    canSee("UTILISATEURS") && { label: "Utilisateurs",             value: String(data.users.total), icon: "👥", sub: `${data.users.nouveaux_30j} nouveaux (30j)`, href: "/dashboard/admin/utilisateurs" },
  ].filter(Boolean) as { label: string; value: string; icon: string; sub: string; href: string }[];

  const severityLabel: Record<string, string> = { LOW: "Faible", MEDIUM: "Moyen", HIGH: "Élevé", CRITICAL: "Critique" };
  const severityColor: Record<string, { bg: string; dot: string }> = {
    CRITICAL: { bg: "bg-red-100 text-red-700",    dot: "bg-red-500" },
    HIGH:     { bg: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
    MEDIUM:   { bg: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
    LOW:      { bg: "bg-sky-100 text-sky-700",     dot: "bg-sky-500" },
  };

  return (
    <section className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard Administrateur</h1>
          <p className="text-sm text-slate-500 mt-1">Données en temps réel depuis la base de données</p>
        </div>
        <div className="flex items-center gap-2">
          {specialite === "SUPER" && (
            <Link
              href="/dashboard/admin/creer-admin"
              className="rounded-full bg-slate-800 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-900 transition-colors"
            >
              + Créer un admin
            </Link>
          )}
          <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
            🛡️ {specLabels[specialite] ?? specialite}
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
            ● Plateforme en ligne
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href} className="card-hover block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{kpi.icon}</span>
              <span className="text-xs text-slate-500">{kpi.label}</span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-brand-700">{kpi.value}</p>
            <p className="mt-1 text-xs text-slate-400">{kpi.sub}</p>
          </Link>
        ))}
      </div>

      {/* Users breakdown */}
      {canSee("UTILISATEURS") && (
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Clients", count: data.users.clients, icon: "🛒", color: "bg-blue-100 text-blue-700" },
          { label: "Vendeurs", count: data.users.vendeurs, icon: "🏪", color: "bg-purple-100 text-purple-700" },
          { label: "Administrateurs", count: data.users.admins, icon: "🔑", color: "bg-red-100 text-red-700" },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-2xl">{r.icon}</span>
            <div>
              <p className="text-2xl font-extrabold text-slate-800">{r.count}</p>
              <p className="text-xs text-slate-500">{r.label}</p>
            </div>
            <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-bold ${r.color}`}>{r.label}</span>
          </div>
        ))}
      </div>
      )}

      {/* Orders by status */}
      {canSee("COMMANDES") && (
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📊</span>
          <h2 className="text-lg font-extrabold text-slate-900">Commandes par Statut</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(data.orders.par_statut).map(([statut, count]) => {
            const statusColors: Record<string, string> = {
              EN_ATTENTE: "bg-amber-100 text-amber-700",
              CONFIRMEE: "bg-blue-100 text-blue-700",
              EN_PREPARATION: "bg-indigo-100 text-indigo-700",
              EXPEDIEE: "bg-cyan-100 text-cyan-700",
              LIVREE: "bg-emerald-100 text-emerald-700",
              ANNULEE: "bg-red-100 text-red-700",
            };
            const statusLabels: Record<string, string> = {
              EN_ATTENTE: "En attente", CONFIRMEE: "Confirmée", EN_PREPARATION: "En préparation",
              EXPEDIEE: "Expédiée", LIVREE: "Livrée", ANNULEE: "Annulée",
            };
            return (
              <div key={statut} className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-2xl font-extrabold text-slate-800">{count}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${statusColors[statut] ?? "bg-slate-100 text-slate-600"}`}>
                  {statusLabels[statut] ?? statut}
                </span>
              </div>
            );
          })}
        </div>
      </article>
      )}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Security alerts */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🛡️</span>
            <h2 className="text-lg font-extrabold text-slate-900">Alertes Sécurité IDS</h2>
            {data.security.nouvelles > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{data.security.nouvelles} nouvelles</span>
            )}
          </div>
          {data.security.total_alertes === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Aucune alerte détectée. Le système est sécurisé. ✅</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.security.par_severite).map(([sev, count]) => (
                <div key={sev} className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${severityColor[sev]?.dot ?? "bg-slate-400"}`} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Alertes {severityLabel[sev] ?? sev}</p>
                      <p className="text-xs text-slate-500">Niveau : {severityLabel[sev] ?? sev}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${severityColor[sev]?.bg ?? "bg-slate-100 text-slate-600"}`}>
                    {count}
                  </span>
                </div>
              ))}
              {Object.entries(data.security.par_type).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Par type d'attaque :</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.security.par_type).map(([type, count]) => (
                      <span key={type} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        {type}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <Link
            href="/dashboard/admin/alertes"
            className="mt-4 block w-full rounded-xl border border-brand-200 bg-brand-50 py-2 text-center text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
          >
            Voir toutes les alertes →
          </Link>
        </article>

        {/* Recent orders */}
        {canSee("COMMANDES") && (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📋</span>
            <h2 className="text-lg font-extrabold text-slate-900">Dernières Commandes</h2>
          </div>
          {data.recent_actions.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Aucune commande pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {data.recent_actions.map((action, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base">
                    📦
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{action.action}</p>
                    <p className="truncate text-xs text-slate-500">{action.user} — {formatMAD(action.montant)}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(action.time)}</span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/dashboard/admin/commandes"
            className="mt-4 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Consulter toutes les commandes →
          </Link>
        </article>
        )}
      </div>

      {/* Top vendors */}
      {canSee("COMMANDES") && (
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🏆</span>
          <h2 className="text-lg font-extrabold text-slate-900">Top Vendeurs</h2>
        </div>
        {data.top_vendeurs.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">Aucune vente enregistrée pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 pr-4 font-semibold text-slate-500">#</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-500">Vendeur / Boutique</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-500">Ventes</th>
                  <th className="pb-3 font-semibold text-slate-500">Commandes</th>
                </tr>
              </thead>
              <tbody>
                {data.top_vendeurs.map((vendor, i) => (
                  <tr key={vendor.nom} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <span className={`font-bold ${i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-slate-600"}`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-800">{vendor.nom}</td>
                    <td className="py-3 pr-4 font-bold text-brand-700">{formatMAD(vendor.ventes)}</td>
                    <td className="py-3 text-slate-600">{vendor.commandes} cmd</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
      )}

      {/* Products info */}
      {canSee("PRODUITS") && (
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📦</span>
          <h2 className="text-lg font-extrabold text-slate-900">Catalogue</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Total produits", value: data.products.total, icon: "🛍️" },
            { label: "Produits actifs", value: data.products.actifs, icon: "✅" },
            { label: "Rupture de stock", value: data.products.rupture_stock, icon: "⚠️" },
            { label: "Catégories", value: data.products.categories, icon: "🗂️" },
          ].map((p) => (
            <div key={p.label} className="rounded-xl bg-slate-50 p-4 text-center">
              <span className="text-2xl">{p.icon}</span>
              <p className="mt-2 text-2xl font-extrabold text-slate-800">{p.value}</p>
              <p className="text-xs text-slate-500">{p.label}</p>
            </div>
          ))}
        </div>
      </article>
      )}
    </section>
  );
}
