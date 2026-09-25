"use client";
import { useEffect } from "react";
import { motionEase, reducedMotion, subscribeMotionPreference } from "@/lib/motion";

export default function MotionDesign() {
  useEffect(() => {
    const preferenceListeners = new Set<() => void>();
    const unsubscribe = subscribeMotionPreference(() => preferenceListeners.forEach(listener => listener()));
    const targets = Array.from(document.querySelectorAll<HTMLElement>(
      ".home-heading, .home-service, .checklist-layout, .process-card, .case-panel, .location-section, .faq-section > div:first-child, .faq-section details, .business-strip, .footer-top > div",
    ));
    let revealObserver: IntersectionObserver | undefined;
    const reveal = (element: HTMLElement) => {
      element.dataset.reveal = "visible";
      revealObserver?.unobserve(element);
    };
    function configureReveals() {
      revealObserver?.disconnect();
      targets.forEach(element => { element.removeAttribute("data-reveal"); element.style.removeProperty("--reveal-delay"); });
      if (reducedMotion() || !("IntersectionObserver" in window)) return;
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target as HTMLElement); });
      }, { threshold: .015, rootMargin: "0px 0px 60px 0px" });
      targets.forEach(element => {
        if (element.getBoundingClientRect().top <= window.innerHeight) return;
        element.dataset.reveal = "waiting";
        const group = element.closest(".home-services, .process-grid, .footer-top");
        const index = group ? Array.from(group.children).indexOf(element) : 0;
        element.style.setProperty("--reveal-delay", `${Math.max(0, index) * 65}ms`);
        revealObserver?.observe(element);
      });
    }
    configureReveals();
    preferenceListeners.add(configureReveals);
    const focusReveal = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const parent = target.closest<HTMLElement>('[data-reveal="waiting"]');
      if (parent) { parent.style.setProperty("--reveal-delay", "0ms"); reveal(parent); }
    };
    document.addEventListener("focusin", focusReveal);

    const cleanups: Array<() => void> = [];
    // Native details still works without JS. This enhancement also animates closing.
    document.querySelectorAll<HTMLDetailsElement>(".faq-section details").forEach(details => {
      const summary = details.querySelector("summary");
      if (!summary) return;
      let animation: Animation | undefined;
      let expanded = details.open;
      const finish = (value: boolean) => {
        details.open = value;
        details.style.removeProperty("overflow");
        details.removeAttribute("data-expanding");
        animation = undefined;
      };
      const click = (event: MouseEvent) => {
        if (reducedMotion() || typeof details.animate !== "function") return;
        event.preventDefault();
        const start = details.getBoundingClientRect().height;
        expanded = !expanded;
        animation?.cancel();
        details.open = true;
        details.dataset.expanding = String(expanded);
        const borders = getComputedStyle(details);
        const borderHeight = parseFloat(borders.borderTopWidth) + parseFloat(borders.borderBottomWidth);
        const end = expanded ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + borderHeight;
        details.style.overflow = "hidden";
        const next = details.animate([{ height: `${start}px` }, { height: `${end}px` }], { duration: 380, easing: motionEase });
        animation = next;
        next.finished.then(() => { if (animation === next) finish(expanded); }).catch(() => {});
      };
      const preference = () => { animation?.cancel(); finish(expanded); };
      // Keep the enhancement aligned when details is opened by native find-in-page.
      const toggle = () => { if (!animation) expanded = details.open; };
      summary.addEventListener("click", click);
      details.addEventListener("toggle", toggle);
      preferenceListeners.add(preference);
      cleanups.push(() => { animation?.cancel(); finish(expanded); summary.removeEventListener("click", click); details.removeEventListener("toggle", toggle); preferenceListeners.delete(preference); });
    });

    const menu = document.querySelector<HTMLDetailsElement>(".mobile-menu");
    const summary = menu?.querySelector("summary");
    const menuNav = menu?.querySelector("nav");
    let menuAnimation: Animation | undefined;
    let menuExpanded = menu?.open || false;
    function setMenu(open: boolean, animate = true) {
      if (!menu || !menuNav) return;
      const closedFrame = { opacity: 0, transform: "translate3d(0,-12px,0)", clipPath: "inset(0 0 12% 0)" };
      const openFrame = { opacity: 1, transform: "translate3d(0,0,0)", clipPath: "inset(0 0 0 0)" };
      const style = getComputedStyle(menuNav);
      const start = menu.open ? { opacity: style.opacity, transform: style.transform, clipPath: style.clipPath } : closedFrame;
      menuExpanded = open;
      menuAnimation?.cancel();
      menuAnimation = undefined;
      menu.dataset.expanded = String(open);
      summary?.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      if (!animate || reducedMotion() || typeof menuNav.animate !== "function") { menu.open = open; return; }
      menu.open = true;
      const next = menuNav.animate([start, open ? openFrame : closedFrame], { duration: open ? 380 : 200, easing: motionEase });
      menuAnimation = next;
      next.finished.then(() => { if (menuAnimation === next) { menu.open = open; menuAnimation = undefined; } }).catch(() => {});
    }
    const toggleMenu = (event: MouseEvent) => { event.preventDefault(); setMenu(!menuExpanded); };
    const menuLink = (event: MouseEvent) => { if ((event.target as Element).closest("a")) setMenu(false, false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && menuExpanded) { setMenu(false); summary?.focus(); } };
    const outside = (event: PointerEvent) => { if (menuExpanded && !menu?.contains(event.target as Node)) setMenu(false); };
    const stopMenuMotion = () => setMenu(menuExpanded, false);
    const desktop = window.matchMedia("(min-width: 801px)");
    const closeOnDesktop = () => { if (desktop.matches) setMenu(false, false); };
    summary?.addEventListener("click", toggleMenu);
    menu?.addEventListener("click", menuLink);
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    preferenceListeners.add(stopMenuMotion);
    desktop.addEventListener("change", closeOnDesktop);

    const header = document.querySelector<HTMLElement>(".site-header");
    const sentinel = document.querySelector(".header-sentinel");
    let headerObserver: IntersectionObserver | undefined;
    let navObserver: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      headerObserver = new IntersectionObserver(entries => {
        if (header) header.dataset.scrolled = String(!entries[0].isIntersecting);
      });
      if (sentinel) headerObserver.observe(sentinel);
      const visibility = new Map<string, boolean>();
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".desktop-nav a"));
      navObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => visibility.set(entry.target.id, entry.isIntersecting));
        const current = Array.from(visibility).find(([, visible]) => visible)?.[0];
        links.forEach(link => {
          if (link.hash === `#${current}`) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }, { rootMargin: "-18% 0px -55% 0px", threshold: 0 });
      ["services", "calculator", "quality", "work", "faq"].forEach(id => { const section = document.getElementById(id); if (section) navObserver?.observe(section); });
    }

    return () => {
      revealObserver?.disconnect(); headerObserver?.disconnect(); navObserver?.disconnect();
      unsubscribe();
      preferenceListeners.clear();
      desktop.removeEventListener("change", closeOnDesktop);
      document.removeEventListener("focusin", focusReveal);
      document.removeEventListener("keydown", escape); document.removeEventListener("pointerdown", outside);
      summary?.removeEventListener("click", toggleMenu); menu?.removeEventListener("click", menuLink);
      menuAnimation?.cancel(); if (menu) { menu.open = false; delete menu.dataset.expanded; }
      summary?.setAttribute("aria-label", "Открыть меню");
      cleanups.forEach(cleanup => cleanup());
      targets.forEach(element => { element.removeAttribute("data-reveal"); element.style.removeProperty("--reveal-delay"); });
      if (header) delete header.dataset.scrolled;
    };
  }, []);
  return <><span className="header-sentinel" aria-hidden="true" /><div className="scroll-progress" aria-hidden="true" /></>;
}
