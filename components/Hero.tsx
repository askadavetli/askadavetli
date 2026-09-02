export default function Hero() {
  return (
    <section className="hero" id="basla">
      <div className="hero__text">
        <h1>
          Hayalindeki daveti
          <br />
          birlikte tasarlayalım.
        </h1>
        <p>
          Söz, nişan, kına, düğün ve özel davetlerin için doğru mekanı,
          fotoğrafçıyı ve hizmet sağlayıcıyı tek yerden bul, karşılaştır,
          teklif al.
        </p>
        <div className="hero__actions">
          <a href="#hizmetler" className="btn btn--primary">
            Etkinliğini planla
          </a>
          <a href="#nasil-calisir" className="btn btn--ghost">
            Nasıl çalışır
          </a>
        </div>
      </div>

      <div className="hero__motif" aria-hidden="true">
        <svg viewBox="0 0 360 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M40 400V180C40 96 106 28 190 28C274 28 340 96 340 180V400"
            stroke="var(--brass)"
            strokeWidth="2"
          />
          <path
            d="M80 400V190C80 118 128 64 190 64C252 64 300 118 300 190V400"
            stroke="var(--line)"
            strokeWidth="1.5"
          />
          <line x1="10" y1="400" x2="350" y2="400" stroke="var(--ink)" strokeWidth="1.5" />
        </svg>
      </div>
    </section>
  );
}
