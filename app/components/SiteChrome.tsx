import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Cleania — на главную">
        <span className="brand-mark" aria-hidden="true">
          C
        </span>
        <span>Cleania</span>
      </Link>
      <nav className="desktop-nav" aria-label="Основная навигация">
        <Link href="/#services">Услуги</Link>
        <Link href="/#quality">Как работаем</Link>
        <Link href="/business">Для бизнеса</Link>
        <Link href="/contacts">Контакты</Link>
      </nav>
      <div className="header-actions">
        <Link className="city-link" href="/contacts">
          Новосибирск
        </Link>
        <Link className="button button-small" href="/#calculator">
          Рассчитать
        </Link>
      </div>
      <details className="mobile-menu">
        <summary aria-label="Открыть меню">☰</summary>
        <nav>
          <Link href="/#services">Услуги</Link>
          <Link href="/#quality">Как работаем</Link>
          <Link href="/business">Для бизнеса</Link>
          <Link href="/contacts">Контакты</Link>
        </nav>
      </details>
    </header>
  );
}

export function PublicFooter() {
  return (
    <>
      <footer className="site-footer">
        <div className="shell footer-top">
          <div>
            <Link className="brand brand-footer" href="/">
              <span className="brand-mark">C</span>
              <span>Cleania</span>
            </Link>
            <p>
              Профессиональная уборка
              <br />с человеческим сервисом.
            </p>
          </div>
          <div className="footer-links">
            <b>Услуги</b>
            <Link href="/services/regular-cleaning">Поддерживающая</Link>
            <Link href="/services/deep-cleaning">Генеральная</Link>
            <Link href="/services/after-renovation">После ремонта</Link>
            <Link href="/business">Для бизнеса</Link>
          </div>
          <div className="footer-links">
            <b>Компания</b>
            <Link href="/#quality">Как работаем</Link>
            <Link href="/contacts">Контакты</Link>
            <Link href="/crm">Вход в CRM</Link>
          </div>
          <div className="footer-cta">
            <span>Готовы начать?</span>
            <Link href="/#calculator">
              Рассчитать уборку <b>↗</b>
            </Link>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 Cleania</span>
          <Link href="/privacy">Политика конфиденциальности</Link>
          <span>Новосибирск</span>
        </div>
      </footer>
      <div className="mobile-order-bar">
        <div>
          <small>Уборка от</small>
          <b>2 490 ₽</b>
        </div>
        <Link className="button button-small" href="/#calculator">
          Рассчитать
        </Link>
      </div>
    </>
  );
}
