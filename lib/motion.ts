/** Small, shared motion primitives. Never replace native wheel/touch scrolling. */
export const motionEase = "cubic-bezier(0.22, 1, 0.36, 1)";
export const motionPreferenceEvent = "cleania:motion-preference";
export const motionPreferenceKey = "cleania-reduced-motion";

export function reducedMotion() {
  return typeof window === "undefined" || document.documentElement.dataset.motion === "reduced" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function subscribeMotionPreference(listener: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const syncStorage = (event: StorageEvent) => {
    if (event.key !== motionPreferenceKey && event.key !== null) return;
    let saved = false;
    try { saved = window.localStorage.getItem(motionPreferenceKey) === "true"; } catch { /* private browsing can deny storage */ }
    document.documentElement.dataset.motion = saved ? "reduced" : "full";
    listener();
  };
  media.addEventListener("change", listener);
  window.addEventListener(motionPreferenceEvent, listener);
  window.addEventListener("storage", syncStorage);
  return () => {
    media.removeEventListener("change", listener);
    window.removeEventListener(motionPreferenceEvent, listener);
    window.removeEventListener("storage", syncStorage);
  };
}

export function scrollToContent(element: HTMLElement | null) {
  if (!element) return;
  const header = document.querySelector<HTMLElement>(".site-header");
  const clearance = (header?.getBoundingClientRect().height || 0) + 24;
  const top = element.getBoundingClientRect().top;
  // Keep a control in place when it is already in the useful reading area.
  if (top >= clearance && top < clearance + 100) return;
  window.scrollTo({ top: Math.max(0, window.scrollY + top - clearance), behavior: reducedMotion() ? "instant" : "smooth" });
}

/** Focus without letting a sticky header or the mobile action bar hide the field. */
export function focusVisible(element: HTMLElement | null) {
  if (!element) return;
  element.focus({ preventScroll: true });
  window.requestAnimationFrame(() => {
    const frame = element.closest<HTMLElement>(".booking-field, .consent, .file-field") || element;
    const rect = frame.getBoundingClientRect();
    const header = document.querySelector<HTMLElement>(".site-header");
    const action = document.querySelector<HTMLElement>(".booking-action.mobile-docked");
    const actionStyle = action ? getComputedStyle(action) : null;
    const actionHeight = action && actionStyle?.position === "fixed" && actionStyle.visibility !== "hidden" ? action.getBoundingClientRect().height : 0;
    const top = (header?.getBoundingClientRect().height || 0) + 20;
    const bottom = window.innerHeight - actionHeight - 30;
    if (rect.top >= top && rect.bottom <= bottom) return;
    const destination = Math.max(top, top + (bottom - top - rect.height) / 2);
    window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - destination), behavior: reducedMotion() ? "instant" : "smooth" });
  });
}
