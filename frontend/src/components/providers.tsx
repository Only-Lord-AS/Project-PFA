"use client";

import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/header";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </CartProvider>
  );
}
