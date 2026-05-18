"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

import { Membre } from "@/lib/types";
import { getAdminUsersAPI, updateAdminUserStatusAPI, deleteAdminUserAPI } from "@/lib/api-client";

const roleLabel: Record<string, string> = {
  CLIENT: "Client",
  VENDEUR: "Vendeur",
  ADMIN: "Administrateur",
};

const roleBadge: Record<string, string> = {
  CLIENT:  "bg-blue-100 text-blue-700",
  VENDEUR: "bg-purple-100 text-purple-700",
  ADMIN:   "bg-red-100 text-red-700",
};

export default function AdminUtilisateursPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Membre[]>([]);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") { router.replace("/login/admin"); return; }
    loadUsers();
    setMounted(true);
  }, [router]);

  async function loadUsers() {
    try {
      const data = await getAdminUsersAPI();
      setUsers(data);
    } catch (e: any) {
      setErrorMsg("Erreur chargement: " + e.message);
    }
  }

  async function toggleSuspend(id: number, currentStatus: boolean) {
    setErrorMsg(null);
    try {
      const res = await updateAdminUserStatusAPI(id, { is_active: !currentStatus });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id_membre === id ? { ...u, is_active: !currentStatus } : u))
        );
      } else {
        setErrorMsg("API Error (PATCH): " + res.message);
      }
    } catch (e: any) {
      setErrorMsg("Exception (PATCH): " + e.message);
    }
  }

  async function deleteUser(id: number) {
    setErrorMsg(null);
    if (!confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) return;
    try {
      const res = await deleteAdminUserAPI(id);
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id_membre !== id));
      } else {
        setErrorMsg("API Error (DELETE): " + res.message);
      }
    } catch (e: any) {
      setErrorMsg("Exception (DELETE): " + e.message);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.nom_complet ?? "").toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <section className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/dashboard/admin" className="text-sm font-semibold text-brand-700 hover:underline underline-offset-2">
              ← Dashboard Admin
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Gestion des Utilisateurs</h1>
          <p className="text-sm text-slate-500">{users.length} utilisateur{users.length !== 1 ? "s" : ""} enregistré{users.length !== 1 ? "s" : ""}</p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
          👥 Administration
        </span>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm animate-fade-in">
          <p className="font-semibold mb-1">Erreur inattendue</p>
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Search + table */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-slate-400">🔍</span>
            <input
              className="flex-1 bg-transparent text-sm placeholder-slate-400 outline-none"
              placeholder="Rechercher par nom, email, rôle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {users.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-slate-500">Aucun utilisateur enregistré pour le moment.</p>
            <p className="text-xs text-slate-400 mt-1">Les comptes créés via la page Inscription apparaîtront ici.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 pr-4 font-semibold text-slate-500">Utilisateur</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-500">Email</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-500">Rôle</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-500">Statut</th>
                  <th className="pb-3 font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id_membre} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm">
                          👤
                        </span>
                        <span className="font-semibold text-slate-800">{user.nom_complet || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{user.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${roleBadge[user.role] ?? "bg-slate-100 text-slate-700"}`}>
                        {roleLabel[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        !user.is_active
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {!user.is_active ? "Suspendu" : "Actif"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleSuspend(user.id_membre, user.is_active)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                            !user.is_active
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          {!user.is_active ? "Activer" : "Suspendre"}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id_membre)}
                          className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && search && (
              <p className="py-8 text-center text-sm text-slate-500">Aucun utilisateur trouvé pour « {search} »</p>
            )}
          </div>
        )}
      </article>
    </section>
  );
}
