import type {
  Product, Article, ArticleList, Famille, Membre, Panier, DemandeAchat,
  SignupPayload, LoginPayload, AuthResponse,
} from "@/lib/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";

// ── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ── Base fetch with auth header ──────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  // If we got 401 and we sent a token:
  // - For public endpoints (catalogue), retry without auth
  // - For protected endpoints (admin, commandes, panier), throw immediately
  if (res.status === 401 && token && typeof window !== "undefined") {
    const isPublicEndpoint = path.startsWith("/catalogue/");
    
    if (isPublicEndpoint) {
      clearTokens();
      localStorage.removeItem("currentUser");
      window.dispatchEvent(new Event("userChanged"));

      // Retry the same request without the Authorization header
      const retryHeaders = { ...headers };
      delete retryHeaders["Authorization"];
      res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: retryHeaders });
    }
    // For protected endpoints, let the error fall through to the error handler below
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // DRF returns field-level errors as {field: ["msg", ...], ...}
    // or {detail: "msg"} or {non_field_errors: ["msg", ...]}
    if (err.detail) {
      throw new Error(err.detail);
    }
    // Build readable messages from field errors
    const messages: string[] = [];
    for (const [field, errors] of Object.entries(err)) {
      if (Array.isArray(errors)) {
        const fieldLabels: Record<string, string> = {
          nom_complet: "Nom complet",
          email: "Adresse e-mail",
          password: "Mot de passe",
          role: "Rôle",
          telephone: "Téléphone",
          non_field_errors: "Erreur",
        };
        const label = fieldLabels[field] || field;
        messages.push(`${label} : ${(errors as string[]).join(", ")}`);
      }
    }
    if (messages.length > 0) {
      throw new Error(messages.join(" | "));
    }
    throw new Error(`Erreur ${res.status}`);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

// ── Mappers : Article (backend) → Product (frontend) ────────────────────────
// Field names now aligned between frontend and backend.
// Only type conversions needed: prix_vente string→number, photos array→url.

export function articleToProduct(a: Article): Product {
  const mainPhoto =
    a.photos?.find((p) => p.est_principale)?.chemin_fichier ??
    a.photos?.[0]?.chemin_fichier ??
    "";
  return {
    id_article: a.id_article,
    designation: a.designation,
    description: a.description,
    prix_vente: parseFloat(a.prix_vente),
    quantite_disponible: a.quantite_disponible,
    id_famille: a.id_famille,
    famille_libelle: a.famille_libelle ?? "",
    vendorName: a.vendeur_boutique ?? "",
    imageUrl: mainPhoto,
    actif: a.actif ?? true,
  };
}

export function articleListToProduct(a: ArticleList): Product {
  return {
    id_article: a.id_article,
    designation: a.designation,
    description: "",
    prix_vente: parseFloat(a.prix_vente),
    quantite_disponible: a.stock_dispo,
    id_famille: a.id_famille,
    famille_libelle: a.famille_libelle ?? "",
    vendorName: a.vendeur_boutique ?? "",
    imageUrl: a.photo_principale ?? "",
    actif: a.actif ?? true,
  };
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function signup(
  payload: SignupPayload
): Promise<{ ok: boolean; message: string; data?: AuthResponse }> {
  try {
    const data = await apiFetch<AuthResponse>("/auth/register/", {
      method: "POST",
      body: JSON.stringify({
        nom_complet: payload.nom_complet,
        email: payload.email,
        password: payload.password,
        role: payload.role.toUpperCase(),
      }),
    });
    saveTokens(data.access, data.refresh);
    return { ok: true, message: "Compte créé avec succès.", data };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur lors de l'inscription.";
    return { ok: false, message: msg };
  }
}

export async function login(
  payload: LoginPayload
): Promise<{ ok: boolean; message: string; data?: AuthResponse }> {
  try {
    const data = await apiFetch<AuthResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email: payload.email, password: payload.password }),
    });
    saveTokens(data.access, data.refresh);
    return { ok: true, message: "Connexion réussie.", data };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Email ou mot de passe incorrect.";
    return { ok: false, message: msg };
  }
}

export async function getProfile(): Promise<Membre | null> {
  try {
    return await apiFetch<Membre>("/auth/me/");
  } catch {
    return null;
  }
}

// ── Catalogue ─────────────────────────────────────────────────────────────────

export async function getFamilles(): Promise<Famille[]> {
  try {
    return await apiFetch<Famille[]>("/catalogue/familles/");
  } catch {
    return [];
  }
}

