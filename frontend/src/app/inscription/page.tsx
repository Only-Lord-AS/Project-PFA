"use client";

import { FormEvent, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/api-client";

type SignupForm = {
  nom_complet: string;
  email: string;
  password: string;
  role: "client" | "vendeur";
};

const initialForm: SignupForm = {
  nom_complet: "",
  email: "",
  password: "",
  role: "client",
};

const roles = [
  { value: "client",  label: "Client",  icon: "🛍️", desc: "J'achète des produits" },
  { value: "vendeur", label: "Vendeur", icon: "🏪", desc: "Je vends des produits" },
];

export default function InscriptionPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  // Real-time password validation checks
  const pwChecks = useMemo(() => {
    const p = form.password;
    return {
      length: p.length >= 8,
      uppercase: /[A-Z]/.test(p),
      digit: /\d/.test(p),
    };
  }, [form.password]);

  const passwordValid = pwChecks.length && pwChecks.uppercase && pwChecks.digit;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });

    // Client-side validation with specific messages
    if (!form.nom_complet.trim()) {
      setStatus({ type: "error", message: "Nom complet : Ce champ est obligatoire. Veuillez saisir votre nom complet." });
      setLoading(false);
      return;
    }

    if (!form.email.trim()) {
      setStatus({ type: "error", message: "Adresse e-mail : Ce champ est obligatoire. Veuillez saisir une adresse e-mail valide." });
      setLoading(false);
      return;
    }

    if (!passwordValid) {
      const issues: string[] = [];
      if (!pwChecks.length) issues.push("au moins 8 caractères");
      if (!pwChecks.uppercase) issues.push("au moins une lettre majuscule (A-Z)");
      if (!pwChecks.digit) issues.push("au moins un chiffre (0-9)");
      setStatus({ type: "error", message: `Mot de passe : Le mot de passe doit contenir ${issues.join(", ")}.` });
      setLoading(false);
      return;
    }

    const result = await signup({
      nom_complet: form.nom_complet,
      email: form.email,
      password: form.password,
      role: form.role.toUpperCase() as "CLIENT" | "VENDEUR" | "ADMIN",
    });

    if (!result.ok) {
      setStatus({ type: "error", message: result.message });
      setLoading(false);
      return;
    }

    // Persist minimal user info
    if (result.data) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          email: result.data.user.email,
          role: result.data.user.role.toLowerCase(),
          nom_complet: result.data.user.nom_complet,
        })
      );
      window.dispatchEvent(new Event("userChanged"));
    }

    setStatus({ type: "success", message: "Compte créé avec succès ! Redirection vers l'accueil..." });
    setForm(initialForm);
    setLoading(false);

    // Redirect to home page
    setTimeout(() => router.push("/"), 1200);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-8">
      <div className="w-full max-w-md animate-fade-in-up">

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">Créer un compte</h1>
          <p className="mt-1 text-slate-500">Rejoignez la communauté MarocShop</p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
          <form onSubmit={onSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nom complet</label>
              <input
                required
                placeholder="ex: Jean Dupont"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                value={form.nom_complet}
                onChange={(e) => setForm((prev) => ({ ...prev, nom_complet: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Adresse e-mail</label>
              <input
                required
                type="email"
                placeholder="vous@exemple.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs text-brand-600 hover:underline"
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 caractères"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              {/* Password requirements helper */}
              {form.password.length > 0 && (
                <div className="mt-2 rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1">
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">🔐 Exigences du mot de passe :</p>
                  <p className={`text-xs flex items-center gap-1.5 ${pwChecks.length ? "text-emerald-600" : "text-red-500"}`}>
                    {pwChecks.length ? "✅" : "❌"} Au moins 8 caractères
                  </p>
                  <p className={`text-xs flex items-center gap-1.5 ${pwChecks.uppercase ? "text-emerald-600" : "text-red-500"}`}>
                    {pwChecks.uppercase ? "✅" : "❌"} Au moins une lettre majuscule (A-Z)
                  </p>
                  <p className={`text-xs flex items-center gap-1.5 ${pwChecks.digit ? "text-emerald-600" : "text-red-500"}`}>
                    {pwChecks.digit ? "✅" : "❌"} Au moins un chiffre (0-9)
                  </p>
                </div>
              )}
            </div>

            {/* Role selector — card style */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Je suis...</label>
              <div className="grid gap-2">
                {roles.map((role) => (
                  <label
                    key={role.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                      form.role === role.value
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={form.role === role.value}
                      onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as SignupForm["role"] }))}
                      className="sr-only"
                    />
                    <span className="text-xl">{role.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{role.label}</p>
                      <p className="text-xs text-slate-500">{role.desc}</p>
                    </div>
                    {form.role === role.value && (
                      <span className="ml-auto text-brand-600 font-bold">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {status.type !== "idle" && (
              <p
                className={`rounded-xl px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-500 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600 disabled:opacity-60 transition-all hover:shadow-md"
            >
              {loading ? "Création du compte..." : "Créer mon compte →"}
            </button>
          </form>
        </div>

        {/* Login link at bottom */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-bold text-brand-700 hover:underline underline-offset-2">
            Connectez-vous ici
          </Link>
        </p>
      </div>
    </div>
  );
}
