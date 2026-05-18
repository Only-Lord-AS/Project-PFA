import { Product } from "@/lib/types";
// Famille IDs aligned with backend Famille table (placeholder values for demo mode)
// id_famille: 1=High-Tech, 2=Consoles & Jeux Vidéo, 3=Cuisine & Maison,
//             4=Livres, 5=Jardin, 6=Mode, 7=Accessoires, 8=Animalerie, 9=Sport & Voyage
export const mockProducts: Product[] = [
  {
    id_article: 1,
    designation: "Apple iPhone 15 128 Go",
    description: "DYNAMIC ISLAND, DESIGN INNOVANT,APPAREIL PHOTO 48 MPX AVEC TÉLÉOBJECTIF",
    prix_vente: 7990,
    quantite_disponible: 24,
    id_famille: 1,
    famille_libelle: "High-Tech",
    vendorName: "Apple",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569"
  },
  {
    id_article: 2,
    designation: "Sony PlayStation 5 Slim",
    description: "DESIGN ÉLÉGANT,PROCESSEUR AMÉLIORÉE, STOCKAGE SSD RAPIDE,COMPATIBLE AVEC JEUX PS4",
    prix_vente: 6490,
    quantite_disponible: 11,
    id_famille: 2,
    famille_libelle: "Consoles & Jeux Vidéo",
    vendorName: "PlayStation/Sony",
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3"
  },
  {
    id_article: 3,
    designation: "Samsung Galaxy Tab S9",
    description: "Tablette 11 pouces, ecran AMOLED, 256 Go, S Pen inclus.",
    prix_vente: 7890,
    quantite_disponible: 16,
    id_famille: 1,
    famille_libelle: "High-Tech",
    vendorName: "Samsung",
    imageUrl: "https://www.maxmovil.com/media/catalog/product/cache/2c055c968235f5bf43b443aee4bb62c6/g/a/galaxy-tab-s9-grey_0001_61cpzkko4el._ac_sl1500__1_1.jpg"
  },
  {
    id_article: 4,
    designation: "The Witcher 3 Complete Edition - PS5",
    description: "RPG CULTE AVEC UN MONDE OUVERT IMMERSIF,UNE HISTOIRE RICHE ET DES HEURES DE JEU (DLC INCLUS)",
    prix_vente: 399,
    quantite_disponible: 38,
    id_famille: 2,
    famille_libelle: "Consoles & Jeux Vidéo",
    vendorName: "CD projekt",
    imageUrl: "https://www.galaxus.fr/im/productimages/6/6/8/6/0/2/6/0/4/0/5/1/2/7/4/3/8/9/9/c823af3e-3747-4a1c-a7a2-b90f9fc7aee6.jpg"
  },
  {
    id_article: 5,
    designation: "Robot de cuisine Moulinex i-Companion",
    description: "Cuisinez comme un chef grâce à 12 programmes, simplement avec l'app My Moulinex",
    prix_vente: 4299,
    quantite_disponible: 14,
    id_famille: 3,
    famille_libelle: "Cuisine & Maison",
    vendorName: "Moulinex",
    imageUrl: "https://www.darty.com/darty-et-vous/sites/darty-et-vous/files/2022-07/i-companion-touch-pro-494.jpg"
  },
  {
    id_article: 6,
    designation: "Aspirateur Robot Xiaomi S10+",
    description: "Nettoyage avec système à double disques, élimination optimale des taches, autonomie 2h.",
    prix_vente: 3190,
    quantite_disponible: 19,
    id_famille: 3,
    famille_libelle: "Cuisine & Maison",
    vendorName: "Xiaomi",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8RBg2_pKDWJops1RI5F2SKnjNWoP2lrGQ5g&s"
  },
  {
    id_article: 7,
    designation: "Le Petit Prince - Edition Collector",
    description: "Une édition collector du chef-d'oeuvre de Saint-Exupéry",
    prix_vente: 149,
    quantite_disponible: 62,
    id_famille: 4,
    famille_libelle: "Livres",
    vendorName: "Saint-Exupéry",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHiwSRa5lPe7pubO3Aimw2kMPX0IO4_lDbrw&s"
  },
  {
    id_article: 8,
    designation: "Atomic Habits - Edition Francaise",
    description: "Maîtriser les petits comportements qui mènent à des résultats remarquables.",
    prix_vente: 189,
    quantite_disponible: 45,
    id_famille: 4,
    famille_libelle: "Livres",
    vendorName: "James Clear",
    imageUrl: "https://www.methodseattle.com/wp-content/uploads/2022/04/IMG_7321.jpg"
  },
  {
    id_article: 9,
    designation: "Salon de jardin 4 places en resine",
    description: "Canape + 2 fauteuils + table basse, resistant UV.",
    prix_vente: 2890,
    quantite_disponible: 9,
    id_famille: 5,
    famille_libelle: "Jardin",
    vendorName: "GreenHome Deco",
    imageUrl: "https://www.directachat56.fr/Files/31462/Img/13/salon-jardin-resine-tressee-gris-beige-4-personnes-zoom.jpg"
  },
  {
    id_article: 10,
    designation: "Tondeuse electrique Bosch ARM 37",
    description: "Tondeuse filaire 1400W pour petites et moyennes surfaces.",
    prix_vente: 1390,
    quantite_disponible: 17,
    id_famille: 5,
    famille_libelle: "Jardin",
    vendorName: "Bosh",
    imageUrl: "https://i.ebayimg.com/images/g/~UUAAOSwF3Vgi44p/s-l400.jpg"
  },
  {
    id_article: 11,
    designation: "Nike Air Max Excee Homme",
    description: "offre un style moderne avec un amorti confortable grâce à son unité Air visible.",
    prix_vente: 1090,
    quantite_disponible: 34,
    id_famille: 6,
    famille_libelle: "Mode",
    vendorName: "Nike",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
  },
  {
    id_article: 12,
    designation: "Veste trench femme beige",
    description: "Coupe moderne mi-longue, parfaite pour mi-saison.",
    prix_vente: 790,
    quantite_disponible: 28,
    id_famille: 6,
    famille_libelle: "Mode",
    vendorName: "UrbanWear",
    imageUrl: "https://m.media-amazon.com/images/I/81JdrFWQ6yL._AC_UY1000_.jpg"
  },
  {
    id_article: 13,
    designation: "Set manette PS5 DualSense + station charge",
    description: "Ensemble de manette Dualsense et station de charge pour PS5.",
    prix_vente: 1090,
    quantite_disponible: 22,
    id_famille: 7,
    famille_libelle: "Accessoires",
    vendorName: "PlayStation/Sony",
    imageUrl: "https://www.consollection.com/image/actualite/avis-snakebyte-twin-charge-5-la-station-de-charge-de-manettes-dualsense-9483.jpg"
  },
  {
    id_article: 14,
    designation: "Cable USB-C tresse 2m 100W",
    description: "Charge rapide et transfert de donnees pour smartphone/PC.",
    prix_vente: 129,
    quantite_disponible: 120,
    id_famille: 7,
    famille_libelle: "Accessoires",
    vendorName: "TechNova Store",
    imageUrl: "https://ma.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/02/943276/1.jpg?8275"
  },
  {
    id_article: 15,
    designation: "Ecouteurs Bluetooth JBL Tune 230NC",
    description: "Ecouteurs sans fil avec Reduction de bruit active et autonomie jusqu'a 40h.",
    prix_vente: 790,
    quantite_disponible: 51,
    id_famille: 1,
    famille_libelle: "High-Tech",
    vendorName: "Anker",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df"
  },
  {
    id_article: 16,
    designation: "Set de poeles anti-adhesives 3 pieces",
    description: "Poeles induction avec revetement durable sans PFOA.",
    prix_vente: 490,
    quantite_disponible: 40,
    id_famille: 3,
    famille_libelle: "Cuisine & Maison",
    vendorName: "Divory",
    imageUrl: "https://m.media-amazon.com/images/I/81yey6PY0RL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    id_article: 17,
    designation: "Croquettes premium chien adulte 12kg",
    description: "Croquettes pour chiens adultes de grande taille,favorisant sa digestion",
    prix_vente: 469,
    quantite_disponible: 31,
    id_famille: 8,
    famille_libelle: "Animalerie",
    vendorName: "Royal Canin",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThmzxzqiZKh1VsXX8nidkB1qLYX5-DSM141g&s"
  },
  {
    id_article: 18,
    designation: "Valise cabine rigide 55cm",
    description: "Valise compacte et résistante, idéale en cabine avec roulettes 360° et rangement optimisé pour les séjours.",
    prix_vente: 599,
    quantite_disponible: 26,
    id_famille: 9,
    famille_libelle: "Sport & Voyage",
    vendorName: "Travel Zone",
    imageUrl: "https://www.samsonite.fr/on/demandware.static/-/Sites-samsonite-product-catalog/default/dwa99d1159/images/product/shop-the-look_your-travel-starts-here.jpg"
  }
];
