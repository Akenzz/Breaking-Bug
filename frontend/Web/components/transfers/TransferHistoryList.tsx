"use client";

import { ArrowRight, CheckCircle2, Clock, ShieldAlert, XCircle } from "lucide-react";

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

const STATUS_CONFIG: Record<string, {
    label: string;
    icon: React.ReactNode;
    pillClass: string;
    barClass: string;
}> = {
    COMPLETED: {
        label: "Completed",
        icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />,
        pillClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
        barClass: "bg-emerald-500",
    },
    PENDING: {
        label: "Pending",
        icon: <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />,
        pillClass: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
        barClass: "bg-orange-500",
    },
    DISPUTED: {
        label: "Disputed",
        icon: <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2.5} />,
        pillClass: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
        barClass: "bg-red-500",
    },
    CANCELLED: {
        label: "Cancelled",
        icon: <XCircle className="w-3.5 h-3.5" strokeWidth={2.5} />,
        pillClass: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10",
        barClass: "bg-slate-400 dark:bg-slate-600",
    },
};

export default function TransferHistoryList({ transfers }: any) {
    return (
        <div className="flex flex-col gap-3">
            {transfers.map((t: any, i: number) => {
                const cfg = STATUS_CONFIG[t.status] ?? {
                    label: t.status || "Unknown",
                    icon: null,
                    pillClass: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10",
                    barClass: "bg-slate-400 dark:bg-slate-600",
                };
                const isCancelled = t.status === "CANCELLED";

                return (
                    <div
                        key={t.transferId ?? i}
                        className={`relative rounded-xl overflow-hidden flex transition-all duration-200
                            border border-sp-border hover:border-sp-border-hover 
                            hover:-translate-y-0.5 hover:shadow-sm
                            bg-sp-surface ${isCancelled ? "opacity-60" : "opacity-100"}`}
                    >
                        {/* Left accent bar */}
                        <div className={`w-1.5 shrink-0 ${cfg.barClass}`} />

                        {/* Card body */}
                        <div className="flex-1 px-4 py-4 flex flex-col gap-3 min-w-0">

                            {/* Top row: avatars + names + amount */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">

                                    {/* Sender Avatar */}
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0
                                        text-xs font-semibold
                                        bg-[#2072CE]/10 text-[#2072CE] dark:bg-[#2072CE]/20 dark:text-[#60A5FA]
                                        ring-2 ring-sp-bg">
                                        {getInitials(t.fromUser?.fullName ?? "?")}
                                    </div>

                                    <ArrowRight className="w-3.5 h-3.5 text-sp-text-muted shrink-0 mx-0.5" strokeWidth={2.5} />

                                    {/* Receiver Avatar */}
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0
                                        text-xs font-semibold
                                        bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400
                                        ring-2 ring-sp-bg">
                                        {getInitials(t.toUser?.fullName ?? "?")}
                                    </div>

                                    {/* Names stacked */}
                                    <div className="min-w-0 ml-1.5 flex flex-col justify-center">
                                        <p className="text-[13px] font-medium text-sp-text truncate leading-tight">
                                            {t.fromUser?.fullName ?? "Unknown"}
                                        </p>
                                        <p className="text-[11px] text-sp-text-tertiary truncate mt-[2px]">
                                            to <span className="font-medium text-sp-text-secondary">{t.toUser?.fullName ?? "Unknown"}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <span className="text-[15px] font-semibold text-sp-text shrink-0 tabular-nums">
                                    ₹{t.amount}
                                </span>
                            </div>

                            {/* Bottom row: note + status pill */}
                            <div className="flex items-center justify-between gap-3 mt-1 pt-3 border-t border-sp-border/50">
                                {t.note ? (
                                    <p className="text-xs text-sp-text-secondary truncate flex-1">
                                        <span className="opacity-70 italic">"{t.note}"</span>
                                    </p>
                                ) : (
                                    <span className="flex-1" />
                                )}

                                <span
                                    className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${cfg.pillClass} shrink-0`}
                                >
                                    {cfg.icon}
                                    {cfg.label}
                                </span>
                            </div>

                        </div>
                    </div>
                );
            })}
        </div>
    );
}
