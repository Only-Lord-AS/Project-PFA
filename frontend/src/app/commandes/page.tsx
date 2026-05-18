"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

import API_BASE_URL, { getCommandes } from "@/lib/api-client";
import { DemandeAchat } from "@/lib/types";

const statusStyles: Record<string, string> = {
  EN_ATTENTE: "bg-amber-100 text-amber-700",
  CONFIRMEE: "bg-blue-100 text-blue-700",
  EN_PREPARATION: "bg-purple-100 text-purple-700",
  EXPEDIEE: "bg-orange-100 text-orange-700",
  LIVREE: "bg-emerald-100 text-emerald-700",
  ANNULEE: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  EN_PREPARATION: "En préparation",
  EXPEDIEE: "Expédiée",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

export default function CommandesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<DemandeAchat[]>([]);
  const [mounted, setMounted] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { router.replace("/login"); return; }

    getCommandes().then((data) => {
      setOrders(data);
      setMounted(true);
    });
  }, [router]);

  async function handleDownloadFacture(orderId: number, reference: string) {
    try {
      setDownloading(orderId);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/commandes/${orderId}/facture/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("La facture n'est pas encore disponible ou une erreur est survenue.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Facture_${reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Erreur lors du téléchargement de la facture.");
    } finally {
      setDownloading(null);
    }
  }

  if (!mounted) return null;

  return (
    <section className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900"> historique</h1>
          <p className="text-sm text-slate-500">{orders.length} commande{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/catalogue" className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2">
          ← Continuer mes achats
        </Link>
      </div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="text-6xl">📦</div>
          <p className="mt-4 text-xl font-bold text-slate-700">Aucune commande pour le moment</p>
          <p className="mt-2 text-sm text-slate-500">Parcourez notre catalogue pour passer votre première commande.</p>
          <Link
            href="/catalogue"
            className="mt-6 inline-block rounded-2xl bg-brand-700 px-8 py-3 font-bold text-white hover:bg-brand-800 transition-colors shadow-sm"
          >
            🛍️ Voir le catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id_commande} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-extrabold text-slate-800">#{order.reference}</span>
                  <span className="text-xs text-slate-400">{new Date(order.date_commande).toLocaleDateString("fr-FR")}</span>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[order.statut] ?? "bg-slate-100 text-slate-700"}`}>
                  {statusLabels[order.statut] ?? order.statut}
                </span>
              </div>

              {/* Products list */}
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden mb-4">
                {order.details.map((item) => (
                  <div key={item.id_detail} className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 text-sm">
                    <span className="text-slate-700 font-medium">{item.article_designation}</span>
                    <span className="text-slate-500 shrink-0">×{item.quantite_commandee}</span>
                    <span className="font-bold text-brand-700 shrink-0 ml-auto">{parseFloat(item.article_prix).toFixed(2)} MAD</span>
                  </div>
                ))}
              </div>

              {/* Total and Invoice */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  {order.chemin_facture_pdf && (
                    <button
                      onClick={() => handleDownloadFacture(order.id_commande, order.reference)}
                      disabled={downloading === order.id_commande}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
                    >
                      {downloading === order.id_commande ? "⏳ Téléchargement..." : "📄 Télécharger la facture (PDF)"}
                    </button>
                  )}
                </div>
                <div className="rounded-xl bg-brand-50 px-5 py-2.5">
                  <span className="text-sm text-slate-500 mr-3">Total TTC</span>
                  <span className="text-lg font-extrabold text-brand-700">{parseFloat(order.montant_ttc).toFixed(2)} MAD</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
