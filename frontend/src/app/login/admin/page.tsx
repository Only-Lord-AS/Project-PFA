"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin } from "@/lib/api-client";

const SUPER_ADMIN_EMAIL = "amineouhadine@emsi.ma";

const specialites = [
  { value: "UTILISATEURS", label: "Gestion des Utilisateurs",  icon: "👥", desc: "Gestion des comptes, suspensions" },
  { value: "COMMANDES",    label: "Gestion des Commandes",     icon: "📦", desc: "Suivi et traitement des commandes" },
  { value: "PRODUITS",     label: "Gestion des Produits",      icon: "🛍️", desc: "Catalogue, stock, modération" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedSpecialite, setSelectedSpecialite] = useState("UTILISATEURS");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !password) {
      setStatus("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setStatus("");

    const result = await apiLogin({ email, password });

    if (result.ok && result.data) {
      const user = result.data.user;
      const role = user.role.toLowerCase();

      if (role !== "admin") {
        setStatus("Accès refusé. Ce portail est réservé aux administrateurs.");
        setLoading(false);
        return;
      }

      // Super admin is determined by email, not by selection
      const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      const effectiveSpec = isSuperAdmin ? "SUPER" : selectedSpecialite;

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          email: user.email,
          role,
          nom_complet: user.nom_complet,
          admin_specialite: effectiveSpec,
        })
      );
      window.dispatchEvent(new Event("userChanged"));
      router.push("/dashboard/admin");
      return;
    }

    setStatus(result.message || "Email ou mot de passe incorrect.");
    setLoading(false);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md animate-fade-in-up">

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-3xl shadow-lg">
            🛡️
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Espace Administrateur</h1>
          <p className="mt-1 text-slate-500">Portail sécurisé — accès restreint</p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl border-2 border-slate-300 bg-white p-8 shadow-md">
          <form onSubmit={onSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Adresse e-mail administrateur</label>
              <input
                required
                type="email"
                placeholder="admin@marocshop.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs text-slate-500 hover:underline"
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Specialty selector — only for non-super admins */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Ma section d&apos;administration</label>
              <div className="grid gap-2">
                {specialites.map((spec) => (
                  <label
                    key={spec.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                      selectedSpecialite === spec.value
                        ? "border-slate-700 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="specialite"
                      value={spec.value}
                      checked={selectedSpecialite === spec.value}
                      onChange={(e) => setSelectedSpecialite(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-xl">{spec.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{spec.label}</p>
                      <p className="text-xs text-slate-500">{spec.desc}</p>
                    </div>
                    {selectedSpecialite === spec.value && (
                      <span className="ml-auto text-slate-700 font-bold">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {status && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{status}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-800 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-slate-900 disabled:opacity-60 transition-all hover:shadow-md"
            >
              {loading ? "Authentification..." : "🔐 Connexion sécurisée"}
            </button>
          </form>

          <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
            <p className="font-semibold">⚠️ Portail réservé</p>
            <p className="mt-0.5">Seuls les administrateurs autorisés peuvent se connecter ici. Les tentatives non autorisées sont enregistrées par le système IDS.</p>
          </div>
        </div>

        {/* Back to regular login */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Vous êtes client ou vendeur ?{" "}
          <Link href="/login" className="font-bold text-brand-700 hover:underline underline-offset-2">
            Connexion classique
          </Link>
        </p>
      </div>
    </div>
  );
}
