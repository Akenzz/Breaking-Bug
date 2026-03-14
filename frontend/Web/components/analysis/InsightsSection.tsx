"use client";

import { Lightbulb, Sparkles } from "lucide-react";

interface Props {
    insights: string[];
}

export default function InsightsSection({ insights }: Props) {
    if (!insights || insights.length === 0) {
        return (
            <div className="bg-sp-surface border border-sp-border rounded-2xl p-6 flex items-center justify-center min-h-[100px]">
                <p className="text-sm text-sp-text-tertiary">No insights available</p>
            </div>
        );
    }

    return (
        <div className="bg-sp-surface border border-sp-border rounded-2xl p-6 flex flex-col gap-5
            transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-sp-border-hover">

            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                    <Lightbulb className="w-3.5 h-3.5 text-[#F59E0B]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-sp-text">AI Insights</h3>
                    <p className="text-xs text-sp-text-tertiary">Personalised observations from your data</p>
                </div>
                {/* Count badge */}
                <span className="ml-auto flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                    <Sparkles className="w-3 h-3" />
                    {insights.length}
                </span>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insights.map((insight, i) => (
                    <li
                        key={i}
                        className="group flex items-start gap-3 bg-sp-surface-2 border border-sp-border rounded-xl p-4
                            hover:bg-sp-surface hover:border-sp-border-hover transition-colors duration-150 cursor-default"
                    >
                        <span
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5
                                transition-transform duration-200 group-hover:scale-110"
                            style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}
                        >
                            {i + 1}
                        </span>
                        <p className="text-sm text-sp-text-secondary leading-relaxed">{insight}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
