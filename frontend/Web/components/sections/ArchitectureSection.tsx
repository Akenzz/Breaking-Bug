"use client";

import { Cpu, GitMerge, ShieldAlert, BarChart3 } from "lucide-react";
import { SectionShell } from "@/components/ui/SectionShell";
import { FadeIn } from "@/components/ui/FadeIn";
import { InlineTextReveal } from "@/components/ui/inline-text-reveal";
import { useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const OPTIMIZATIONS = [
    {
        icon: Cpu,
        title: "Adaptive Smart Splitting",
        description:
            "Dynamically adjusts split ratios based on contribution history, current balances, and participant preferences producing fairer outcomes without manual configuration.",
    },
    {
        icon: GitMerge,
        title: "Net Transaction Optimization",
        description:
            "Reduces the total number of settlements by consolidating circular debts and redundant transfers into a minimal transaction set.",
    },
    {
        icon: ShieldAlert,
        title: "Payment Risk Prediction",
        description:
            "Evaluates recipient risk scores before execution using behavioral signals, community reports, and network-level fraud analysis.",
    },
    {
        icon: BarChart3,
        title: "Financial Fairness Score",
        description:
            "Generates per-group fairness metrics by analyzing contribution patterns, ensuring transparency and preventing long-term imbalance.",
    },
] as const;

export function ArchitectureSection() {
    return (
        <SectionShell id="architecture" className="py-16 md:py-24 bg-sp-surface">
            <FadeIn>
                <div className="flex flex-col gap-3 mb-12 max-w-2xl">
                    <p className="text-sm font-medium tracking-widest uppercase text-sp-text-tertiary">
                        AI Optimization
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-sp-text leading-tight">
                        <InlineTextReveal>Intelligence at the settlement layer.</InlineTextReveal>
                    </h2>
                    <p className="text-base text-sp-text-secondary leading-relaxed">
                        SmartPay applies optimization algorithms across every financial
                        interaction reducing friction, minimizing transfers, and surfacing
                        risk before it materializes.
                    </p>
                </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-sp-border border border-sp-border">
                {OPTIMIZATIONS.map((item, idx) => (
                    <FadeIn key={item.title} delay={idx * 0.06}>
                        <SpotlightArchCard item={item} idx={idx} />
                    </FadeIn>
                ))}
            </div>
        </SectionShell>
    );
}

function SpotlightArchCard({
    item,
    idx,
}: {
    item: (typeof OPTIMIZATIONS)[number];
    idx: number;
}) {
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
            className="group relative sp-card-interactive bg-sp-bg p-8 md:p-10 flex flex-col gap-5 h-full overflow-hidden transition-colors duration-300 hover:bg-sp-surface"
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

            {/* Number index */}
            <span className="absolute top-4 right-5 text-[10px] font-mono font-medium tracking-widest text-sp-text-tertiary/40 group-hover:text-sp-text-tertiary transition-colors duration-300">
                0{idx + 1}
            </span>

            <div className="flex items-center gap-4">
                <div className="w-11 h-11 flex items-center justify-center bg-sp-surface border border-sp-border group-hover:bg-sp-highlight group-hover:border-sp-highlight transition-all duration-300">
                    <item.icon
                        className="w-5 h-5 text-sp-text group-hover:text-sp-highlight-text transition-colors duration-300"
                        strokeWidth={1.5}
                        aria-hidden="true"
                    />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-sp-text">
                    {item.title}
                </h3>
            </div>

            <p className="text-sm leading-relaxed text-sp-text-secondary">
                {item.description}
            </p>

            {/* Bottom accent line on hover */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sp-highlight scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
    );
}
