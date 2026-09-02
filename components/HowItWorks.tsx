const steps = [
  {
    number: "1",
    title: "Etkinliğini tanımla",
    text: "Organizasyon türünü, tarihini ve şehrini belirt.",
  },
  {
    number: "2",
    title: "Hizmetleri karşılaştır",
    text: "Mekan, fotoğrafçı ve diğer hizmet sağlayıcıları incele.",
  },
  {
    number: "3",
    title: "Teklif al, planla",
    text: "Beğendiklerinle iletişime geç, teklif iste, planına ekle.",
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
