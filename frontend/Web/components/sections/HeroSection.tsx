"use client";

import { ShinyButton } from "@/components/ui/shiny-button";
import { SectionShell } from "@/components/ui/SectionShell";
import { FadeIn } from "@/components/ui/FadeIn";
import HeroText from "@/components/ui/hero-shutter-text";
import { SettlementCoreVisual } from "@/components/SettlementCoreVisual";
import Link from "next/link";
import dynamic from "next/dynamic";

const Threads = dynamic(() => import("@/components/ui/threads"), { ssr: false });

export function HeroSection() {
    return (
        <SectionShell className="pt-20 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40 pb-20 overflow-hidden relative">
            {/* Light Mode Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:hidden" />

            {/* Threads — both light and dark mode, full viewport height */}
            <div className="absolute inset-0 pointer-events-none" style={{ height: '100vh' }}>
                <Threads
                    color={[0.82, 1, 0]}
                    amplitude={1.2}
                    distance={0.4}
                    enableMouseInteraction
                />
                {/* Fade out at bottom so it doesn't bleed into next section */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-sp-bg to-transparent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
                {/* Left Copy */}
                <FadeIn>
                    <div className="flex flex-col gap-6 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
                        {/* Main Heading Group — Shutter Text Animation */}
                        <div className="relative flex flex-col gap-0">
                            <HeroText text="Intelligent" embedded textSize="text-4xl sm:text-5xl lg:text-[5rem]" delayOffset={0} />
                            <HeroText text="Expense" embedded textSize="text-4xl sm:text-5xl lg:text-[5rem]" delayOffset={0.4} />
                            <HeroText text="Settlement" embedded textSize="text-4xl sm:text-5xl lg:text-[5rem]" delayOffset={0.8} className="[&_span]:!text-[#2072CE]" />
                            <HeroText text="Powered by AI." embedded textSize="text-4xl sm:text-5xl lg:text-[5rem]" delayOffset={1.2} />
                            <div className="flex flex-col items-center lg:items-start gap-2 mt-4">
                                {/* Neon Highlight Block */}
                                <div className="inline-block bg-[#C6FF00] transform -skew-x-12 px-4 py-1 mt-2">
                                    <span className="text-black font-extrabold text-lg sm:text-2xl italic tracking-wide transform skew-x-12 inline-block">
                                        STRUCTURED SMART SECURE.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-400 max-w-lg mt-4 leading-relaxed font-medium dark:font-normal mx-auto lg:mx-0">
                            SmartPay transforms fragmented spending into structured assets using a high-fidelity AI core designed for precision settlement.
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 mt-6">
                            <Link href="/signup">
                                <ShinyButton>Get Started</ShinyButton>
                            </Link>
                        </div>

                    </div>
                </FadeIn>

                {/* Right — Settlement Core Visual */}
                <FadeIn delay={0.2} className="flex justify-center items-center relative h-[400px] lg:h-[600px] w-full">
                    {/* Background Grid for depth - Dark mode only */}
                    <div className="hidden dark:block absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />
                    <div className="scale-75 md:scale-90 lg:scale-100 origin-center">
                        <SettlementCoreVisual />
                    </div>
                </FadeIn>
            </div>
        </SectionShell>
    );
}
