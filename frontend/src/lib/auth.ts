import { clearTokens } from "./api-client";

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("currentUser");
  return u ? JSON.parse(u) : null;
}

export function logout() {
  localStorage.removeItem("currentUser");
  clearTokens();
  window.location.href = "/login";
}
