export const brandName = "БлескПРО";
export const brandDomain = "блескпро.рф";
// ASCII hostname keeps canonicals, structured data and XML URLs interoperable.
export const brandUrl = "https://xn--90aipcrfhf.xn--p1ai";
export const brandLogo = { src: "/brand/bleskpro-logo.webp", width: 1786, height: 406 } as const;
export const contactPhone = "+79833216224";
export const contactPhoneDisplay = "+7 (983) 321-62-24";
export const telegramUrl = `https://t.me/${contactPhone}`;

// MAX profiles use a share link from the account, not a guessed phone-number URL.
export function validMaxProfileUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !["max.ru", "max.me"].includes(url.hostname) || url.pathname === "/" || url.username || url.password || url.port) return null;
    return url.href;
  } catch { return null; }
}
export const maxProfileUrl = validMaxProfileUrl(process.env.NEXT_PUBLIC_MAX_PROFILE_URL)
  || "https://max.ru/u/f9LHodD0cOL_ChoX1ycy6SEeFgN0oJbvuJ9aBBIPjgGjX6vBrkJjUBuKpd0";
