import Link from "next/link";

export function PublicHeader() {
  return <header className="site-header">
    <Link className="brand" href="/" aria-label="Cleania — на главную"><span className="brand-mark" aria-hidden="true">c</span><span>cleania</span></Link>
    <nav className="desktop-nav" aria-label="Основная навигация"><Link href="/#services">Услуги</Link><Link href="/#calculator">Стоимость</Link><Link href="/#quality">Как работаем</Link><Link href="/#faq">Вопросы</Link></nav>
    <div className="header-actions"><Link className="city-link" href="/contacts">Новосибирск · Бердск</Link><Link className="button button-small" href="/#calculator" aria-label="Заказать уборку">Заказать <span aria-hidden="true">↗</span></Link></div>
    <details className="mobile-menu"><summary aria-label="Открыть меню"><span /><span /></summary><nav aria-label="Мобильная навигация"><Link href="/#services">Услуги</Link><Link href="/#calculator">Рассчитать стоимость</Link><Link href="/#included">Что входит в уборку</Link><Link href="/#quality">Как работаем</Link><Link href="/#faq">Вопросы</Link><Link href="/business">Для бизнеса</Link><Link href="/contacts">Контакты</Link></nav></details>
  </header>;
}
export function PublicFooter() {
  return <footer className="site-footer">
    <div className="shell footer-top">
      <div><Link className="brand brand-footer" href="/"><span className="brand-mark" aria-hidden="true">c</span><span>cleania</span></Link><p>Чистота дома.<br />Время для жизни.</p></div>
      <div className="footer-links"><b>Услуги</b><Link href="/services/regular-cleaning">Поддерживающая уборка</Link><Link href="/services/deep-cleaning">Генеральная уборка</Link><Link href="/services/after-renovation">После ремонта</Link><Link href="/services/window-cleaning">Мойка окон</Link></div>
      <div className="footer-links"><b>На связи</b><Link href="/contacts">Новосибирск и Бердск</Link><Link href="/business">Для бизнеса</Link><Link href="/#faq">Вопросы и ответы</Link><Link href="/crm">Вход для сотрудников</Link></div>
      <div className="footer-cta"><span>Освободите свой выходной</span><Link href="/#calculator">Рассчитать уборку <b aria-hidden="true">↗</b></Link></div>
    </div>
    <div className="shell footer-wordmark" aria-hidden="true">cleania<span>✳</span></div>
    <div className="shell footer-bottom"><span>© {new Date().getFullYear()} Cleania</span><Link href="/privacy">Политика конфиденциальности</Link><span>Новосибирск · Бердск</span></div>
  </footer>;
}
