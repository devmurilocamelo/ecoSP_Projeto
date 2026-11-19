"use client";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { heartbeat } from "@/lib/actions";

// Mantém todos os usuários sincronizados: atualiza os dados a cada X segundos
// (apenas quando a aba está visível e ninguém está digitando).
// Também avisa o servidor que a pessoa está online e em qual tela está.
export default function AutoRefresh({ interval = 8000, beatEvery = 20000 }) {
  const router = useRouter();
  const path = usePathname();
  const lastBeat = useRef(0);

  useEffect(() => {
    const beat = (force = false) => {
      if (document.visibilityState !== "visible") return;
      if (!force && Date.now() - lastBeat.current < beatEvery) return;
      lastBeat.current = Date.now();
      heartbeat(path).catch(() => {});
    };
    beat(true); // ao abrir/mudar de tela

    const tick = () => {
      if (document.visibilityState !== "visible") return;
      beat();
      const el = document.activeElement;
      if (el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      router.refresh();
    };
    const id = setInterval(tick, interval);
    const onFocus = () => {
      beat(true);
      router.refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [router, path, interval, beatEvery]);
  return null;
}
