"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

type UserProfile = {
  email: string;
  role: string;
  nom_complet: string;   // backend: nom_complet
  telephone?: string;    // backend: telephone
  adresse_livraison?: string; // backend: adresse_livraison
};

export default function ProfilPage() {
  const router = useRouter();
  const [form, setForm] = useState<UserProfile>({ email: "", role: "", nom_complet: "" });
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { router.replace("/login"); return; }
    const raw = localStorage.getItem("currentUser");
    if (raw) {
      const parsed = JSON.parse(raw);
      setForm({
        email: parsed.email ?? "",
        role: parsed.role ?? "",
        nom_complet: parsed.nom_complet ?? "",
        telephone: parsed.telephone ?? "",
        adresse_livraison: parsed.adresse_livraison ?? "",
      });
    }
    setMounted(true);
  }, [router]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = localStorage.getItem("currentUser");
    if (!raw) return;
    const current = JSON.parse(raw);
    const updated = { ...current, nom_complet: form.nom_complet, telephone: form.telephone, adresse_livraison: form.adresse_livraison };
    localStorage.setItem("currentUser", JSON.stringify(updated));
    window.dispatchEvent(new Event("userChanged"));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!mounted) return null;

  const roleLabel: Record<string, string> = {
    client: "Client",
    vendeur: "Vendeur",
    admin: "Administrateur",
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-8">
      <div className="w-full max-w-md animate-fade-in-up">

        {/* Header */}
        <div className="mb-6 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-3xl shadow-lg mb-4">
            👤
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Mon Profil</h1>
          <p className="mt-1 text-slate-500">Gérez vos informations personnelles</p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
          <form onSubmit={onSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Adresse e-mail</label>
              <input
                readOnly
                value={form.email}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Rôle</label>
              <input
                readOnly
                value={roleLabel[form.role] ?? form.role}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nom complet</label>
              <input
                required
                value={form.nom_complet}
                onChange={(e) => setForm((p) => ({ ...p, nom_complet: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Votre nom complet"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Téléphone <span className="text-slate-400 font-normal">(optionnel)</span></label>
              <input
                type="tel"
                value={form.telephone ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="ex: 0612345678"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Adresse de livraison <span className="text-slate-400 font-normal">(optionnel)</span></label>
              <input
                value={form.adresse_livraison ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, adresse_livraison: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="ex: 12 Rue Mohamed V, Casablanca"
              />
            </div>

            {saved && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
                Profil mis à jour ✓
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-500 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600 transition-all hover:shadow-md"
            >
              Enregistrer les modifications →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
