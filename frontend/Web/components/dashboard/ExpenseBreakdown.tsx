"use client";

import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import type { DashboardBalance, DashboardExpenseBreakdown } from "@/lib/api";

interface Props {
    balance: DashboardBalance | null;
    expenseBreakdown: DashboardExpenseBreakdown | null;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export default function ExpenseBreakdown({ balance, expenseBreakdown }: Props) {
    const monthlySpent = expenseBreakdown?.thisMonth ?? balance?.monthlySpent ?? 0;
    const change = expenseBreakdown?.percentageChange ?? balance?.changePercent ?? 0;
    const monthlyLimit = balance?.monthlyLimit;

    const apiTrend = expenseBreakdown?.trend; // "UP" | "DOWN" | "FLAT"
    const trendUp = apiTrend ? apiTrend === "UP" : change > 0;
    const trendDown = apiTrend ? apiTrend === "DOWN" : change < 0;

    const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Minus;
    const trendColor = trendUp ? "text-red-400" : trendDown ? "text-[#2CA94F]" : "text-sp-text-muted";
    const trendBg = trendUp ? "bg-red-500/10" : trendDown ? "bg-[#2CA94F]/10" : "bg-sp-surface-2";

    return (
        <div className="bg-sp-surface rounded-2xl border border-sp-border p-5 flex flex-col gap-4
            transition-all duration-250 ease-in-out
            hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-sp-border-hover
            cursor-default">
            <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-sp-surface-2 border border-sp-border flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-sp-text-secondary" />
                </div>
                {(trendUp || trendDown) && (
                    <span className={`flex items-center gap-1 text-xs font-semibold ${trendColor} ${trendBg} px-2.5 py-1 rounded-full`}>
                        <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
                        {change !== 0 && <>{change > 0 ? "+" : ""}{change.toFixed(1)}%</>}
                    </span>
                )}
            </div>

            <div>
                <p className="text-sp-text-tertiary text-[11px] font-medium uppercase tracking-wider mb-1">Monthly Spending</p>
                <p className="text-sp-text text-2xl font-bold tracking-tight">{formatCurrency(monthlySpent)}</p>
            </div>

            {monthlyLimit != null && monthlyLimit > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sp-text-muted text-[10px]">Budget used</span>
                        <span className="text-sp-text-tertiary text-[10px]">
                            {Math.round((monthlySpent / monthlyLimit) * 100)}% of {formatCurrency(monthlyLimit)}
                        </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-sp-surface-2 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                monthlySpent / monthlyLimit > 0.9 ? "bg-red-400" : "bg-[#2072CE]"
                            }`}
                            style={{ width: `${Math.min((monthlySpent / monthlyLimit) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {(trendUp || trendDown) && (
                <div className="pt-1 border-t border-sp-border">
                    <p className={`text-xs font-medium ${trendColor}`}>
                        {trendUp ? "Spending increased" : "Spending decreased"} vs. last month
                    </p>
                </div>
            )}
        </div>
    );
}
