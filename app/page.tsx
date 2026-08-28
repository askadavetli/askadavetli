export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fff8f5 0%, #f7eee9 50%, #eee3dc 100%)",
        color: "#2d2420",
        fontFamily: "Arial, sans-serif",
        padding: "60px 24px",
      }}
    >
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "8px 18px",
            borderRadius: "30px",
            background: "#ffffffaa",
            border: "1px solid #d8c5bb",
            letterSpacing: "3px",
            fontSize: "13px",
            marginBottom: "25px",
          }}
        >
          ASKADAVETLİ
        </div>

        <h1
          style={{
            fontSize: "clamp(42px, 7vw, 82px)",
            lineHeight: 1.05,
            fontWeight: 500,
            margin: "0 0 25px",
          }}
        >
          Hayalindeki daveti
          <br />
          birlikte tasarlayalım.
        </h1>

        <p
          style={{
            maxWidth: "700px",
            margin: "0 auto 35px",
            fontSize: "19px",
            lineHeight: 1.7,
            color: "#6d5d55",
          }}
        >
          Söz, nişan, kına, düğün ve özel davetlerin için
          <br />
          ilham veren fikirleri ve profesyonel hizmetleri bir araya getiriyoruz.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <a
            href="#baslayalim"
            style={{
              display: "inline-block",
              padding: "15px 30px",
              borderRadius: "30px",
              background: "#2d2420",
              color: "white",
              textDecoration: "none",
              fontSize: "16px",
            }}
          >
            Başlayalım
          </a>

          <a
            href="#hizmetler"
            style={{
              display: "inline-block",
              padding: "15px 30px",
              borderRadius: "30px",
              border: "1px solid #9e887d",
              color: "#2d2420",
              textDecoration: "none",
              fontSize: "16px",
            }}
          >
            Hizmetlerimizi keşfet
          </a>
        </div>
      </section>

      <section
        id="hizmetler"
        style={{
          maxWidth: "1100px",
          margin: "100px auto 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {[
          {
            no: "01",
            title: "Söz & Nişan",
            text: "En özel başlangıçlar için ilham veren fikirler.",
          },
          {
            no: "02",
            title: "Kına & Düğün",
            text: "Hayalindeki geceyi gerçeğe dönüştürmek için.",
          },
          {
            no: "03",
            title: "Özel Davetler",
            text: "Her davete özel yaratıcı çözümler ve fikirler.",
          },
        ].map((item) => (
          <article
            key={item.no}
            style={{
              background: "#ffffffaa",
              border: "1px solid #dfd0c8",
              borderRadius: "24px",
              padding: "30px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                letterSpacing: "2px",
                color: "#9b8073",
              }}
            >
              {item.no}
            </span>

            <h2
              style={{
                fontSize: "25px",
                fontWeight: 500,
                margin: "18px 0 12px",
              }}
            >
              {item.title}
            </h2>

            <p
              style={{
                color: "#6d5d55",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {item.text}
            </p>
          </article>
        ))}
      </section>

      <section
        id="baslayalim"
        style={{
          maxWidth: "900px",
          margin: "100px auto 0",
          textAlign: "center",
          padding: "50px 20px",
        }}
      >
        <h2
          style={{
            fontSize: "38px",
            fontWeight: 500,
            marginBottom: "15px",
          }}
        >
          Çok daha fazlası geliyor.
        </h2>

        <p
          style={{
            color: "#6d5d55",
            fontSize: "17px",
            lineHeight: 1.7,
          }}
        >
          Askadavetli'yi adım adım gerçek bir platforma dönüştürüyoruz.
        </p>
      </section>
    </main>
  );
}
