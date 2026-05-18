"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getFamilles, createArticle, uploadArticlePhoto } from "@/lib/api-client";
import type { Famille } from "@/lib/types";

type ProductForm = {
  nom: string;
  description: string;
  prix: string;
  stock: string;
  id_famille: number | "";
};

const initialForm: ProductForm = {
  nom: "",
  description: "",
  prix: "",
  stock: "",
  id_famille: "",
};

export default function AjouterProduitPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [familles, setFamilles] = useState<Famille[]>([]);
  const [famillesLoading, setFamillesLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "vendeur") router.replace("/login");
  }, [router]);

  useEffect(() => {
    getFamilles().then((data) => {
      setFamilles(data);
      if (data.length > 0) setForm((p) => ({ ...p, id_famille: data[0].id_famille }));
      setFamillesLoading(false);
    });
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowed = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setErrorMsg("Format non supporté. Utilisez PNG, JPEG ou JPG.");
      setStatus("error");
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("L'image ne doit pas dépasser 5 Mo.");
      setStatus("error");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorMsg("");
    setStatus("idle");
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.id_famille) return;
    setLoading(true);
    setErrorMsg("");

    // 1. Create article
    const result = await createArticle({
      nom: form.nom,
      description: form.description,
      prix: form.prix,
      stock: form.stock,
      id_famille: form.id_famille as number,
    });

    if (!result.ok) {
      setErrorMsg(result.message);
      setStatus("error");
      setLoading(false);
      return;
    }

    // 2. Upload photo if provided
    if (imageFile && result.articleId) {
      const photoResult = await uploadArticlePhoto(result.articleId, imageFile);
      if (!photoResult.ok) {
        setErrorMsg("Produit créé, mais erreur lors de l'upload de l'image : " + photoResult.message);
        setStatus("error");
        setLoading(false);
        return;
      }
    }

    setStatus("success");
    setLoading(false);
  }

  function addAnother() {
    setForm({ ...initialForm, id_famille: familles[0]?.id_famille ?? "" });
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
    setStatus("idle");
    setErrorMsg("");
  }

  return (
    <section className="space-y-8 animate-fade-in max-w-2xl mx-auto">

      <div className="flex items-center gap-3">
        <Link href="/dashboard/vendeur" className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2">
          ← Retour au dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Ajouter un produit</h1>
        <p className="text-sm text-slate-500 mt-1">Remplissez les informations de votre nouveau produit</p>
      </div>

      {status === "success" ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-10 text-center">
          <h2 className="text-xl font-extrabold text-emerald-800 mb-2">Produit ajouté avec succès !</h2>
          <p className="text-sm text-emerald-700 mb-6">Votre produit a été enregistré dans le catalogue.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/vendeur"
              className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-600 transition-colors"
            >
              Voir mes produits
            </Link>
            <button
              onClick={addAnother}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              + Ajouter un autre
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
          <form onSubmit={onSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nom du produit</label>
              <input
                required
                value={form.nom}
                onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                placeholder="ex: Samsung Galaxy S24"
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
                placeholder="Décrivez votre produit..."
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
                  placeholder="ex: 1299.00"
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
                  placeholder="ex: 50"
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

            {/* Image upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Image du produit <span className="text-slate-400 font-normal">(PNG, JPEG, JPG — max 5 Mo)</span>
              </label>
              
              {imagePreview ? (
                <div className="relative rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 p-3">
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    className="h-40 w-full rounded-lg object-contain"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">📎 {imageFile?.name}</span>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                    >
                      ✕ Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center hover:border-brand-400 hover:bg-brand-50 transition-all"
                >
                  <span className="text-3xl">📷</span>
                  <p className="text-sm font-semibold text-slate-600">Cliquez pour sélectionner une image</p>
                  <p className="text-xs text-slate-400">PNG, JPEG ou JPG uniquement</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {status === "error" && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading || famillesLoading}
              className="w-full rounded-xl bg-blue-500 py-3.5 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-60 transition-all"
            >
              {loading ? "Enregistrement..." : "Ajouter le produit →"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
