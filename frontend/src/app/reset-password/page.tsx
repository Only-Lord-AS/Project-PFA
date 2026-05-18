"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });

    const raw = localStorage.getItem("users");
    const users: { email: string }[] = raw ? JSON.parse(raw) : [];
    const found = users.find((u) => u.email === email.trim());

    if (found) {
      setStatus({
        type: "success",
        message: "Un lien de réinitialisation a été envoyé à votre email (simulation)",
      });
    } else {
      setStatus({ type: "error", message: "Aucun compte associé à cet email" });
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md animate-fade-in-up">

        {/* Header */}
        <div className="mb-6 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-3xl shadow-lg mb-4">
            🔑
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Mot de passe oublié</h1>
          <p className="mt-1 text-slate-500">Entrez votre email pour recevoir un lien de réinitialisation</p>
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

            {status.type !== "idle" && (
              <p className={`rounded-xl px-4 py-3 text-sm ${status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-700 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-brand-800 disabled:opacity-60 transition-all hover:shadow-md"
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien →"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link href="/login" className="font-bold text-brand-700 hover:underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
