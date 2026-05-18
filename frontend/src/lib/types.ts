// ── Frontend display types (used by UI components) ────────────────────────

export type Role = "admin" | "vendeur" | "client";

/**
 * Frontend Product type — field names aligned with Django models and UML class diagram.
 * Built from backend Article response via articleToProduct() in api-client.
 */
export type Product = {
  id_article: number;          // PK — was `id`
  designation: string;         // product name — was `name`
  description: string;
  prix_vente: number;          // unit price (parsed to number) — was `price`
  quantite_disponible: number; // stock quantity — was `stock`
  id_famille: number;          // FK to Famille — was `category` (string)
  famille_libelle: string;     // category display name (famille.libelle)
  vendorName: string;          // display helper (vendeur_boutique)
  imageUrl: string;            // display helper (photo_principale url)
  actif?: boolean;              // is active (defaults to true)
};

export type CartItem = {
  productId: number;
  quantity: number;
};

// ── Backend-aligned types (mirror Django models / serializer output) ────────

/** Mirrors Famille serializer: { id_famille, libelle, description, slug } */
export type Famille = {
  id_famille: number;
  libelle: string;
  description: string | null;
  slug: string;
};

/** Mirrors ArticleListSerializer output */
export type ArticleList = {
  id_article: number;
  designation: string;
  prix_vente: string;
  photo_principale: string | null;
  stock_dispo: number;
  id_famille: number;
  famille_libelle: string;
  vendeur_boutique: string | null;
  actif?: boolean;
};

/** Mirrors ArticleDetailSerializer output */
export type Article = {
  id_article: number;
  designation: string;
  description: string;
  prix_vente: string;
  quantite_disponible: number;
  est_disponible: boolean;
  id_famille: number;
  famille_libelle: string;
  id_vendeur: number;
  vendeur_boutique: string | null;
  photos: { id_photo: number; chemin_fichier: string; est_principale: boolean }[];
  date_ajout: string;
  actif?: boolean;
};

/** Mirrors MemberSerializer output */
export type Membre = {
  id_membre: number;
  nom_complet: string;
  email: string;
  role: "ADMIN" | "VENDEUR" | "CLIENT";
  telephone: string | null;
  nom_boutique: string | null;
  raison_sociale: string | null;
  adresse_livraison: string | null;
  date_inscription: string;
  is_active: boolean;
  admin_specialite: "SUPER" | "UTILISATEURS" | "COMMANDES" | "PRODUITS" | "SECURITE" | null;
};

/** Payload sent to POST /api/auth/register/ */
export type SignupPayload = {
  nom_complet: string;
  email: string;
  password: string;
  role: "CLIENT" | "VENDEUR" | "ADMIN";
};

/** Payload sent to POST /api/auth/login/ */
export type LoginPayload = {
  email: string;
  password: string;
};

/** Response from /api/auth/register/ and /api/auth/login/ */
export type AuthResponse = {
  user: Membre;
  access: string;
  refresh: string;
};

/** Mirrors PanierCommandeSerializer */
export type Panier = {
  id_panier: number;
  date_modification: string;
  lignes: LignePanier[];
  total: string;
};

export type LignePanier = {
  id_ligne: number;
  quantite: number;
  id_article: number;
  article_details: ArticleList;
};

/** Mirrors DemandeAchatSerializer */
export type DemandeAchat = {
  id_commande: number;
  reference: string;
  date_commande: string;
  statut: "EN_ATTENTE" | "CONFIRMEE" | "EN_PREPARATION" | "EXPEDIEE" | "LIVREE" | "ANNULEE";
  montant_ht: string;
  montant_ttc: string;
  chemin_facture_pdf: string | null;
  id_acheteur: number;
  acheteur_nom: string;
  details: DetailCommande[];
};

export type DetailCommande = {
  id_detail: number;
  quantite_commandee: number;
  prix_unitaire_fixe: string;
  id_article: number;
  article_designation: string;
  article_prix: string;
};
