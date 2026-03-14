"use client";

import { useState } from "react";

interface Props {
    categoryTotals: Record<string, number>;
}

const PALETTE = [
    "#2072CE", "#2CA94F", "#8B5CF6", "#F59E0B",
    "#EF4444", "#06B6D4", "#F97316", "#EC4899",
];

export default function CategoryChart({ categoryTotals }: Props) {
    const [hovered, setHovered] = useState<string | null>(null);

    const entries = Object.entries(categoryTotals)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a);

    const total = entries.reduce((sum, [, v]) => sum + v, 0);

    if (entries.length === 0) {
        return (
            <div className="bg-sp-surface border border-sp-border rounded-2xl p-6 flex items-center justify-center min-h-[220px]">
                <p className="text-sm text-sp-text-tertiary">No category data available</p>
            </div>
        );
    }

    /* Build SVG donut slices — with small gap between them */
    const R = 56;
    const CX = 80;
    const CY = 80;
    const CIRC = 2 * Math.PI * R;
    const GAP_DEG = 2.5; // degrees of gap between each slice
    const GAP_ARC = (GAP_DEG / 360) * CIRC;

    let cumulative = 0;
    const slices = entries.map(([cat, amount], i) => {
        const pct = amount / total;
        const rawLen = pct * CIRC;
        const len = Math.max(0, rawLen - GAP_ARC);
        const offset = CIRC - cumulative * CIRC;
        cumulative += pct;
        return { cat, amount, pct, len, offset, color: PALETTE[i % PALETTE.length] };
    });

    const maxAmount = entries[0]?.[1] ?? 1;

    return (
        <div className="bg-sp-surface border border-sp-border rounded-2xl p-6 flex flex-col gap-5
            transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-sp-border-hover">

            <div>
                <h3 className="text-sm font-semibold text-sp-text">Spending by Category</h3>
                <p className="text-xs text-sp-text-tertiary mt-0.5">Distribution of your expenses</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Donut */}
                <div className="relative flex-shrink-0">
                    <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90"
                        style={{ filter: hovered ? `drop-shadow(0 0 10px ${slices.find(s => s.cat === hovered)?.color ?? "transparent"}66)` : undefined }}>
                        {/* Track */}
                        <circle cx={CX} cy={CY} r={R} fill="none" stroke="currentColor"
                            strokeWidth="18" className="text-sp-border" />
                        {slices.map(({ cat, len, offset, color }) => (
                            <circle
                                key={cat}
                                cx={CX}
                                cy={CY}
                                r={R}
                                fill="none"
                                stroke={color}
                                strokeWidth={hovered === cat ? 22 : 18}
                                strokeDasharray={`${len} ${CIRC}`}
                                strokeDashoffset={offset}
                                strokeLinecap="butt"
                                opacity={hovered && hovered !== cat ? 0.4 : 1}
                                onMouseEnter={() => setHovered(cat)}
                                onMouseLeave={() => setHovered(null)}
                                style={{ transition: "stroke-width 0.2s ease, opacity 0.2s ease", cursor: "pointer" }}
                            />
                        ))}
                    </svg>
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        {hovered ? (
                            <>
                                <span className="text-[10px] font-bold text-sp-text text-center leading-tight px-3 truncate max-w-[100px]">{hovered}</span>
                                <span className="text-base font-bold tabular-nums" style={{ color: slices.find(s => s.cat === hovered)?.color }}>
                                    {((slices.find(s => s.cat === hovered)?.pct ?? 0) * 100).toFixed(1)}%
                                </span>
                                <span className="text-[10px] text-sp-text-tertiary">
                                    ₹{(categoryTotals[hovered] ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-base font-bold text-sp-text">
                                    ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </span>
                                <span className="text-[10px] text-sp-text-tertiary">{entries.length} categories</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-1.5 w-full min-w-0">
                    {slices.map(({ cat, amount, pct, color }) => (
                        <div
                            key={cat}
                            className={`flex flex-col gap-1 rounded-lg px-2 py-1.5 transition-colors duration-150 cursor-default
                                ${hovered === cat ? "bg-sp-surface-2" : "hover:bg-sp-surface-2/50"}`}
                            onMouseEnter={() => setHovered(cat)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                                <span className="text-xs text-sp-text truncate flex-1">{cat}</span>
                                <span className="text-xs font-semibold tabular-nums text-sp-text-secondary ml-auto">
                                    {(pct * 100).toFixed(1)}%
                                </span>
                                <span className="text-[10px] text-sp-text-tertiary tabular-nums w-20 text-right">
                                    ₹{amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            {/* Mini bar */}
                            <div className="h-1 rounded-full bg-sp-border overflow-hidden ml-4">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${(amount / maxAmount) * 100}%`,
                                        background: color,
                                        opacity: 0.75,
                                        transition: "width 0.6s ease"
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
