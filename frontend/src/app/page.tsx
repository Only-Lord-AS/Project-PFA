"use client";

import Link from "next/link";
import { ClientProductGrid } from "@/components/client-product-grid";

const stats = [
  { value: "2 500+", label: "Produits", icon: "/categories/product.png" },
  { value: "320",    label: "Vendeurs vérifiés", icon: "✅" },
  { value: "18 000+",label: "Clients actifs", icon: "👥" },
  { value: "4.8★",   label: "Satisfaction client", icon: "⭐" },
];

const categoryHighlights = [
  { name: "High-Tech",             icon: "💻", image: "/categories/hightech.png", gradient: "from-blue-500 to-blue-700",    count: "450+ articles",  slug: "High-Tech" },
  { name: "Mode",                  icon: "👗", image: "/categories/fashion.png", gradient: "from-pink-500 to-rose-600",     count: "820+ articles",  slug: "Mode" },
  { name: "Cuisine & Maison",      icon: "🏠", image: "/categories/house.png", gradient: "from-orange-400 to-orange-600", count: "360+ articles",  slug: "Cuisine & Maison" },
  { name: "Jeux Vidéo",            icon: "🎮", image: "/categories/gaming.png", gradient: "from-purple-500 to-purple-700", count: "290+ articles",  slug: "Consoles & Jeux Vidéo" },
  { name: "Livres",                icon: "📚", image: "/categories/book.png", gradient: "from-emerald-500 to-green-700", count: "1 200+ articles",slug: "Livres" },
  { name: "Sport & Voyage",        icon: "✈️", image: "/categories/sport.png", gradient: "from-sky-500 to-cyan-700",      count: "510+ articles",  slug: "Sport & Voyage" },
];

export default function HomePage() {
  return (
    <div className="space-y-12">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl hero-gradient px-8 py-16 text-white shadow-xl animate-fade-in">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute right-32 bottom-0 h-56 w-56 rounded-full bg-white/5" />
          <div className="absolute left-1/2 top-4 h-32 w-32 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-5 py-2 text-base font-semibold backdrop-blur-sm mb-5">
            E-commerce Marketplace #1 — Livraison rapide partout au Maroc
          </span>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Des milliers de produits,{" "}
            <span className="text-yellow-300">livrés chez vous</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-blue-100 leading-relaxed">
            Découvrez une expérience shopping premium avec les meilleures marques, des vendeurs vérifiés et des prix imbattables.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-blue-800 shadow-lg hover:bg-blue-50 transition-all hover:scale-105"
            >
              Voir le catalogue →
            </Link>
          </div>
        </div>
      </section>

     {/* ── Stats ── */}
<section className="grid grid-cols-2 gap-4 md:grid-cols-4">
  {stats.map((stat, i) => (
    <div
      key={stat.label}
      className={`rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm card-hover animate-fade-in-up animation-delay-${i + 1}00`}
    >
      {stat.icon.startsWith("/") 
        ? <img src={stat.icon} className="h-8 w-8 object-contain mx-auto" />
        : <div className="text-2xl">{stat.icon}</div>
      }

      <div className="mt-2 text-2xl font-extrabold text-brand-700">{stat.value}</div>
      <div className="mt-0.5 text-sm text-slate-500">{stat.label}</div>
    </div>
  ))}
</section>

      {/* ── Categories ── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900">Nos catégories</h2>
          <Link href="/catalogue" className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2">
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categoryHighlights.map((cat) => (
            <Link
              key={cat.name}
              href={`/categorie/${encodeURIComponent(cat.slug)}`}
              className={`category-card group flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${cat.gradient} p-5 text-white border border-transparent text-center`}
            >
              {cat.image 
  ? <img src={cat.image} alt={cat.name} className="h-8 w-8 object-contain" />
  : <span>{cat.icon}</span>
}
              <span className="font-bold text-sm leading-tight">{cat.name}</span>
              <span className="text-xs opacity-75">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured products ── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900">Produits vedettes</h2>
          <Link href="/catalogue" className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2">
            Voir le catalogue →
          </Link>
        </div>
        <ClientProductGrid sliceStart={0} count={6} columns="3" />
      </section>

      {/* ── Recommandations ── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900">Recommandé pour vous</h2>
          <Link href="/catalogue" className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2">
            Voir le catalogue →
          </Link>
        </div>
        <ClientProductGrid sliceStart={6} count={4} columns="4" />
      </section>

      {/* ── Livraison Rapide banner ── */}
      <section>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white shadow-md">
          <h3 className="text-2xl font-extrabold">Livraison Rapide</h3>
          <p className="mt-1 text-sm opacity-90 max-w-lg">
            Livraison gratuite dès 299 MAD d&apos;achat partout au Maroc. Commandez maintenant et recevez vos articles chez vous en 24-48h.
          </p>
          <Link
            href="/catalogue"
            className="mt-5 inline-block rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 hover:bg-green-50 transition-colors"
          >
            Commander maintenant
          </Link>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
          {[
            { icon: "🔒", title: "Paiement sécurisé", desc: "Transactions 100% sécurisées" },
            { icon: "↩️", title: "Retour facile", desc: "30 jours pour changer d'avis" },
            { icon: "🏆", title: "Vendeurs certifiés", desc: "Tous nos vendeurs sont vérifiés" },
            { icon: "📞", title: "Support 7j/7", desc: "Une équipe à votre service" },
          ].map((badge) => (
            <div key={badge.title}>
              <div className="text-2xl">{badge.icon}</div>
              <p className="mt-1 font-semibold text-slate-800 text-sm">{badge.title}</p>
              <p className="text-xs text-slate-500">{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
