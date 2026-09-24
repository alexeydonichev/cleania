import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/site";
import "./globals.css";
import "./cleania.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Клининг в Новосибирске и Бердске — расчёт уборки онлайн | Cleania",
    template: "%s — Cleania",
  },
  description:
    "Уборка квартир и домов в Новосибирске и Бердске. Поддерживающая, генеральная и после ремонта. Калькулятор с подробной сметой, выбор даты и заявка онлайн.",
  applicationName: "Cleania",
  keywords: [
    "клининг",
    "заказать уборку",
    "уборка квартиры",
    "уборка после ремонта",
    "уборка офиса",
    "Новосибирск",
    "Бердск",
  ],
  authors: [{ name: "Cleania" }],
  creator: "Cleania",
  icons: { icon: "/favicon.svg" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Cleania",
    title: "Cleania — клининг в Новосибирске и Бердске",
    description:
      "Честный расчёт цены, удобное время и контроль качества в одном заказе.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=85",
        width: 1600,
        height: 900,
        alt: "Профессиональная уборка Cleania",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cleania — клининг в Новосибирске и Бердске",
    description: "Рассчитайте и закажите уборку онлайн за несколько минут.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fcfcfa",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
