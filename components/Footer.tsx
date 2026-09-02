export default function Footer() {
  return (
    <footer className="site-footer" id="iletisim">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="brand">AşkaDavetli</span>
          <p>Organizasyonun için ilham ve hizmetler bir arada.</p>
        </div>

        <div className="site-footer__contact">
          <a href="mailto:askadavetliapp@gmail.com">askadavetliapp@gmail.com</a>
          <a href="https://instagram.com/askadavetli" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://tiktok.com/@askadavetliapp" target="_blank" rel="noreferrer">
            TikTok
          </a>
        </div>
      </div>

      <p className="site-footer__legal">
        © {new Date().getFullYear()} AşkaDavetli. Tüm hakları saklıdır.
      </p>
    </footer>
  );
}
