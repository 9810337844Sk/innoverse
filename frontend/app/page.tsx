import Hero from "@/components/landing/Hero";
import EventsStrip from "@/components/landing/EventsStrip";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <EventsStrip />
      <HowItWorks />
      <Features />
      <Pricing />
      <Testimonials />
      <Footer />
    </main>
  );
}
