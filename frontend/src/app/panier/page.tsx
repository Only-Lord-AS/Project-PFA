"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { SimilarProducts } from "@/components/similar-products";
import { addToCart as apiAddToCart, clearCart as apiClearCart, checkout as apiCheckout, API_BASE_URL, getAccessToken, getArticle } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth";
import { Product } from "@/lib/types";

export default function PanierPage() {
  const { items, updateQuantity, removeItem, clearCart: clearLocalCart } = useCart();
  const router = useRouter();
  
  const [showModal, setShowModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [resolvedProducts, setResolvedProducts] = useState<Record<number, Product>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Resolve product details from backend for each cart item
  useEffect(() => {
    const ids = items.map((i) => i.productId);
    Promise.all(
      ids.map((id) =>
        getArticle(id).then((p) => (p ? { id, product: p } : null))
      )
    ).then((results) => {
      const map: Record<number, Product> = {};
      results.forEach((r) => { if (r) map[r.id] = r.product; });
      setResolvedProducts(map);
    });
  }, [items]);

  const lines = useMemo(
    () =>
      items
        .map((item) => {
          const product = resolvedProducts[item.productId];
          if (!product) return null;
          return { ...item, product, total: product.prix_vente * item.quantity };
        })
        .filter(Boolean),
    [items, resolvedProducts]
  );

  const subtotal  = lines.reduce((sum, l) => sum + (l?.total ?? 0), 0);
  const shipping  = subtotal > 0 && subtotal < 299 ? 29.9 : 0;
  const total     = subtotal + shipping;
  const totalQty  = items.reduce((sum, i) => sum + i.quantity, 0);

  const cartCategories = lines
    .map((l) => l?.product.famille_libelle)
    .filter(Boolean) as string[];

  const cartIds = items.map((i) => i.productId);

  const [isProcessing, setIsProcessing] = useState(false);
  const [methodePaiement, setMethodePaiement] = useState("CARTE_SIMULEE");

  async function validateOrder() {
    const user = getCurrentUser();
    if (!user) {
      alert("Vous devez être connecté pour passer une commande.");
      router.push("/login");
      return;
    }

    if (lines.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Vider le panier du backend
      await apiClearCart();

      // 2. Ajouter chaque article au panier backend
      for (const line of lines) {
        if (line) {
          const addRes = await apiAddToCart(line.productId, line.quantity);
          if (!addRes.ok) {
            alert(`Attention: L'article "${line.product.designation}" n'est plus disponible ou son ID est obsolète. Veuillez vider votre panier et recommencer.`);
            setIsProcessing(false);
            return;
          }
        }
      }

      // 3. Checkout
      const res = await apiCheckout({ methode: methodePaiement });
      if (res.ok && res.data) {
        setCompletedOrder({ 
          id: (res.data as any).reference, 
          commande_id: (res.data as any).commande_id 
        });
        setShowModal(true);
        clearLocalCart();
      } else {
        alert("Erreur lors du paiement : " + res.message);
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de la validation.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function downloadPdf() {
    if (!completedOrder || !completedOrder.commande_id) return;
    
    const token = getAccessToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/commandes/${completedOrder.commande_id}/facture/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Facture_${completedOrder.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        alert("La facture n'est pas encore disponible ou une erreur est survenue.");
      }
    } catch (e) {
      alert("Erreur de connexion au serveur.");
    }
  }

  if (!mounted) return null;

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Mon Panier</h1>
          {mounted && totalQty > 0 && (
            <p className="text-sm text-slate-500">{totalQty} article{totalQty !== 1 ? "s" : ""}</p>
          )}
        </div>
        <Link href="/catalogue" className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2">
          ← Continuer les achats
        </Link>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center shadow-sm animate-fade-in">
          <div className="text-6xl">🛒</div>
          <p className="mt-4 text-xl font-bold text-slate-700">Votre panier est vide</p>
          <p className="mt-2 text-sm text-slate-500">
            Parcourez notre catalogue et ajoutez des produits à votre panier.
          </p>
          <Link
            href="/catalogue"
            className="mt-6 inline-block rounded-2xl bg-blue-700 px-8 py-3 font-bold text-white hover:bg-blue-800 transition-colors shadow-sm"
          >
             Voir le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-start">
          {/* Cart items */}
          <div className="space-y-3">
            {lines.map((line) =>
              line ? (
                <article
                  key={line.productId}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-fade-in"
                >
                  {/* Product image */}
                  <img
                    src={`${line.product.imageUrl}?w=100&h=100&fit=crop&auto=format`}
                    alt={line.product.designation}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />

                  {/* Product info */}
                  <div className="flex flex-1 min-w-0 flex-col justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-900 leading-snug">{line.product.designation}</h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {line.product.famille_libelle} · {line.product.vendorName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      {/* Qty controls */}
                      <div className="flex items-center overflow-hidden rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                          className="qty-btn flex h-8 w-8 items-center justify-center text-lg font-bold text-slate-500 hover:bg-red-50 hover:text-red-500"
                          title="Diminuer"
                        >
                          −
                        </button>
                        <span className="flex w-10 items-center justify-center text-sm font-bold text-slate-800">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                          className="qty-btn flex h-8 w-8 items-center justify-center text-lg font-bold text-slate-500 hover:bg-green-50 hover:text-green-600"
                          title="Augmenter"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-extrabold text-brand-700">{line.total.toFixed(2)} MAD</p>
                        <p className="text-xs text-slate-400">{line.product.prix_vente.toFixed(2)} MAD / unité</p>
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeItem(line.productId)}
                    className="self-start shrink-0 rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Supprimer l'article"
                  >
                    ✕
                  </button>
                </article>
              ) : null
            )}
          </div>

          {/* Order summary */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-900">Résumé de commande</h3>

            {/* Line items */}
            <div className="mt-4 space-y-2 text-sm">
              {lines.map((l) =>
                l ? (
                  <div key={l.productId} className="flex items-start justify-between gap-2">
                    <span className="text-slate-600 leading-snug max-w-[55%]">
                      {l.product.designation}{" "}
                      <span className="font-semibold text-slate-700">×{l.quantity}</span>
                    </span>
                    <span className="font-semibold text-slate-800 shrink-0">
                      {l.total.toFixed(2)} MAD
                    </span>
                  </div>
                ) : null
              )}
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Livraison</span>
                <span className={shipping === 0 ? "font-semibold text-emerald-600" : ""}>
                  {shipping === 0 ? "Gratuite ✓" : `${shipping.toFixed(2)} MAD`}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-extrabold">
              <span>Total</span>
              <span className="text-brand-700">{total.toFixed(2)} MAD</span>
            </div>

            {shipping > 0 && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                 Ajoutez <strong>{(299 - subtotal).toFixed(2)} MAD</strong> pour bénéficier de la livraison gratuite
              </p>
            )}

            <div className="mt-5 border-t border-slate-200 pt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Méthode de paiement</label>
              <select
                value={methodePaiement}
                onChange={(e) => setMethodePaiement(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 bg-white"
              >
                <option value="CARTE_SIMULEE">💳 Carte Bancaire (Simulée)</option>
                <option value="VIREMENT_SIMULE">🏦 Virement Bancaire (Simulé)</option>
                <option value="CASH_LIVRAISON">💵 Paiement à la livraison</option>
              </select>
            </div>

            <button
              onClick={validateOrder}
              disabled={isProcessing}
              className="mt-5 w-full rounded-2xl bg-blue-500 py-3.5 font-bold text-white hover:bg-blue-600 disabled:opacity-60 transition-all hover:shadow-md"
            >
              {isProcessing ? "Traitement..." : "Valider la commande →"}
            </button>

            {/* Trust badges */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
              <div><div>🔒</div>Sécurisé</div>
              <div><div>↩️</div>Retours</div>
              <div><div>🚚</div>Livraison</div>
            </div>
          </aside>
        </div>
      )}

      {/* Similar products */}
      {cartIds.length > 0 && (
        <div className="border-t border-slate-200 pt-8">
          <SimilarProducts
            excludeIds={cartIds}
            categories={cartCategories}
            title="Produits similaires — Vous pourriez aussi aimer"
          />
        </div>
      )}

      {/* Success Modal */}
      {showModal && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
              🎉
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Commande validée !</h2>
            <p className="mt-2 text-slate-500">
              Votre commande <strong className="text-slate-800">{completedOrder.id}</strong> a été enregistrée avec succès.
            </p>
            
            <div className="mt-8 space-y-3">
              <button
                onClick={downloadPdf}
                className="w-full rounded-2xl bg-blue-600 py-3.5 font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
              >
                📄 Télécharger la facture (PDF)
              </button>
              <button
                onClick={() => router.push("/commandes")}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Voir mes commandes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
