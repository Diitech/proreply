import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Demo from "./components/Demo";
import UseCases from "./components/UseCases";
import Pricing from "./components/Pricing";
import Trust from "./components/Trust";
import FAQ from "./components/FAQ";
import LeadForm from "./components/LeadForm";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Demo />
        <UseCases />
        <Pricing />
        <Trust />
        <FAQ />
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}

export default App;
