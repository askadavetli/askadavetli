export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <div className="badge">ASKADAVETLİ</div>
        <h1>Hayalindeki daveti<br />birlikte tasarlayalım.</h1>
        <p>
          Askadavetli için ilk temelimizi oluşturduk. Şimdi gerçek sayfalarımızı,
          hizmetlerimizi ve Supabase veritabanımızı adım adım ekleyeceğiz.
        </p>
        <div className="actions">
          <button>Başlayalım</button>
          <a href="#about">Nasıl çalışıyor?</a>
        </div>
      </section>
      <section id="about" className="cards">
        <article><span>01</span><h2>İçerik</h2><p>Markamızın sayfalarını ve kullanıcı deneyimini oluşturacağız.</p></article>
        <article><span>02</span><h2>Supabase</h2><p>Kullanıcı ve içerik verilerimizi güvenli şekilde yöneteceğiz.</p></article>
        <article><span>03</span><h2>Vercel</h2><p>GitHub'a gönderdiğimiz değişiklikleri canlı projeye taşıyacağız.</p></article>
      </section>
    </main>
  );
}