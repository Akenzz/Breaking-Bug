"use client";

import { TrendingUp, TrendingDown, ArrowLeftRight, Activity, BarChart2, Hash } from "lucide-react";
import type { AnalysisData } from "@/lib/api";

interface Props {
    stats: AnalysisData["health_stats"];
}

function fmt(n: number) {
    return `₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function FinancialStats({ stats }: Props) {
    const tiles = [
        {
            label: "Total Spending",
            value: fmt(stats.total_spending),
            icon: TrendingDown,
            iconColor: "#EF4444",
            iconBg: "rgba(239,68,68,0.1)",
            accentColor: "#EF4444",
            sub: null,
        },
        {
            label: "Total Income",
            value: fmt(stats.total_income),
            icon: TrendingUp,
            iconColor: "#2CA94F",
            iconBg: "rgba(44,169,79,0.1)",
            accentColor: "#2CA94F",
            sub: null,
        },
        {
            label: "Net Cash Flow",
            value: fmt(stats.net_cash_flow),
            icon: ArrowLeftRight,
            iconColor: stats.net_cash_flow >= 0 ? "#2CA94F" : "#EF4444",
            iconBg: stats.net_cash_flow >= 0 ? "rgba(44,169,79,0.1)" : "rgba(239,68,68,0.1)",
            accentColor: stats.net_cash_flow >= 0 ? "#2CA94F" : "#EF4444",
            valueColor: stats.net_cash_flow >= 0 ? "#2CA94F" : "#EF4444",
            prefix: stats.net_cash_flow >= 0 ? "+" : "−",
            sub: null,
        },
        {
            label: "Avg Transaction",
            value: fmt(stats.average_transaction),
            icon: Activity,
            iconColor: "#2072CE",
            iconBg: "rgba(32,114,206,0.1)",
            accentColor: "#2072CE",
            sub: `σ ${fmt(stats.std_deviation)}`,
        },
        {
            label: "Transactions",
            value: stats.transaction_count.toString(),
            icon: Hash,
            iconColor: "#8B5CF6",
            iconBg: "rgba(139,92,246,0.1)",
            accentColor: "#8B5CF6",
            sub: null,
        },
        {
            label: "In / Out",
            value: `${stats.incoming_count} / ${stats.outgoing_count}`,
            icon: BarChart2,
            iconColor: "#F59E0B",
            iconBg: "rgba(245,158,11,0.1)",
            accentColor: "#F59E0B",
            sub: "incoming / outgoing",
        },
    ] as const;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {tiles.map(({ label, value, icon: Icon, iconColor, iconBg, accentColor, sub, ...rest }) => {
                const valueColor = (rest as any).valueColor;
                const prefix = (rest as any).prefix;
                return (
                    <div
                        key={label}
                        className="relative bg-sp-surface border border-sp-border rounded-2xl p-4 flex flex-col gap-3 overflow-hidden
                            transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-sp-border-hover"
                    >
                        {/* Colored top accent stripe */}
                        <div
                            className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                            style={{ background: accentColor, opacity: 0.75 }}
                        />
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: iconBg }}>
                            <Icon className="w-4 h-4" style={{ color: iconColor }} strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-sp-text-tertiary uppercase tracking-wider mb-0.5">{label}</p>
                            <p
                                className="text-base font-bold tabular-nums leading-tight text-sp-text"
                                style={valueColor ? { color: valueColor } : undefined}
                            >
                                {prefix}{value}
                            </p>
                            {sub && <p className="text-[10px] text-sp-text-tertiary mt-0.5">{sub}</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
