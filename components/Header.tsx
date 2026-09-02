export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href="/" className="brand">
          AşkaDavetli
        </a>

        <nav className="site-nav" aria-label="Ana menü">
          <a href="#hizmetler">Hizmetler</a>
          <a href="#nasil-calisir">Nasıl çalışır</a>
          <a href="#iletisim">İletişim</a>
        </nav>

        <a href="#basla" className="header-cta">
          Etkinliğini planla
        </a>
      </div>
    </header>
  );
}
