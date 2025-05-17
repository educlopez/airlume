import AboutSection from "@/components/landing/AboutSection";
import CTASection from "@/components/landing/CTASection";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";
import HeroSection from "@/components/landing/HeroSection";
import NavBar from "@/components/landing/NavBar";
import ProcessSection from "@/components/landing/ProcessSection";
import ServicesSection from "@/components/landing/ServicesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";





export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="fixed inset-x-0 top-0 isolate z-3 h-[50px]">
        <div className="body-mask-b-0 absolute inset-0 backdrop-blur-[1px]"></div>
        <div className="body-mask-b-0 absolute inset-0 backdrop-blur-[2px]"></div>
        <div className="body-mask-b-0 absolute inset-0 backdrop-blur-[3px]"></div>
        <div className="body-mask-b-0 absolute inset-0 backdrop-blur-[6px]"></div>
        <div className="body-mask-b-0 absolute inset-0 backdrop-blur-[12px]"></div>
      </div>
      <div className="fixed inset-x-0 bottom-0 isolate z-3 h-[100px]">
        <div className="body-mask-t-0 absolute inset-0 backdrop-blur-[1px]"></div>
        <div className="body-mask-t-0 absolute inset-0 backdrop-blur-[2px]"></div>
        <div className="body-mask-t-0 absolute inset-0 backdrop-blur-[3px]"></div>
        <div className="body-mask-t-0 absolute inset-0 backdrop-blur-[6px]"></div>
        <div className="body-mask-t-0 absolute inset-0 backdrop-blur-[12px]"></div>
      </div>
      <NavBar />
      <HeroSection />
      <ServicesSection />
      <ProcessSection />
      <AboutSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  )
}