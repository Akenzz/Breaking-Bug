"use client";

import { Activity, Zap, PieChart, ShieldAlert } from "lucide-react";
import type { AnalysisData } from "@/lib/api";

interface Props {
    breakdown: AnalysisData["health_breakdown"];
}

const BARS = [
    {
        key: "consistency" as const,
        label: "Consistency",
        description: "How regularly you transact",
        color: "#2072CE",
        Icon: Activity,
    },
    {
        key: "spike_control" as const,
        label: "Spike Control",
        description: "Avoidance of sudden large spends",
        color: "#2CA94F",
        Icon: Zap,
    },
    {
        key: "category_diversity" as const,
        label: "Category Diversity",
        description: "Spread across spending categories",
        color: "#8B5CF6",
        Icon: PieChart,
    },
    {
        key: "anomaly_penalty" as const,
        label: "Anomaly Penalty",
        description: "Deduction for anomalous transactions",
        color: "#F59E0B",
        Icon: ShieldAlert,
    },
];

export default function HealthBreakdown({ breakdown }: Props) {
    return (
        <div className="bg-sp-surface border border-sp-border rounded-2xl p-6 flex flex-col gap-5
            transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-sp-border-hover">

            <div>
                <h3 className="text-sm font-semibold text-sp-text">Score Breakdown</h3>
                <p className="text-xs text-sp-text-tertiary mt-0.5">What drives your financial health score</p>
            </div>

            <div className="flex flex-col gap-4">
                {BARS.map(({ key, label, description, color, Icon }) => {
                    const { score, max } = breakdown[key];
                    const pct = max > 0 ? (score / max) * 100 : 0;
                    return (
                        <div key={key} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                                        style={{ background: `${color}18` }}
                                    >
                                        <Icon className="w-3 h-3" style={{ color }} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-xs font-semibold text-sp-text">{label}</span>
                                    <span className="hidden sm:inline text-[10px] text-sp-text-tertiary">{description}</span>
                                </div>
                                <span className="text-xs font-bold tabular-nums" style={{ color }}>
                                    {score}
                                    <span className="text-sp-text-tertiary font-normal">/{max}</span>
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-sp-border overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: `${pct}%`,
                                        background: `linear-gradient(90deg, ${color}aa, ${color})`,
                                        boxShadow: `0 0 8px ${color}55`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
