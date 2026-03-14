"use client";

import { ArrowRight } from "lucide-react";
import { SectionShell } from "@/components/ui/SectionShell";
import { FadeIn } from "@/components/ui/FadeIn";
import { InlineTextReveal } from "@/components/ui/inline-text-reveal";
import { useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const PILLARS = [
    {
        label: "Before",
        title: "Expense Tracking",
        points: [
            "Manual data entry",
            "Static split rules",
            "No settlement verification",
            "Isolated from payment rails",
        ],
    },
    {
        label: "After",
        title: "Financial Behavior Optimization",
        points: [
            "AI-optimized splitting and forecasting",
            "Minimized transaction count",
            "Immutable settlement verification",
            "Integrated real payment layer",
        ],
    },
];

export function WhySection() {
    return (
        <SectionShell id="security" className="py-16 md:py-24">
            <FadeIn>
                <div className="flex flex-col gap-3 mb-12 max-w-2xl">
                    <p className="text-sm font-medium tracking-widest uppercase text-sp-text-tertiary">
                        Why SmartPay
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-sp-text leading-tight">
                        <InlineTextReveal>From tracking expenses </InlineTextReveal>
                        <InlineTextReveal className="text-sp-text-secondary" startDelay={0.5}>to optimizing financial behavior.</InlineTextReveal>
                    </h2>
                </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {PILLARS.map((pillar, idx) => (
                    <FadeIn key={pillar.label} delay={idx * 0.08}>
                        <SpotlightPillarCard pillar={pillar} />
                    </FadeIn>
                ))}
            </div>

            <FadeIn delay={0.2}>
                <div className="mt-12 border-t border-sp-border pt-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                        { metric: "AI Optimization", desc: "Smart splitting & forecasting" },
                        { metric: "Fewer Transfers", desc: "Net transaction minimization" },
                        { metric: "Immutable Logs", desc: "Tamper-resistant verification" },
                        { metric: "Real Settlements", desc: "Integrated payment execution" },
                    ].map((item) => (
                        <div key={item.metric} className="flex flex-col gap-2">
                            <span className="text-base font-semibold tracking-tight text-sp-text">
                                {item.metric}
                            </span>
                            <span className="text-sm text-sp-text-tertiary">{item.desc}</span>
                        </div>
                    ))}
                </div>
            </FadeIn>
        </SectionShell>
    );
}

function SpotlightPillarCard({ pillar }: { pillar: (typeof PILLARS)[number] }) {
    const { theme } = useTheme();
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    return (
        <div
            ref={ref}
            onMouseMove={(e) => {
                if (!ref.current) return;
                const r = ref.current.getBoundingClientRect();
                setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
            }}
            onMouseEnter={() => setOpacity(0.6)}
            onMouseLeave={() => setOpacity(0)}
            className="relative border border-sp-border p-8 md:p-10 flex flex-col gap-6 h-full overflow-hidden"
        >
            {/* Spotlight — dark mode only */}
            {theme === "dark" && (
                <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                    style={{
                        opacity,
                        background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(208,255,0,0.10), transparent 70%)`,
                    }}
                />
            )}

            <span className="text-xs font-medium tracking-widest uppercase text-sp-text-tertiary">
                {pillar.label}
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-sp-text">
                {pillar.title}
            </h3>
            <ul className="flex flex-col gap-3">
                {pillar.points.map((point) => (
                    <li
                        key={point}
                        className="flex items-start gap-3 text-sm text-sp-text-secondary leading-relaxed"
                    >
                        <ArrowRight
                            className="w-4 h-4 mt-0.5 shrink-0 text-sp-text-tertiary"
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />
                        {point}
                    </li>
                ))}
            </ul>
        </div>
    );
}
