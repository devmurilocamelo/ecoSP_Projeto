"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Mantém todos os usuários sincronizados: atualiza os dados a cada X segundos
// (apenas quando a aba está visível e ninguém está digitando).
export default function AutoRefresh({ interval = 8000 }) {
  const router = useRouter();
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      const el = document.activeElement;
      if (el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      router.refresh();
    };
    const id = setInterval(tick, interval);
    const onFocus = () => router.refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [router, interval]);
  return null;
}
