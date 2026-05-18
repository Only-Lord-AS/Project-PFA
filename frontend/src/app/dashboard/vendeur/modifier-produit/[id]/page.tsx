"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getFamilles, updateArticle, getArticle } from "@/lib/api-client";
import type { Famille } from "@/lib/types";

type ProductForm = {
  nom: string;
  description: string;
  prix: string;
  stock: string;
  id_famille: number | "";   // backend: id_famille (FK to Famille)
  imageUrl: string;
};

export default function ModifierProduitPage() {
  const params = useParams();
  const router = useRouter();

  const [form, setForm] = useState<ProductForm>({
    nom: "", description: "", prix: "", stock: "", id_famille: "", imageUrl: "",
  });
  const [familles, setFamilles] = useState<Famille[]>([]);
  const [famillesLoading, setFamillesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "vendeur") { router.replace("/login"); return; }

    const id = Number(params.id);
    getArticle(id).then((product) => {
      if (!product) { setNotFound(true); return; }
      
      setForm((prev) => ({
        ...prev,
        nom: product.designation,
        description: product.description,
        prix: String(product.prix_vente),
        stock: String(product.quantite_disponible),
        imageUrl: product.imageUrl,
      }));
    });
  }, [params.id, router]);

  useEffect(() => {
    getFamilles().then((data) => {
      setFamilles(data);
      setFamillesLoading(false);
      // Try to match existing category name against a famille libelle
      setForm((prev) => {
        if (!prev.id_famille && data.length > 0) {
          return { ...prev, id_famille: data[0].id_famille };
        }
        return prev;
      });
    });
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.id_famille) return;
    setLoading(true);
    setErrorMsg("");

    const id = Number(params.id);
    const result = await updateArticle(id, {
      nom: form.nom,
      description: form.description,
      prix: form.prix,
      stock: form.stock,
      id_famille: form.id_famille as number,
    });

    if (!result.ok) {
      setErrorMsg(result.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard/vendeur");
  }

  if (notFound) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Produit introuvable ou non modifiable.</p>
          <Link href="/dashboard/vendeur" className="text-sm font-semibold text-brand-700 hover:underline">
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8 animate-fade-in max-w-2xl mx-auto">

      <div className="flex items-center gap-3">
        <Link href="/dashboard/vendeur" className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2">
          ← Retour au dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Modifier le produit</h1>
        <p className="text-sm text-slate-500 mt-1">Modifiez les informations de votre produit</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
        <form onSubmit={onSubmit} className="space-y-5">

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Nom du produit</label>
            <input
              required
              value={form.nom}
              onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Prix (MAD)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.prix}
                onChange={(e) => setForm((p) => ({ ...p, prix: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Stock (unités)</label>
              <input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Catégorie</label>
            {famillesLoading ? (
              <div className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-400">
                Chargement des catégories...
              </div>
            ) : familles.length === 0 ? (
              <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Aucune catégorie disponible — vérifiez la connexion au backend.
              </div>
            ) : (
              <select
                required
                value={form.id_famille}
                onChange={(e) => setForm((p) => ({ ...p, id_famille: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white"
              >
                {familles.map((f) => (
                  <option key={f.id_famille} value={f.id_famille}>
                    {f.libelle}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              URL de l&apos;image <span className="text-slate-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {errorMsg && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{errorMsg}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || famillesLoading}
              className="flex-1 rounded-xl bg-blue-500 py-3.5 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-60 transition-all"
            >
              {loading ? "Enregistrement..." : "Enregistrer les modifications →"}
            </button>
            <Link
              href="/dashboard/vendeur"
              className="rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
