"use client";

import { Users, UsersRound, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { DashboardSummary } from "@/lib/api";

interface Props {
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

export default function SummaryStats({ summary }: Props) {
    if (!summary) return null;

    const stats = [
        {
            label: "Friends",
            value: summary.friendCount.toString(),
            icon: <Users className="w-4 h-4" />,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            label: "Groups",
            value: summary.groupCount.toString(),
            icon: <UsersRound className="w-4 h-4" />,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
        },
        {
            label: "Total Owed to You",
            value: formatCurrency(summary.totalIsOwed),
            icon: <ArrowDownRight className="w-4 h-4" />,
            color: "text-[#2CA94F]",
            bg: "bg-[#2CA94F]/10",
        },
        {
            label: "Total You Owe",
            value: formatCurrency(summary.totalOwes),
            icon: <ArrowUpRight className="w-4 h-4" />,
            color: "text-red-400",
            bg: "bg-red-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-sp-surface rounded-2xl border border-sp-border p-4 flex flex-col gap-2
                        transition-all duration-250 ease-in-out
                        hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-sp-border-hover
                        cursor-default"
                >
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                        {stat.icon}
                    </div>
                    <div>
                        <p className="text-sp-text-muted text-[10px] font-medium uppercase tracking-wider">{stat.label}</p>
                        <p className="text-sp-text text-sm font-bold tracking-tight mt-0.5">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
