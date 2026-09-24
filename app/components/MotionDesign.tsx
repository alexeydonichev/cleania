"use client";
import { useEffect } from "react";

export default function MotionDesign() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".home-heading, .home-service, .checklist-layout, .care-visual, .care-copy, .location-section, .faq-section, .business-strip"));
    let observer: IntersectionObserver | undefined;
    function configure() {
      observer?.disconnect();
      targets.forEach(el => { el.removeAttribute("data-reveal"); el.style.removeProperty("--reveal-delay"); });
      if (reduced.matches || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) { (entry.target as HTMLElement).dataset.reveal = "visible"; observer?.unobserve(entry.target); } });
      }, { threshold: .08, rootMargin: "0px 0px 35px 0px" });
      targets.forEach((el,i) => {
        if (el.getBoundingClientRect().top > window.innerHeight) {
          el.dataset.reveal = "waiting";
          el.style.setProperty("--reveal-delay", el.classList.contains("home-service") ? `${(i % 3) * 80}ms` : "0ms");
          observer?.observe(el);
        }
      });
    }
    configure();
    reduced.addEventListener("change", configure);
    const menu = document.querySelector<HTMLDetailsElement>(".mobile-menu");
    const closeMenu = (event: MouseEvent) => { if ((event.target as Element).closest("a") && menu) menu.open = false; };
    menu?.addEventListener("click", closeMenu);
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && menu?.open) { menu.open = false; menu.querySelector("summary")?.focus(); } };
    document.addEventListener("keydown", escape);
    return () => { observer?.disconnect(); reduced.removeEventListener("change", configure); menu?.removeEventListener("click", closeMenu); document.removeEventListener("keydown", escape); targets.forEach(el => el.removeAttribute("data-reveal")); };
  }, []);
  return <div className="scroll-progress" aria-hidden="true" />;
}
