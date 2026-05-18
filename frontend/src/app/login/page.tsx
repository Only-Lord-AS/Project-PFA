"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !password) {
      setStatus("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    setStatus("");

    // Handle "Se souvenir de moi"
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    const result = await apiLogin({ email, password });

    if (result.ok && result.data) {
      const user = result.data.user;
      const role = user.role.toLowerCase(); 

      // Block admin login on regular page
      if (role === "admin") {
        setStatus("Les administrateurs doivent se connecter via le portail admin sécurisé.");
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "currentUser",
        JSON.stringify({ email: user.email, role, nom_complet: user.nom_complet })
      );
      window.dispatchEvent(new Event("userChanged"));

      if (role === "vendeur") router.push("/dashboard/vendeur");
      else router.push("/");
      return;
    }

    setStatus(result.message || "Email ou mot de passe incorrect.");
    setLoading(false);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md animate-fade-in-up">

        {/* Header card */}
        <div className="mb-6 text-center">
          
          <h1 className="text-3xl font-extrabold text-slate-900">Bienvenue !</h1>
          <p className="mt-1 text-slate-500">Connectez-vous à votre compte MarocShop</p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
          <form onSubmit={onSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Adresse e-mail</label>
              <input
                required
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Se souvenir de moi
              </label>
              <Link href="/reset-password" className="text-sm text-brand-600 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            {status && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{status}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-500 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600 disabled:opacity-60 transition-all hover:shadow-md"
            >
              {loading ? "Connexion en cours..." : "Se connecter →"}
            </button>
          </form>

        </div>

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-bold text-brand-700 hover:underline underline-offset-2">
            Créer un compte
          </Link>
        </p>

        {/* Admin portal link */}
        <p className="mt-3 text-center text-sm text-slate-400">
          <Link href="/login/admin" className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-700 hover:underline underline-offset-2 transition-colors">
            🛡️ Portail Administrateur
          </Link>
        </p>
      </div>
    </div>
  );
}
