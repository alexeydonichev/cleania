import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/site";
import { isPreviewDeployment } from "@/lib/deployment";
import { brandName } from "@/lib/brand";
import "./globals.css";
import "./cleania.css";
import "./motion.css";
import "./cleaning-spark.css";
import "./cases.css";
import "./brand.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `Клининг в Новосибирске и Бердске — расчёт уборки онлайн | ${brandName}`,
    template: `%s — ${brandName}`,
  },
  description:
    "Уборка квартир и домов в Новосибирске и Бердске. Поддерживающая, генеральная и после ремонта. Калькулятор с подробной сметой, выбор даты и заявка онлайн.",
  applicationName: brandName,
  keywords: [
    "клининг",
    "заказать уборку",
    "уборка квартиры",
    "уборка после ремонта",
    "уборка офиса",
    "Новосибирск",
    "Бердск",
  ],
  authors: [{ name: brandName }],
  creator: brandName,
  icons: {
    icon: [{ url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" }, { url: "/brand/favicon-64.png", sizes: "64x64", type: "image/png" }],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: brandName,
    title: `${brandName} — клининг в Новосибирске и Бердске`,
    description:
      "Честный расчёт цены, удобное время и контроль качества в одном заказе.",
    images: [
      {
        url: "/brand/social-preview.png",
        width: 1200,
        height: 630,
        alt: `${brandName} — работу нам, а отдых Вам`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brandName} — клининг в Новосибирске и Бердске`,
    description: "Рассчитайте и закажите уборку онлайн за несколько минут.",
    images: ["/brand/social-preview.png"],
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
      <body>{isPreviewDeployment && <div className="deployment-note"><span>Демонстрация {brandName}</span><p>Калькулятор работает · отправка формы ещё не подключена</p></div>}{children}</body>
    </html>
  );
}
