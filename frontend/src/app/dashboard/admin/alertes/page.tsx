"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSecurityAlerts, updateAlertStatus, type AlerteSecurite } from "@/lib/api-client";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Status   = "NOUVEAU" | "VU" | "RESOLU";

const severityLabel: Record<Severity, string> = { LOW: "Bas", MEDIUM: "Moyen", HIGH: "Élevé", CRITICAL: "Critique" };
const severityStyle: Record<Severity, string> = {
  LOW:      "bg-sky-100 text-sky-700",
  MEDIUM:   "bg-amber-100 text-amber-700",
  HIGH:     "bg-red-100 text-red-700",
  CRITICAL: "bg-red-200 text-red-800 font-extrabold",
};
const severityDot: Record<Severity, string> = {
  LOW:      "bg-sky-400",
  MEDIUM:   "bg-amber-400",
  HIGH:     "bg-red-500",
  CRITICAL: "bg-red-700",
};

const statusLabel: Record<Status, string> = { NOUVEAU: "Nouveau", VU: "Vu", RESOLU: "Résolu" };
const statusStyle: Record<Status, string> = {
  NOUVEAU: "bg-rose-100 text-rose-700",
  VU:      "bg-slate-100 text-slate-600",
  RESOLU:  "bg-emerald-100 text-emerald-700",
};

const SEVERITIES: (Severity | "Tous")[] = ["Tous", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES:   (Status   | "Tous")[] = ["Tous", "NOUVEAU", "VU", "RESOLU"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
    + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function AlertesPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlerteSecurite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<Severity | "Tous">("Tous");
  const [filterStatus,   setFilterStatus]   = useState<Status   | "Tous">("Tous");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") { router.replace("/login"); return; }

    getSecurityAlerts().then((data) => {
      setAlerts(data);
      setLoading(false);
    });
  }, [router]);

  async function handleStatusChange(id: number, newStatus: Status) {
    const res = await updateAlertStatus(id, { statut_alerte: newStatus });
    if (res.ok) {
      setAlerts((prev) =>
        prev.map((a) => (a.id_alerte === id ? { ...a, statut_alerte: newStatus } : a))
      );
    } else {
      alert(res.message);
    }
  }

  const filtered = alerts.filter(
    (a) =>
      (filterSeverity === "Tous" || a.niveau_severite === filterSeverity) &&
      (filterStatus   === "Tous" || a.statut_alerte   === filterStatus)
  );

  const counts = {
    total:    alerts.length,
    nouveau:  alerts.filter((a) => a.statut_alerte === "NOUVEAU").length,
    critique: alerts.filter((a) => a.niveau_severite === "CRITICAL").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <section className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/admin" className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2">
            ← Dashboard Admin
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Alertes Sécurité IDS</h1>
          <p className="text-sm text-slate-500">Système de détection d'intrusion — données en temps réel depuis la base de données</p>
        </div>
        <div className="flex items-center gap-2">
          {counts.critique > 0 && (
            <span className="rounded-full bg-red-200 px-3 py-1.5 text-xs font-extrabold text-red-800 animate-pulse">
              ⚠ {counts.critique} Critique{counts.critique > 1 ? "s" : ""}
            </span>
          )}
          {counts.nouveau > 0 && (
            <span className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700">
              {counts.nouveau} Nouveau{counts.nouveau > 1 ? "x" : ""}
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {counts.total} total
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 px-1">Sévérité</span>
          <div className="flex flex-wrap gap-1.5">
            {SEVERITIES.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterSeverity === s
                    ? "bg-blue-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s === "Tous" ? "Tous" : severityLabel[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 px-1">Statut</span>
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterStatus === s
                    ? "bg-blue-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s === "Tous" ? "Tous" : statusLabel[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="ml-auto flex items-end">
          <span className="text-xs text-slate-400">{filtered.length} alerte{filtered.length !== 1 ? "s" : ""} affichée{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Empty state */}
      {alerts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <div className="text-5xl mb-3">🛡️</div>
          <p className="text-lg font-bold text-slate-700">Aucune alerte détectée</p>
          <p className="text-sm text-slate-500 mt-1">
            Lancez le script IDS (<code className="bg-slate-100 px-1 rounded">python ids.py</code>) puis le test
            (<code className="bg-slate-100 px-1 rounded">python ids_test.py</code>) pour générer des alertes.
          </p>
        </div>
      ) : (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 pr-4 font-semibold text-slate-500">Type d'attaque</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-500">IP source</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-500">Détails</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-500">Sévérité</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-500">Statut</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-500">Horodatage</th>
                  <th className="pb-3 font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id_alerte} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${severityDot[a.niveau_severite] ?? "bg-slate-400"}`} />
                        <span className="font-semibold text-slate-800">{a.type_attaque}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-600">{a.ip_source}</td>
                    <td className="py-3 pr-4 max-w-[260px]">
                      <p className="text-xs text-slate-500 line-clamp-2 font-mono">{a.details || "—"}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${severityStyle[a.niveau_severite] ?? "bg-slate-100 text-slate-600"}`}>
                        {severityLabel[a.niveau_severite] ?? a.niveau_severite}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[a.statut_alerte] ?? "bg-slate-100 text-slate-600"}`}>
                        {statusLabel[a.statut_alerte] ?? a.statut_alerte}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-400 whitespace-nowrap">{formatDate(a.horodatage)}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {a.statut_alerte === "NOUVEAU" && (
                          <button
                            onClick={() => handleStatusChange(a.id_alerte, "VU")}
                            className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            Marquer vu
                          </button>
                        )}
                        {a.statut_alerte !== "RESOLU" && (
                          <button
                            onClick={() => handleStatusChange(a.id_alerte, "RESOLU")}
                            className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            Résoudre
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                      Aucune alerte correspondant aux filtres sélectionnés.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </section>
  );
}
