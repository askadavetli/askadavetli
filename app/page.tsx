import Header from "../components/Header";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import HowItWorks from "../components/HowItWorks";
import Vision from "../components/Vision";
import CtaSplit from "../components/CtaSplit";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Categories />
        <HowItWorks />
        <Vision />
        <CtaSplit />
      </main>
      <Footer />
    </>
  );
}
