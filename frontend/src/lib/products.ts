import { mockProducts } from "@/data/mock-products";
import { Product } from "@/lib/types";

export function getVendorProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("vendorProducts");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getDisabledProductIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("disabledProducts");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getAllProducts(): Product[] {
  const disabled = getDisabledProductIds();
  const vendor = getVendorProducts();
  return [...mockProducts, ...vendor].filter((p) => !disabled.includes(p.id_article));
}

export function getProductById(id: number): Product | undefined {
  return getAllProducts().find((p) => p.id_article === id);
}

export function disableProduct(id: number) {
  const disabled = getDisabledProductIds();
  if (!disabled.includes(id)) {
    localStorage.setItem("disabledProducts", JSON.stringify([...disabled, id]));
  }
}

export function enableProduct(id: number) {
  const disabled = getDisabledProductIds();
  localStorage.setItem("disabledProducts", JSON.stringify(disabled.filter((i) => i !== id)));
}

export function deleteVendorProduct(id: number) {
  const products = getVendorProducts().filter((p) => p.id_article !== id);
  localStorage.setItem("vendorProducts", JSON.stringify(products));
}
