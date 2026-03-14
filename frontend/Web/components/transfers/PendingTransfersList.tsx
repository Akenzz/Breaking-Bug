"use client";

import { useState } from "react";
import { confirmTransferAction, disputeTransferAction } from "@/lib/actions";
import { CheckCircle2, ShieldAlert, IndianRupee, User, FileText, Loader2 } from "lucide-react";

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function PendingTransfersList({ transfers, reload }: any) {
    const [loadingId, setLoadingId] = useState<{ id: number; action: "confirm" | "dispute" } | null>(null);

    async function handleConfirm(id: number) {
        setLoadingId({ id, action: "confirm" });
        const res = await confirmTransferAction(id);
        setLoadingId(null);
        alert(res.message);
        reload();
    }

    async function handleDispute(id: number) {
        setLoadingId({ id, action: "dispute" });
        const res = await disputeTransferAction(id);
        setLoadingId(null);
        alert(res.message);
        reload();
    }

    return (
        <div className="flex flex-col gap-3">
            {transfers.map((t: any, i: number) => {
                const isConfirming = loadingId?.id === t.transferId && loadingId?.action === "confirm";
                const isDisputing  = loadingId?.id === t.transferId && loadingId?.action === "dispute";
                const isBusy       = isConfirming || isDisputing;

                return (
                    <div
                        key={t.transferId ?? i}
                        className="rounded-[16px] border p-4 flex flex-col gap-4
                            bg-white border-slate-200 shadow-[0_1px_4px_rgba(15,23,42,0.05)]
                            dark:bg-[#111827] dark:border-white/[0.07]"
                    >
                        {/* Top row: avatar + name + amount */}
                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                {getInitials(t.fromUserName ?? "?")}
                            </div>

                            {/* Name + note */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate"
                                    style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.01em" }}
                                >
                                    {t.fromUserName}
                                </p>
                                {t.note && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                        {t.note}
                                    </p>
                                )}
                            </div>

                            {/* Amount */}
                            <span
                                className="text-base font-bold text-slate-900 dark:text-slate-100 shrink-0"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                ₹{t.amount}
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-100 dark:bg-white/[0.05]" />

                        {/* Action buttons */}
                        <div className="flex gap-2.5">
                            <button
                                onClick={() => handleConfirm(t.transferId)}
                                disabled={isBusy}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                                    text-sm font-semibold text-white transition-all duration-150
                                    disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
                                style={{
                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    boxShadow: "0 2px 8px rgba(16,185,129,0.25)"
                                }}
                            >
                                {isConfirming
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                                }
                                {isConfirming ? "Confirming…" : "Confirm"}
                            </button>

                            <button
                                onClick={() => handleDispute(t.transferId)}
                                disabled={isBusy}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                                    text-sm font-semibold transition-all duration-150
                                    border-[1.5px] bg-transparent active:scale-[0.97]
                                    border-red-200 text-red-500 hover:bg-red-50
                                    dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/[0.07]
                                    disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isDisputing
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <ShieldAlert className="w-4 h-4" strokeWidth={2} />
                                }
                                {isDisputing ? "Disputing…" : "Dispute"}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}