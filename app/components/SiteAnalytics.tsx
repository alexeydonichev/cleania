"use client";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { readAttribution } from "@/lib/attribution";
import { trackConversion } from "@/lib/analytics";
import { isPreviewDeployment } from "@/lib/deployment";

function subscribeConsent(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("bleskpro:consent", listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener("bleskpro:consent", listener); };
}
function consentSnapshot() { try { return localStorage.getItem("bleskpro-analytics"); } catch { return null; } }

export default function SiteAnalytics() {
  const path = usePathname();
  const consent = useSyncExternalStore(subscribeConsent, consentSnapshot, () => "pending");
  const prompt = consent === null;
  const enabled = consent === "yes";
  const id = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  const allowed = !isPreviewDeployment && !path.startsWith("/crm") && !path.startsWith("/api") && Boolean(id && /^\d+$/.test(id));
  useEffect(() => {
    if (path.startsWith("/crm") || isPreviewDeployment) return;
    readAttribution();
    const click = (event: MouseEvent) => {
      const anchor = (event.target as Element)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (href.startsWith("tel:")) trackConversion("call_click");
      else if (/^https:\/\/t\.me\//.test(href)) trackConversion("telegram_click");
      else if (/^https:\/\/(max\.ru|max\.me)\//.test(href)) trackConversion("max_click");
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, [path]);
  useEffect(() => {
    if (!allowed || !enabled || !id) return;
    if (!window.ym) {
      const ym = (...args: unknown[]) => { (ym.a ||= []).push(args); };
      ym.a = [] as unknown[][]; ym.l = Date.now(); window.ym = ym;
      const script = document.createElement("script"); script.async = true; script.src = "https://mc.yandex.ru/metrika/tag.js"; document.head.appendChild(script);
      window.ym(Number(id), "init", { defer: true, clickmap: false, trackLinks: false, accurateTrackBounce: true, webvisor: false });
    }
    window.ym(Number(id), "hit", new URL(path, window.location.origin).href);
  }, [allowed, enabled, id, path]);
  if (!allowed || !prompt) return null;
  function choose(accept: boolean) { try { localStorage.setItem("bleskpro-analytics", accept ? "yes" : "no"); } catch {} window.dispatchEvent(new Event("bleskpro:consent")); }
  return <aside className="analytics-choice" aria-label="Настройки аналитики"><p>Разрешите Яндекс Метрике помочь нам улучшать сайт? Поля заявок и записи действий не передаём. <a href="/privacy">Подробнее</a></p><button type="button" onClick={() => choose(true)}>Разрешить</button><button type="button" onClick={() => choose(false)}>Без аналитики</button></aside>;
}
