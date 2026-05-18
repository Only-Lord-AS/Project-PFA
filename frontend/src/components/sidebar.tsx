"use client";

import Link from "next/link";
import Image from "next/image";

export const CATEGORIES = [
  { name: "Tous",                  icon: "🛍️", image: "/categories/product.png", slug: "tous",                  color: "text-slate-700",   bg: "bg-slate-100" },
  { name: "High-Tech",             icon: "💻", image: "/categories/hightech.png",  slug: "High-Tech",             color: "text-blue-700",    bg: "bg-blue-50" },
  { name: "Consoles & Jeux Vidéo", icon: "🎮", image: "/categories/gaming.png",    slug: "Consoles & Jeux Vidéo", color: "text-purple-700",  bg: "bg-purple-50" },
  { name: "Mode",                  icon: "👗", image: "/categories/fashion.png",   slug: "Mode",                  color: "text-pink-700",    bg: "bg-pink-50" },
  { name: "Cuisine & Maison",      icon: "🏠", image: "/categories/house.png",     slug: "Cuisine & Maison",      color: "text-orange-700",  bg: "bg-orange-50" },
  { name: "Livres",                icon: "📚", image: "/categories/book.png",      slug: "Livres",                color: "text-emerald-700", bg: "bg-emerald-50" },
  { name: "Jardin",                icon: "🌿", image: "/categories/garden.png",    slug: "Jardin",                color: "text-green-700",   bg: "bg-green-50" },
  { name: "Accessoires",           icon: "🎒", image: "/categories/accessory.png", slug: "Accessoires",           color: "text-indigo-700",  bg: "bg-indigo-50" },
  { name: "Animalerie",            icon: "🐾", image: "/categories/pet.png",       slug: "Animalerie",            color: "text-amber-700",   bg: "bg-amber-50" },
  { name: "Sport & Voyage",        icon: "✈️", image: "/categories/sport.png",     slug: "Sport & Voyage",        color: "text-sky-700",     bg: "bg-sky-50" },
];

type CategorySidebarProps = {
  activeCategory?: string;
};

export function CategorySidebar({ activeCategory = "Tous" }: CategorySidebarProps) {
  return (
    <aside className="sticky top-20 h-fit w-56 shrink-0 hidden md:block animate-slide-in-left">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Sidebar header */}
        <div className="bg-purple-600 px-4 py-3.5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/80">
            Catégories
          </h2>
        </div>

        {/* Category links */}
        <nav className="thin-scrollbar max-h-[65vh] overflow-y-auto p-2 space-y-0.5">
          {CATEGORIES.map((cat) => {
            const isActive =
              cat.name === activeCategory ||
              (cat.name === "Tous" && activeCategory === "Tous");

            return (
              <Link
                key={cat.slug}
                href={cat.name === "Tous" ? "/catalogue" : `/categorie/${encodeURIComponent(cat.slug)}`}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? `${cat.bg} ${cat.color} ring-1 ring-current ring-opacity-30`
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span
  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden transition-all ${
    isActive ? cat.bg : "bg-slate-100 group-hover:bg-slate-200"
  }`}
>
  {cat.image ? (
    <img
      src={cat.image}
      alt={cat.name}
      className="h-5 w-5 object-contain"
    />
  ) : (
    <span className="text-base">{cat.icon}</span>
  )}
</span>
                <span className="leading-tight">{cat.name}</span>
                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-current opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>


      </div>
    </aside>
  );
}
