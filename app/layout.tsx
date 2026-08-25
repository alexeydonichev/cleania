import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cleania — уборка без звонков и ожидания",
    template: "%s — Cleania",
  },
  description:
    "Рассчитайте стоимость уборки, выберите время и оформите заказ онлайн. Квартиры, дома, офисы, окна и уборка после ремонта.",
  applicationName: "Cleania",
  keywords: [
    "клининг",
    "заказать уборку",
    "уборка квартиры",
    "уборка после ремонта",
    "уборка офиса",
    "Новосибирск",
  ],
  authors: [{ name: "Cleania" }],
  creator: "Cleania",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Cleania",
    title: "Cleania — уборка без звонков и ожидания",
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
    title: "Cleania — уборка без звонков и ожидания",
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
  themeColor: "#f4f1e8",
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
