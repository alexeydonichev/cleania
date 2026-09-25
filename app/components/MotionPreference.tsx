"use client";

import { useSyncExternalStore } from "react";
import { motionPreferenceEvent, motionPreferenceKey, reducedMotion, subscribeMotionPreference } from "@/lib/motion";

function serverSnapshot() { return false; }
function clientSnapshot() { return true; }
function subscribeHydration() { return () => {}; }

export default function MotionPreference() {
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const reduced = useSyncExternalStore(subscribeMotionPreference, reducedMotion, serverSnapshot);
  const systemReduced = useSyncExternalStore(subscribeMotionPreference, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, serverSnapshot);
  function toggle() {
    const next = !reduced;
    document.documentElement.dataset.motion = next ? "reduced" : "full";
    try { window.localStorage.setItem(motionPreferenceKey, String(next)); } catch { /* still works for this visit */ }
    window.dispatchEvent(new Event(motionPreferenceEvent));
  }
  return <button className="motion-preference" type="button" aria-pressed={reduced} disabled={!hydrated || systemReduced} onClick={toggle} title={systemReduced ? "Уменьшение движения включено в настройках вашего устройства" : "Выключить декоративное движение, сохранив все возможности сайта"}>
    <span className="motion-toggle-track" aria-hidden="true"><span /></span><span>{systemReduced ? "Меньше движения · система" : "Меньше анимации"}</span>
  </button>;
}