/** Returns articles from the backend catalogue endpoint. No mock fallback — real API only. */
export async function getProducts(params?: {
  famille?: number;
  recherche?: string;
  tri?: "prix_asc" | "prix_desc" | "nouveaute";
}): Promise<Product[]> {
  try {
    const qs = new URLSearchParams();
    qs.set("page_size", "100"); // fetch all products in one request
    if (params?.famille) qs.set("famille", String(params.famille));
    if (params?.recherche) qs.set("recherche", params.recherche);
    if (params?.tri) qs.set("tri", params.tri);

    const path = `/catalogue/articles/?${qs.toString()}`;
    const data = await apiFetch<{ results?: ArticleList[]; count?: number } | ArticleList[]>(path);
    const articles: ArticleList[] = Array.isArray(data)
      ? data
      : (data as { results?: ArticleList[] }).results ?? [];
    return articles.map(articleListToProduct);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function getArticle(id: number): Promise<Product | null> {
  try {
    const a = await apiFetch<Article>(`/catalogue/articles/${id}/`);
    return articleToProduct(a);
  } catch {
    return null;
  }
}

// ── Vendeur (product management) ─────────────────────────────────────────────

export async function getVendorProductsAPI(): Promise<Product[]> {
  try {
    const data = await apiFetch<Article[]>("/vendeur/articles/");
    return data.map(articleToProduct);
  } catch {
    return [];
  }
}

/** Maps the vendor form fields → ArticleWriteSerializer expected fields */
export async function createArticle(form: {
  nom: string;
  description: string;
  prix: string;
  stock: string;
  id_famille: number;
}): Promise<{ ok: boolean; message: string; articleId?: number }> {
  try {
    const data = await apiFetch<{ id_article: number }>("/vendeur/articles/", {
      method: "POST",
      body: JSON.stringify({
        designation: form.nom,            // nom → designation
        description: form.description,
        prix_vente: parseFloat(form.prix), // prix → prix_vente
        quantite_disponible: parseInt(form.stock, 10), // stock → quantite_disponible
        id_famille: form.id_famille,
        actif: true,
      }),
    });
    return { ok: true, message: "Article créé avec succès.", articleId: data.id_article };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur lors de la création.";
    return { ok: false, message: msg };
  }
}

/** Upload a photo file to an article (multipart/form-data) */
export async function uploadArticlePhoto(
  articleId: number,
  file: File
): Promise<{ ok: boolean; message: string }> {
  try {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append("chemin_fichier", file);
    formData.append("est_principale", "true");

    const res = await fetch(`${API_BASE_URL}/vendeur/articles/${articleId}/photos/`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,  // No Content-Type header — browser sets multipart boundary
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail ?? `Erreur ${res.status}`);
    }
    return { ok: true, message: "Photo uploadée." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur lors de l'upload.";
    return { ok: false, message: msg };
  }
}

export async function updateArticle(
  id: number,
  form: { nom?: string; description?: string; prix?: string; stock?: string; id_famille?: number; actif?: boolean }
): Promise<{ ok: boolean; message: string }> {
  try {
    const body: Record<string, unknown> = {};
    if (form.nom !== undefined) body.designation = form.nom;
    if (form.description !== undefined) body.description = form.description;
    if (form.prix !== undefined) body.prix_vente = parseFloat(form.prix);
    if (form.stock !== undefined) body.quantite_disponible = parseInt(form.stock, 10);
    if (form.id_famille !== undefined) body.id_famille = form.id_famille;
    if (form.actif !== undefined) body.actif = form.actif;
    await apiFetch(`/vendeur/articles/${id}/`, { method: "PATCH", body: JSON.stringify(body) });
    return { ok: true, message: "Article mis à jour." };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur lors de la mise à jour.";
    return { ok: false, message: msg };
  }
}

// ── Admin (product moderation) ───────────────────────────────────────────────

export async function getAdminProductsAPI(): Promise<Product[]> {
  try {
    // Admin uses paginated endpoint or we need to ensure we fetch all, let's just fetch default for now
    // Actually, AdminArticleViewSet might be paginated, let's add page_size=100
    const data = await apiFetch<{ results?: Article[]; count?: number } | Article[]>("/admin/articles/?page_size=100");
    const articles: Article[] = Array.isArray(data)
      ? data
      : (data as { results?: Article[] }).results ?? [];
    return articles.map(articleToProduct);
  } catch {
    return [];
  }
}

export async function updateAdminProductAPI(id: number, form: { actif?: boolean }): Promise<{ ok: boolean; message: string }> {
  try {
    await apiFetch(`/admin/articles/${id}/`, { method: "PATCH", body: JSON.stringify(form) });
    return { ok: true, message: "Article mis à jour." };
  } catch (e: unknown) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur." };
  }
}

export async function deleteAdminProductAPI(id: number): Promise<{ ok: boolean; message: string }> {
  try {
    await apiFetch(`/admin/articles/${id}/`, { method: "DELETE" });
    return { ok: true, message: "Article supprimé." };
  } catch (e: unknown) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur." };
  }
}
export async function getAdminUsersAPI(): Promise<Membre[]> {
  try {
    return await apiFetch<Membre[]>("/auth/admin/users/");
  } catch {
    return [];
  }
}

