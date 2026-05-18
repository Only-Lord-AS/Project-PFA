"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { getCurrentUser, logout } from "@/lib/auth";

const publicNavLinks = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Catalogue" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ nom_complet: string; email: string; role: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
    setCurrentUser(getCurrentUser());

    const syncUser = () => setCurrentUser(getCurrentUser());
    window.addEventListener("userChanged", syncUser);
    return () => window.removeEventListener("userChanged", syncUser);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/catalogue?q=${encodeURIComponent(q)}` : "/catalogue");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 glass shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
         <img src="/logo.png" alt="MarocShop" className="h-16 w-16 object-contain" />
          <span className="text-xl font-extrabold text-brand-700 tracking-tight">MarocShop</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="hidden flex-1 max-w-md md:flex">
          <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-brand-300 transition-colors">
            <button type="submit" className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
              🔍
            </button>
            <input
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
              placeholder="Rechercher des produits, marques..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {publicNavLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`hidden rounded-lg px-3 py-1.5 text-sm font-medium transition-all lg:block ${
                  active
                    ? "bg-blue-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {mounted && currentUser?.role === "admin" && (
            <Link
              href="/dashboard/admin"
              className={`hidden rounded-lg px-3 py-1.5 text-sm font-medium transition-all lg:block ${
                pathname === "/dashboard/admin"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Admin
            </Link>
          )}
          {mounted && currentUser?.role === "vendeur" && (
            <Link
              href="/dashboard/vendeur"
              className={`hidden rounded-lg px-3 py-1.5 text-sm font-medium transition-all lg:block ${
                pathname === "/dashboard/vendeur"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Vendeur
            </Link>
          )}

          {/* Auth area */}
          {mounted && currentUser ? (
            <div className="flex items-center gap-2">
              {currentUser.role === "client" && (
                <Link
                  href="/commandes"
                  className={`hidden rounded-lg px-3 py-1.5 text-sm font-medium transition-all lg:block ${
                    pathname === "/commandes"
                      ? "bg-blue-700 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Historique commandes
                </Link>
              )}
              <Link
                href="/profil"
                className={`hidden rounded-lg px-3 py-1.5 text-sm font-medium transition-all lg:block ${
                  pathname === "/profil"
                    ? "bg-blue-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Mon Profil
              </Link>
              <span className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 lg:inline">
                👤 {currentUser.nom_complet || currentUser.email}
              </span>
              <button
                onClick={logout}
                className="rounded-xl border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-blue-700 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-all"
            >
              Connexion
            </Link>
          )}

          {/* Cart button with badge */}
          <Link
            href="/panier"
            className="relative flex items-center gap-1.5 rounded-xl bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800 transition-all shadow-sm"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Panier</span>
            {mounted && totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-sm animate-scale-in">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
