"use client";

import { ShinyButton } from "@/components/ui/shiny-button";
import { SectionShell } from "@/components/ui/SectionShell";
import { FadeIn } from "@/components/ui/FadeIn";
import { InlineTextReveal } from "@/components/ui/inline-text-reveal";
import RotatingText from "@/components/ui/rotating-text";
import Link from "next/link";

export function CTASection() {
    return (
        <SectionShell className="py-16 md:py-24 bg-sp-surface">
            <FadeIn>
                <div className="flex flex-col items-center text-center gap-8 max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-sp-text leading-tight">
                        <InlineTextReveal>Start Managing Group Finances </InlineTextReveal>
                        <span className="inline-flex items-center bg-sp-highlight text-sp-highlight-text px-3 overflow-hidden rounded-md" style={{ minWidth: '16rem' }}>
                            <RotatingText
                                texts={[
                                    "Intelligently",
                                    "Efficiently",
                                    "Precisely",
                                    "Accurately",
                                    "Seamlessly",
                                    "Smartly",
                                    "Strategically",
                                ]}
                                rotationInterval={2400}
                                splitBy="characters"
                                staggerDuration={0.025}
                                staggerFrom="first"
                                transition={{ type: "spring", damping: 28, stiffness: 350 }}
                                mainClassName="font-bold tracking-tight"
                            />
                        </span>
                    </h2>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/login">
                            <ShinyButton aria-label="Get Started">Get Started</ShinyButton>
                        </Link>
                    </div>

                    <p className="text-sm text-sp-text-tertiary">
                        Secure authentication · Real payments · Immutable logs
                    </p>
                </div>
            </FadeIn>
        </SectionShell>
    );
}
