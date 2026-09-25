import type { Metadata } from "next";
import { PublicFooter, PublicHeader } from "@/app/components/SiteChrome";

export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Запрошенная страница на сайте БлескПРО не найдена.",
  alternates: { canonical: null },
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main>
      <PublicHeader />
      <section className="not-found shell">
        <p className="eyebrow">Ошибка 404</p>
        <h1>Такой страницы нет.</h1>
        <p>Вернитесь на главную, чтобы рассчитать уборку или посмотреть услуги.</p>
        <div className="not-found-actions">
          <a className="button" href="/">На главную</a>
          <a className="text-link" href="/#calculator">Открыть калькулятор</a>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
