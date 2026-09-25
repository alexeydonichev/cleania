import MotionDesign from "./MotionDesign";
import MotionPreference from "./MotionPreference";
import BrandLogo from "./BrandLogo";
import ContactLinks from "./ContactLinks";
import { brandName, contactPhone, contactPhoneDisplay } from "@/lib/brand";

export function PublicHeader() {
  return <><header className="site-header">
    <a className="brand" href="/" aria-label={`${brandName} — на главную`}><BrandLogo priority /></a>
    <nav className="desktop-nav" aria-label="Основная навигация"><a href="/#services">Услуги</a><a href="/#calculator">Стоимость</a><a href="/#quality">Как работаем</a><a href="/#work">До и после</a><a href="/articles">Статьи</a><a href="/#faq">Вопросы</a></nav>
    <div className="header-actions"><a className="city-link contact-phone" href={`tel:${contactPhone}`}>{contactPhoneDisplay}</a><a className="button button-small" href="/#calculator" aria-label="Заказать уборку">Заказать</a></div>
    <details className="mobile-menu"><summary aria-label="Открыть меню"><span /><span /></summary><nav aria-label="Мобильная навигация"><a href="/#services">Услуги</a><a className="mobile-menu-primary" href="/#calculator">Рассчитать стоимость</a><a href="/#included">Что входит в уборку</a><a href="/#quality">Как работаем</a><a href="/#work">До и после</a><div className="mobile-menu-utility" aria-label="Дополнительно"><a href="/articles">Гид по чистоте</a><a href="/#faq">Вопросы</a><a href="/business">Для бизнеса</a><a href="/contacts">Telegram, MAX и контакты</a></div><a href={`tel:${contactPhone}`}>{contactPhoneDisplay}</a></nav></details>
  </header><MotionDesign /></>;
}
export function PublicFooter() {
  return <footer className="site-footer">
    <div className="shell footer-top">
      <div className="footer-brand-block"><a className="brand brand-footer" href="/" aria-label={`${brandName} — на главную`}><BrandLogo /></a><p className="footer-tagline">Работу — нам,<br /><span>а отдых — Вам.</span></p></div>
      <div className="footer-links"><b>Услуги</b><a href="/services/regular-cleaning">Поддерживающая уборка</a><a href="/services/deep-cleaning">Генеральная уборка</a><a href="/services/after-renovation">После ремонта</a><a href="/services/window-cleaning">Мойка окон</a></div>
      <div className="footer-links"><b>На связи</b><ContactLinks /><a href="/contacts">Новосибирск и Бердск</a><a href="/articles">Гид по чистоте</a><a href="/business">Для бизнеса</a><a href="/crm">Вход для сотрудников</a></div>
      <div className="footer-cta"><span>Освободите свой выходной</span><a href="/#calculator">Рассчитать уборку</a></div>
    </div>
    <div className="shell footer-bottom"><span>© {new Date().getFullYear()} {brandName}</span><a href="/privacy">Политика конфиденциальности</a><MotionPreference /><span>Новосибирск · Бердск</span></div>
  </footer>;
}
