"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createAdmin } from "@/lib/api-client";

const specialites = [
  { value: "SUPER",        label: "Super Administrateur",      icon: "👑", desc: "Accès complet à toutes les sections" },
  { value: "UTILISATEURS", label: "Gestion des Utilisateurs",  icon: "👥", desc: "Gestion des comptes, suspensions" },
  { value: "COMMANDES",    label: "Gestion des Commandes",     icon: "📦", desc: "Suivi et traitement des commandes" },
  { value: "PRODUITS",     label: "Gestion des Produits",      icon: "🛍️", desc: "Catalogue, stock, modération" },
  { value: "SECURITE",     label: "Sécurité",                  icon: "🔒", desc: "Alertes IDS, logs de sécurité" },
];

export default function CreateAdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nomComplet, setNomComplet] = useState("");
  const [specialite, setSpecialite] = useState("UTILISATEURS");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    // Only Super Admin can access this page
    if (!user || user.role !== "admin" || user.admin_specialite !== "SUPER") {
      router.replace("/dashboard/admin");
      return;
    }
    setMounted(true);
  }, [router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = await createAdmin({
      email,
      password,
      nom_complet: nomComplet,
      admin_specialite: specialite,
    });

    if (result.ok) {
      setStatus("success");
      setMessage(result.message);
      setEmail("");
      setPassword("");
      setNomComplet("");
      setSpecialite("UTILISATEURS");
    } else {
      setStatus("error");
      setMessage(result.message);
    }
    setLoading(false);
  }

  if (!mounted) return null;

  return (
    <section className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/admin" className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2">
          ← Retour au dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">👑 Créer un administrateur</h1>
        <p className="text-sm text-slate-500 mt-1">
          Réservé au Super Administrateur — créez un nouveau compte admin avec ses permissions.
        </p>
      </div>

      {status === "success" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
          <p className="font-semibold">✅ {message}</p>
          <p className="mt-1 text-xs">Le nouvel administrateur peut maintenant se connecter via le portail admin.</p>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
        <form onSubmit={onSubmit} className="space-y-5">

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Nom complet</label>
            <input
              required
              value={nomComplet}
              onChange={(e) => setNomComplet(e.target.value)}
              placeholder="ex: Ahmed Benali"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Adresse e-mail</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: admin@marocshop.ma"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères, 1 majuscule, 1 chiffre"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Spécialité / Tâche</label>
            <div className="grid gap-2">
              {specialites.map((spec) => (
                <label
                  key={spec.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                    specialite === spec.value
                      ? "border-brand-600 bg-brand-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="specialite"
                    value={spec.value}
                    checked={specialite === spec.value}
                    onChange={(e) => setSpecialite(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-xl">{spec.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{spec.label}</p>
                    <p className="text-xs text-slate-500">{spec.desc}</p>
                  </div>
                  {specialite === spec.value && (
                    <span className="ml-auto text-brand-600 font-bold">✓</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {status === "error" && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-800 py-3.5 text-sm font-bold text-white hover:bg-slate-900 disabled:opacity-60 transition-all"
          >
            {loading ? "Création en cours..." : "Créer l'administrateur →"}
          </button>
        </form>
      </div>
    </section>
  );
}
