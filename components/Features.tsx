const otherFeatures = [
  {
    title: "Fotoğraf & video paylaşımı",
    text: "Etkinlikte çekilen kareleri yükle, misafirlerin de göndermesine izin ver.",
  },
  {
    title: "Dijital anı defteri",
    text: "Misafirlerin bıraktığı mesajlar davetiyenin bir parçası olarak kalır.",
  },
  {
    title: "Müzikli içerikler",
    text: "Davetiyene ve anı sayfana özel şarkı ekle.",
  },
  {
    title: "Katılım bildirimi",
    text: "Misafirler tek dokunuşla \"Katılıyorum\" diyerek dönüş yapar.",
  },
];

export default function Features() {
  return (
    <section className="categories" id="olustur">
      <div className="categories__intro">
        <h2>Davetiyen, etkinlikten sonra da yaşamaya devam eder.</h2>
        <p>
          İsimlerini, tarihini, saatini ve mekanını ekleyerek davetiyeni
          dakikalar içinde oluştur. Gerisini davet günü ve sonrasında
          birlikte tamamlayın.
        </p>
      </div>

      <div className="categories__grid">
        <article className="category-feature">
          <span className="category-feature__label">Ana özellik</span>
          <h3>Dijital davetiye</h3>
          <p>
            İsimler, tarih, saat, mekan ve harita ile şablonlardan birini
            seçerek kendi davetiyeni tasarla, tek link ile paylaş.
          </p>
          <a href="/olustur" className="text-link">
            Davetiyeni oluştur
          </a>
        </article>

        <ul className="category-list">
          {otherFeatures.map((item) => (
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
