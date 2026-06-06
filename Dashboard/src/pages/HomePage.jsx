import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Demo from "../components/Demo";
import UseCases from "../components/UseCases";
import Pricing from "../components/Pricing";
import Trust from "../components/Trust";
import FAQ from "../components/FAQ";
import LeadForm from "../components/LeadForm";
import WhatsAppChatWidget from "../components/WhatsAppChatWidget";

function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") {
      return;
    }

    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = document.querySelector(location.hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Demo />
      <UseCases />
      <Pricing />
      <Trust />
      <FAQ />
      <LeadForm />
      <WhatsAppChatWidget />
    </>
  );
}

export default HomePage;