export async function updateAdminUserStatusAPI(id: number, form: { is_active: boolean }): Promise<{ ok: boolean; message: string }> {
  try {
    await apiFetch(`/auth/admin/users/${id}/`, { method: "PATCH", body: JSON.stringify(form) });
    return { ok: true, message: "Utilisateur mis à jour." };
  } catch (e: unknown) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur." };
  }
}

export async function deleteAdminUserAPI(id: number): Promise<{ ok: boolean; message: string }> {
  try {
    await apiFetch(`/auth/admin/users/${id}/`, { method: "DELETE" });
    return { ok: true, message: "Utilisateur supprimé." };
  } catch (e: unknown) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur." };
  }
}

// ── Panier ───────────────────────────────────────────────────────────────────

export async function getCart(): Promise<Panier | null> {
  try {
    return await apiFetch<Panier>("/panier/");
  } catch {
    return null;
  }
}

/** Backend expects: { id_article: number, quantite: number } */
export async function addToCart(
  productId: number,   // ← frontend uses productId → backend id_article
  quantity: number     // ← frontend uses quantity  → backend quantite
): Promise<{ ok: boolean; message: string; panier?: Panier }> {
  try {
    const panier = await apiFetch<Panier>("/panier/", {
      method: "POST",
      body: JSON.stringify({ id_article: productId, quantite: quantity }),
    });
    return { ok: true, message: "Article ajouté au panier.", panier };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur lors de l'ajout.";
    return { ok: false, message: msg };
  }
}

export async function updateCartLine(
  ligneId: number,
  quantity: number
): Promise<{ ok: boolean; panier?: Panier }> {
  try {
    const panier = await apiFetch<Panier>(`/panier/lignes/${ligneId}/`, {
      method: "PUT",
      body: JSON.stringify({ quantite: quantity }),
    });
    return { ok: true, panier };
  } catch {
    return { ok: false };
  }
}

export async function removeFromCart(ligneId: number): Promise<{ ok: boolean }> {
  try {
    await apiFetch(`/panier/lignes/${ligneId}/`, { method: "DELETE" });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function clearCart(): Promise<{ ok: boolean }> {
  try {
    await apiFetch("/panier/vider/", { method: "DELETE" });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ── Recommandations ──────────────────────────────────────────────────────────

export async function logArticleVisit(id_article: number, duree_secondes: number = 30): Promise<{ ok: boolean }> {
  try {
    await apiFetch("/recommandations/visite/", {
      method: "POST",
      body: JSON.stringify({ id_article, duree_secondes }),
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ── Commandes ────────────────────────────────────────────────────────────────

export async function checkout(options?: {
  methode?: string;
  adresse_livraison?: string;
}): Promise<{ ok: boolean; message: string; data?: unknown }> {
  try {
    const data = await apiFetch("/commandes/checkout/", {
      method: "POST",
      body: JSON.stringify({
        methode: options?.methode ?? "CARTE_SIMULEE",
        adresse_livraison: options?.adresse_livraison ?? "",
      }),
    });
    return { ok: true, message: "Commande passée avec succès.", data };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur lors du checkout.";
    return { ok: false, message: msg };
  }
}

export async function getCommandes(): Promise<DemandeAchat[]> {
  try {
    return await apiFetch<DemandeAchat[]>("/commandes/");
  } catch {
    return [];
  }
}

// ── Admin Dashboard Stats ────────────────────────────────────────────────────

export async function getAdminDashboardStats(): Promise<Record<string, unknown> | null> {
  try {
    return await apiFetch<Record<string, unknown>>("/securite/dashboard-stats/");
  } catch {
    return null;
  }
}

// ── Security Alerts ──────────────────────────────────────────────────────────

export type AlerteSecurite = {
  id_alerte: number;
  type_attaque: string;
  niveau_severite: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ip_source: string;
  horodatage: string;
  details: string | null;
  statut_alerte: "NOUVEAU" | "VU" | "RESOLU";
};

export async function getSecurityAlerts(): Promise<AlerteSecurite[]> {
  try {
    return await apiFetch<AlerteSecurite[]>("/securite/alertes/");
  } catch {
    return [];
  }
}

export async function updateAlertStatus(
  id: number,
  form: { statut_alerte: string }
): Promise<{ ok: boolean; message: string }> {
  try {
    await apiFetch(`/securite/alertes/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(form),
    });
    return { ok: true, message: "Alerte mise à jour." };
  } catch (e: unknown) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur." };
  }
}
// ── Super Admin: Create new admin ────────────────────────────────────────────

export async function createAdmin(form: {
  email: string;
  password: string;
  nom_complet: string;
  admin_specialite: string;
}): Promise<{ ok: boolean; message: string }> {
  try {
    const data = await apiFetch<{ detail: string }>("/auth/admin/create-admin/", {
      method: "POST",
      body: JSON.stringify(form),
    });
    return { ok: true, message: data.detail };
  } catch (e: unknown) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur lors de la création." };
  }
}

export { API_BASE_URL as default };