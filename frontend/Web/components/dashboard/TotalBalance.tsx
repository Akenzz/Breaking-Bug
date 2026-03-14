"use client";

import { Eye, EyeOff, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";
import type { DashboardBalance, DashboardSummary } from "@/lib/api";

interface Props {
    balance: DashboardBalance | null;
    summary: DashboardSummary | null;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export default function TotalBalance({ balance, summary }: Props) {
    const [hidden, setHidden] = useState(false);

    const total = balance?.total ?? 0;
    const monthlySpent = balance?.monthlySpent ?? 0;

    const totalOwes = summary?.totalOwes ?? 0;
    const totalIsOwed = summary?.totalIsOwed ?? 0;

    const isPositive = total >= 0;

    return (
        <div className="bg-sp-surface rounded-2xl border border-sp-border p-5 flex flex-col gap-4
            transition-all duration-250 ease-in-out
            hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-sp-border-hover
            cursor-default">
            <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#2072CE]/10 flex items-center justify-center">
                    <span className="text-[#2072CE] text-base font-bold">&#8377;</span>
                </div>
                <button
                    onClick={() => setHidden((h) => !h)}
                    className="p-1.5 rounded-lg text-sp-text-muted hover:text-sp-text-secondary hover:bg-sp-surface-2
                        transition-all duration-200 !outline-none !border-none !ring-0 !shadow-none focus:!outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0"
                    style={{ border: "none", outline: "none", boxShadow: "none" }}
                    title={hidden ? "Show balance" : "Hide balance"}
                >
                    {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
            </div>

            <div>
                <p className="text-sp-text-tertiary text-[11px] font-medium uppercase tracking-wider mb-1">Net Balance</p>
                <p className={`text-2xl font-bold tracking-tight transition-all duration-300 ${isPositive ? "text-[#2CA94F]" : "text-red-400"}`}>
                    {hidden ? (
                        <span className="tracking-[0.35em] text-sp-border-hover select-none">--------</span>
                    ) : formatCurrency(total)}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/10">
                    <ArrowUpRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-sp-text-muted text-[10px]">You owe</p>
                        <p className="text-red-400 text-xs font-semibold truncate">
                            {hidden ? "---" : formatCurrency(totalOwes)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#2CA94F]/5 border border-[#2CA94F]/10">
                    <ArrowDownRight className="w-3.5 h-3.5 text-[#2CA94F] shrink-0" />
                    <div className="min-w-0">
                        <p className="text-sp-text-muted text-[10px]">Owed to you</p>
                        <p className="text-[#2CA94F] text-xs font-semibold truncate">
                            {hidden ? "---" : formatCurrency(totalIsOwed)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-sp-border">
                <div>
                    <p className="text-sp-text-muted text-[10px]">Monthly spent</p>
                    <p className="text-sp-text-secondary text-sm font-medium">
                        {hidden ? "---" : formatCurrency(monthlySpent)}
                    </p>
                </div>
                {balance?.monthlyLimit != null && (
                    <div className="text-right">
                        <p className="text-sp-text-muted text-[10px]">Budget limit</p>
                        <p className="text-sp-text-secondary text-sm font-medium">
                            {hidden ? "---" : formatCurrency(balance.monthlyLimit)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
