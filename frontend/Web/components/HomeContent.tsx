import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { ScrollPhoneDemo } from "@/components/sections/ScrollPhoneDemo";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { ArchitectureSection } from "@/components/sections/ArchitectureSection";
import { WhySection } from "@/components/sections/WhySection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/Footer";

export function HomeContent() {
    return (
        <>
            <div className="opacity-100">
                <Navbar />
                <main>
                    <HeroSection />
                    <ScrollPhoneDemo />
                    <FeaturesSection />
                    <ArchitectureSection />
                    <WhySection />
                    <CTASection />
                </main>
                <Footer />
            </div>
        </>
    );
}
