import {
  Hero,
  Problem,
  Solution,
  Workshop,
  Instructor,
  Results,
  Testimonials,
  Pricing,
  FAQ,
  FinalCTA,
  Footer,
  FloatingWhatsApp,
} from "@/components";

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <Solution />
      <Workshop />
      <Instructor />
      <Results />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}