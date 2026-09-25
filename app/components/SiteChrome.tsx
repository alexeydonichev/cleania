import Link from "next/link";
import MotionDesign from "./MotionDesign";
import MotionPreference from "./MotionPreference";
import BrandLogo from "./BrandLogo";
import ContactLinks from "./ContactLinks";
import { brandName, contactPhone, contactPhoneDisplay } from "@/lib/brand";

export function PublicHeader() {
  return <><header className="site-header">
    <Link className="brand" href="/" aria-label={`${brandName} — на главную`}><BrandLogo priority /></Link>
    <nav className="desktop-nav" aria-label="Основная навигация"><Link href="/#services">Услуги</Link><Link href="/#calculator">Стоимость</Link><Link href="/#quality">Как работаем</Link><Link href="/#work">До и после</Link><Link href="/articles">Статьи</Link><Link href="/#faq">Вопросы</Link></nav>
    <div className="header-actions"><a className="city-link contact-phone" href={`tel:${contactPhone}`}>{contactPhoneDisplay}</a><Link className="button button-small" href="/#calculator" aria-label="Заказать уборку">Заказать</Link></div>
    <details className="mobile-menu"><summary aria-label="Открыть меню"><span /><span /></summary><nav aria-label="Мобильная навигация"><Link href="/#services">Услуги</Link><Link href="/#calculator">Рассчитать стоимость</Link><Link href="/#included">Что входит в уборку</Link><Link href="/#quality">Как работаем</Link><Link href="/#work">До и после</Link><Link href="/articles">Гид по чистоте</Link><Link href="/#faq">Вопросы</Link><Link href="/business">Для бизнеса</Link><Link href="/contacts">Telegram, MAX и контакты</Link><a href={`tel:${contactPhone}`}>{contactPhoneDisplay}</a></nav></details>
  </header><MotionDesign /></>;
}
export function PublicFooter() {
  return <footer className="site-footer">
    <div className="shell footer-top">
      <div className="footer-brand-block"><Link className="brand brand-footer" href="/" aria-label={`${brandName} — на главную`}><BrandLogo /></Link><p className="footer-tagline">Работу — нам,<br /><span>а отдых — Вам.</span></p></div>
      <div className="footer-links"><b>Услуги</b><Link href="/services/regular-cleaning">Поддерживающая уборка</Link><Link href="/services/deep-cleaning">Генеральная уборка</Link><Link href="/services/after-renovation">После ремонта</Link><Link href="/services/window-cleaning">Мойка окон</Link></div>
      <div className="footer-links"><b>На связи</b><ContactLinks /><Link href="/contacts">Новосибирск и Бердск</Link><Link href="/articles">Гид по чистоте</Link><Link href="/business">Для бизнеса</Link><Link href="/crm">Вход для сотрудников</Link></div>
      <div className="footer-cta"><span>Освободите свой выходной</span><Link href="/#calculator">Рассчитать уборку</Link></div>
    </div>
    <div className="shell footer-bottom"><span>© {new Date().getFullYear()} {brandName}</span><Link href="/privacy">Политика конфиденциальности</Link><MotionPreference /><span>Новосибирск · Бердск</span></div>
  </footer>;
}
