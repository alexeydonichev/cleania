"use client";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";

export default function CrmDialog({ label, onClose, returnFocus, children }: {
  label: string;
  onClose: () => void;
  returnFocus: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const trigger = returnFocus.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      const target = trigger?.isConnected ? trigger : document.getElementById("crm-add-lead");
      target?.focus({ preventScroll: true });
    };
  }, [returnFocus]);
  return <dialog ref={ref} className="desk-overlay" aria-label={label}
    onKeyDown={event => {
      if (event.key !== "Tab") return;
      const nodes = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button,a[href],input,select,textarea,summary,[tabindex]"))
        .filter(node => {
          if (node.tabIndex < 0 || node.matches(":disabled") || !node.checkVisibility()) return false;
          // Some browsers report layout rectangles inside a collapsed details.
          for (let ancestor = node.parentElement; ancestor && ancestor !== event.currentTarget; ancestor = ancestor.parentElement) {
            if (ancestor instanceof HTMLDetailsElement && !ancestor.open && !ancestor.querySelector(":scope > summary")?.contains(node)) return false;
          }
          return true;
        });
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <section className="desk-drawer">{children}</section>
  </dialog>;
}
