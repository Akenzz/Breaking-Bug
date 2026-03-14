"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { AnalysisData } from "@/lib/api";

interface Props {
    recipients: AnalysisData["top_recipients"];
}

const CATEGORY_COLORS: Record<string, string> = {
    Food: "#F97316",
    Transport: "#2072CE",
    Shopping: "#8B5CF6",
    Entertainment: "#EC4899",
    Health: "#2CA94F",
    Utilities: "#F59E0B",
    Education: "#06B6D4",
    Rent: "#EF4444",
};

function categoryColor(cat: string) {
    return CATEGORY_COLORS[cat] ?? "#8B5CF6";
}

function Initials({ name }: { name: string }) {
    const parts = name.trim().split(/\s+/);
    const text = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
    return (
        <div className="w-9 h-9 rounded-xl bg-sp-surface-2 border border-sp-border flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-sp-text-secondary">{text}</span>
        </div>
    );
}

export default function TopRecipients({ recipients }: Props) {
    const [expanded, setExpanded] = useState<number | null>(null);

    if (!recipients || recipients.length === 0) {
        return (
            <div className="bg-sp-surface border border-sp-border rounded-2xl p-6 flex items-center justify-center min-h-[180px]">
                <p className="text-sm text-sp-text-tertiary">No recipient data available</p>
            </div>
        );
    }

    return (
        <div className="bg-sp-surface border border-sp-border rounded-2xl p-6 flex flex-col gap-5
            transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-sp-border-hover">

            <div>
                <h3 className="text-sm font-semibold text-sp-text">Top Recipients</h3>
                <p className="text-xs text-sp-text-tertiary mt-0.5">Where your money goes most often</p>
            </div>

            <div className="flex flex-col gap-2">
                {(() => {
                    const maxAmount = Math.max(...recipients.map(r => r.total_amount), 1);
                    return recipients.map((r, i) => {
                    const isOpen = expanded === i;
                    const color = categoryColor(r.primary_category);
                    const barPct = (r.total_amount / maxAmount) * 100;
                    return (
                        <div key={i} className={`rounded-xl overflow-hidden border transition-all duration-200
                            ${isOpen ? "border-[#2072CE]/40 shadow-[0_0_0_1px_rgba(32,114,206,0.15)]" : "border-sp-border"}`}>
                            {/* Header row */}
                            <button
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sp-surface-2 transition-colors duration-150"
                                onClick={() => setExpanded(isOpen ? null : i)}
                            >
                                {/* Rank + Initials */}
                                <span className="text-[10px] font-bold text-sp-text-tertiary flex-shrink-0 w-4">{i + 1}</span>
                                <Initials name={r.recipient} />

                                {/* Name + category pill + spend bar */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-sp-text truncate">{r.recipient}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span
                                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                            style={{ color, background: `${color}18` }}
                                        >
                                            {r.primary_category}
                                        </span>
                                        {/* Relative spend bar */}
                                        <div className="flex-1 h-1 rounded-full bg-sp-border overflow-hidden max-w-[80px]">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${barPct}%`, background: color, opacity: 0.7, transition: "width 0.6s ease" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Amount + count */}
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold tabular-nums text-sp-text">
                                        ₹{r.total_amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-[10px] text-sp-text-tertiary">{r.transaction_count} txn{r.transaction_count !== 1 ? "s" : ""}</p>
                                </div>

                                <div className="w-5 flex-shrink-0 flex items-center justify-center">
                                    {isOpen
                                        ? <ChevronUp className="w-4 h-4 text-[#2072CE]" />
                                        : <ChevronDown className="w-4 h-4 text-sp-text-tertiary" />
                                    }
                                </div>
                            </button>

                            {/* Expanded details */}
                            {isOpen && (
                                <div className="px-4 pb-4 pt-1 bg-sp-surface-2 flex flex-col gap-3">
                                    {/* Reason */}
                                    {r.reason && (
                                        <p className="text-xs text-sp-text-secondary italic">{r.reason}</p>
                                    )}

                                    {/* Category breakdown */}
                                    {Object.keys(r.category_breakdown).length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-sp-text-tertiary mb-1.5">
                                                Category Breakdown
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {Object.entries(r.category_breakdown).map(([cat, amt]) => (
                                                    <span
                                                        key={cat}
                                                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                                        style={{ color: categoryColor(cat), background: `${categoryColor(cat)}18` }}
                                                    >
                                                        {cat}: ₹{(amt as number).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recent descriptions */}
                                    {r.descriptions.length > 0 && (
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-sp-text-tertiary mb-1.5">
                                                Recent Transactions
                                            </p>
                                            <ul className="flex flex-col gap-1">
                                                {r.descriptions.slice(0, 4).map((d, j) => (
                                                    <li key={j} className="text-xs text-sp-text-secondary flex items-center gap-1.5">
                                                        <span className="w-1 h-1 rounded-full bg-sp-text-tertiary flex-shrink-0" />
                                                        {d}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                });
                })()}
            </div>
        </div>
    );
}
