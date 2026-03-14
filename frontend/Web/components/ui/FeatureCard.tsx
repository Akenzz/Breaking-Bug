"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    details?: string[];
}

export function FeatureCard({ icon: Icon, title, description, details }: FeatureCardProps) {
    const { theme } = useTheme();
    const divRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(0.6)}
            onMouseLeave={() => setOpacity(0)}
            className="
                group
                relative
                sp-card-interactive
                border border-sp-border
                bg-sp-bg
                p-7
                flex flex-col gap-4
                hover:border-sp-text
                overflow-hidden
                h-full
            "
            role="article"
        >
            {/* Spotlight — dark mode only */}
            {theme === "dark" && (
                <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                    style={{
                        opacity,
                        background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(208,255,0,0.12), transparent 70%)`,
                    }}
                />
            )}

            {/* Top row: icon + arrow */}
            <div className="flex items-start justify-between">
                <div className="w-11 h-11 flex items-center justify-center bg-sp-surface border border-sp-border group-hover:bg-sp-highlight group-hover:border-sp-highlight transition-all duration-300">
                    <Icon className="w-5 h-5 text-sp-text group-hover:text-sp-highlight-text transition-colors duration-300" strokeWidth={1.5} aria-hidden="true" />
                </div>
                <ArrowUpRight
                    className="w-4 h-4 text-sp-text-tertiary opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300"
                    strokeWidth={1.5}
                    aria-hidden="true"
                />
            </div>

            <h3 className="text-base font-semibold tracking-tight text-sp-text leading-snug">
                {title}
            </h3>

            <p className="text-sm leading-relaxed text-sp-text-secondary flex-1">
                {description}
            </p>

            {details && details.length > 0 && (
                <ul className="flex flex-col gap-1.5 pt-3 border-t border-sp-border/60">
                    {details.map((item, idx) => (
                        <li
                            key={idx}
                            className="text-xs text-sp-text-tertiary flex items-center gap-2 font-medium tracking-wide uppercase"
                        >
                            <span className="w-3.5 h-px bg-sp-text-tertiary shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            )}

            {/* Bottom accent line on hover */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sp-highlight scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
    );
}
