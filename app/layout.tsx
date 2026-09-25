import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/site";
import { isPreviewDeployment } from "@/lib/deployment";
import "./globals.css";
import "./cleania.css";
import "./motion.css";
import "./cleaning-spark.css";
import "./cases.css";

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
        url: "/images/cleania-home-retouched.webp",
        width: 1672,
        height: 941,
        alt: "Cleania — больше времени для жизни",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cleania — клининг в Новосибирске и Бердске",
    description: "Рассчитайте и закажите уборку онлайн за несколько минут.",
  },
  robots: {
    index: !isPreviewDeployment,
    follow: !isPreviewDeployment,
    googleBot: {
      index: !isPreviewDeployment,
      follow: !isPreviewDeployment,
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
    <html lang="ru" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('cleania-reduced-motion')==='true')document.documentElement.dataset.motion='reduced'}catch(e){}" }} /></head>
      <body>{isPreviewDeployment && <div className="deployment-note"><span>Демонстрация Cleania</span><p>Калькулятор работает · приём заявок ещё не подключён</p></div>}{children}</body>
    </html>
  );
}
