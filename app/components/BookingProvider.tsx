"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { calculateQuote, defaultPricing, serviceKeys, type City, type QuoteInput, type ServiceKey } from "@/lib/quote";
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
  function update(patch: Partial<QuoteInput>) { setInput(current => ({ ...current, ...patch, ...(patch.service && patch.service !== "regular" ? { frequency: "once" as const } : {}) })); }
  return { input, update, city, setCity, pricing, pricingStatus, refreshPricing: () => { setPricingStatus("loading"); setPricingRevision(value => value + 1); }, quote: calculateQuote(input, pricing[input.service]) };
}
const BookingContext = createContext<ReturnType<typeof useBookingState> | null>(null);
export function BookingProvider({ children, initialService = "regular" }: { children: ReactNode; initialService?: ServiceKey }) { const value = useBookingState(initialService); return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>; }
export function useBooking() { const value = useContext(BookingContext); if (!value) throw new Error("BookingProvider is required"); return value; }
