const otherCategories = [
  {
    title: "Fotoğraf & Video",
    text: "Anılarını kalıcı kılacak profesyonelleri keşfet.",
  },
  {
    title: "Dekorasyon & Çiçek",
    text: "Mekanına özel süsleme ve çiçek düzenlemeleri.",
  },
  {
    title: "Kuaför & Makyaj",
    text: "Gününe özel saç ve makyaj hizmetleri.",
  },
  {
    title: "Davetiye & Hediyelik",
    text: "Davetlerini ve misafir hediyelerini tasarla.",
  },
];

export default function Categories() {
  return (
    <section className="categories" id="hizmetler">
      <div className="categories__intro">
        <h2>Aradığın her şey bir arada.</h2>
        <p>
          Düğün salonlarından kına organizasyonlarına, mekan seçiminden
          detaylara kadar; ihtiyacın olan hizmetleri keşfetmeye buradan başla.
        </p>
      </div>

      <div className="categories__grid">
        <article className="category-feature">
          <span className="category-feature__label">En çok aranan</span>
          <h3>Mekanlar</h3>
          <p>
            Şehrindeki düğün salonlarını, davet mekanlarını ve açık hava
            alanlarını kapasite, konum ve stiline göre karşılaştır.
          </p>
          <a href="/mekanlar" className="text-link">
            Mekanları keşfet
          </a>
        </article>

        <ul className="category-list">
          {otherCategories.map((item) => (
            <li key={item.title}>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
