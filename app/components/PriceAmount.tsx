"use client";

import { money } from "@/lib/quote";

/** Show the actual amount immediately; never count through fictitious prices. */
export default function PriceAmount({ amount }: { amount: number }) {
  return <span className="price-amount"><span className="price-digits" key={amount}>{money(amount)}</span><span className="price-currency"> ₽</span></span>;
}
