import { Hero } from '../components/landing/Hero';
import { SocialProof } from '../components/landing/SocialProof';
import { FeatureSection } from '../components/landing/FeatureSection';
import { Testimonials } from '../components/landing/Testimonials';
import { CTASection } from '../components/landing/CTASection';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export default function LandingPage() {
  return (
    <>
      <Header sticky />
      <main>
        <Hero />
        <SocialProof />
        <FeatureSection />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
