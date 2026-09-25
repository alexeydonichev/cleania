"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { calculateQuote, defaultPricing, maxQuoteArea, money, serviceKeys, type City, type QuoteInput, type ServiceKey } from "@/lib/quote";
function useBookingState(initialService: ServiceKey) {
  const [input, setInput] = useState<QuoteInput>({ service: initialService, area: 50, bathrooms: 1, condition: "normal", frequency: "once", extras: [] });
  const [city, setCity] = useState<City>("Новосибирск");
  const [pricing, setPricing] = useState(defaultPricing);
  const [pricingStatus, setPricingStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pricingRevision, setPricingRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/pricing", { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("pricing");
      const data = await response.json() as { rules: Array<{ key: ServiceKey; label: string; rate: number; minimum: number }> };
      const rules = { ...defaultPricing };
      if (!serviceKeys.every(key => data.rules.some(rule => rule.key === key && Number.isFinite(Number(rule.rate)) && Number(rule.rate) > 0 && Number(rule.minimum) > 0))) throw new Error("pricing");
      for (const rule of data.rules) if (serviceKeys.includes(rule.key)) rules[rule.key] = { label: rule.label, rate: Number(rule.rate), minimum: Number(rule.minimum) };
      setPricing(rules); setPricingStatus("ready");
    }).catch(error => { if (error.name !== "AbortError") setPricingStatus("error"); });
    return () => controller.abort();
  }, [pricingRevision]);
  const update = useCallback((patch: Partial<QuoteInput>) => {
    setInput(current => {
      const next = { ...current, ...patch, ...(patch.service && patch.service !== "regular" ? { frequency: "once" as const } : {}) };
      // Commercial and industrial objects use the dedicated business tariff.
      // Apply this after every patch: otherwise choosing a residential service
      // after an industrial object would create a misleading mixed quote.
      if (patch.service === "office" && next.propertyType !== "industrial") next.propertyType = "commercial";
      if (next.propertyType === "commercial" || next.propertyType === "industrial") {
        next.service = "office";
        next.frequency = "once";
      } else if (next.service === "office") {
        next.service = "regular";
        next.frequency = "once";
      }
      next.area = Math.max(20, Math.min(maxQuoteArea(next), next.area));
      return next;
    });
  }, []);
  return { input, update, city, setCity, pricing, pricingStatus, refreshPricing: () => { setPricingStatus("loading"); setPricingRevision(value => value + 1); }, quote: calculateQuote(input, pricing[input.service]) };
}
const BookingContext = createContext<ReturnType<typeof useBookingState> | null>(null);
export function BookingProvider({ children, initialService = "regular" }: { children: ReactNode; initialService?: ServiceKey }) {
  const value = useBookingState(initialService);
  const { input, update, quote } = value;
  const lastAmount = useRef(quote.total);
  const serviceFromUrlApplied = useRef(false);
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    if (serviceFromUrlApplied.current) return;
    const requestedService = new URLSearchParams(window.location.search).get("service") as ServiceKey | null;
    if (!requestedService || !serviceKeys.includes(requestedService)) {
      serviceFromUrlApplied.current = true;
      return;
    }
    if (input.service !== requestedService) {
      update({ service: requestedService });
      return;
    }
    // React may replay mount effects and temporarily restore the original
    // state. Mark the link handled on the next task, after that replay has
    // settled, so a direct service link works once and a later manual choice
    // remains entirely under the visitor's control.
    const timer = window.setTimeout(() => { serviceFromUrlApplied.current = true; }, 0);
    return () => window.clearTimeout(timer);
  }, [input.service, update]);
  useEffect(() => {
    if (lastAmount.current === quote.total) return;
    // One announcement after a sequence of edits, instead of three competing prices.
    const timer = window.setTimeout(() => { lastAmount.current = quote.total; setAnnouncement(`Предварительная стоимость ${money(quote.total)} рублей.`); }, 350);
    return () => window.clearTimeout(timer);
  }, [quote.total]);
  return <BookingContext.Provider value={value}>{children}<span className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{announcement}</span></BookingContext.Provider>;
}
export function useBooking() { const value = useContext(BookingContext); if (!value) throw new Error("BookingProvider is required"); return value; }
