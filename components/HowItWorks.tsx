const steps = [
  {
    number: "1",
    title: "Davetiyeni oluştur",
    text: "İsimlerinizi, tarihi, saati, mekanı ekleyin ve bir şablon seçin.",
  },
  {
    number: "2",
    title: "Misafirlerinle paylaş",
    text: "Tek bir link gönderin, misafirler \"Katılıyorum\" ile dönüş yapsın.",
  },
  {
    number: "3",
    title: "Anılar birikmeye başlar",
    text: "Etkinlik sonrası fotoğraf, video ve mesajlarla anı sayfan oluşur.",
  },
];

export default function HowItWorks() {
  return (
    <section className="how" id="nasil-calisir">
      <h2>Nasıl çalışır</h2>

      <ol className="how__list">
        {steps.map((step) => (
          <li key={step.number}>
            <span className="how__number">{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
