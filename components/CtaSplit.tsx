export default function CtaSplit() {
  return (
    <section className="cta-split">
      <div className="cta-split__panel cta-split__panel--filled">
        <h3>Etkinliğini planlıyorsan</h3>
        <p>Mekan ve hizmet sağlayıcıları keşfetmeye hemen başla.</p>
        <a href="/kayit" className="btn btn--on-dark">
          Ücretsiz hesap oluştur
        </a>
      </div>

      <div className="cta-split__panel">
        <h3>Bir işletmeysen</h3>
        <p>
          Mekanını veya hizmetini AşkaDavetli'de listelemek için bize
          ulaş.
        </p>
        <a href="mailto:askadavetliapp@gmail.com" className="btn btn--ghost">
          İşletmeni ekle
        </a>
      </div>
    </section>
  );
}
