"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { DashboardPendingRequest } from "@/lib/api";

interface Props {
    requests: DashboardPendingRequest[];
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function PendingRequests({ requests }: Props) {
    const owesYou = requests.filter((r) => r.type === "OWES_YOU");
    const youOwe = requests.filter((r) => r.type === "YOU_OWE");

    return (
        <div className="bg-sp-surface rounded-2xl border border-sp-border p-5 flex flex-col gap-4
            transition-all duration-250 ease-in-out hover:-translate-y-0.5
            hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-sp-border-hover">
            <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sp-surface-2 border border-sp-border flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4 text-sp-text-secondary" />
                </div>
                <div>
                    <h3 className="text-sp-text text-sm font-semibold">Balances</h3>
                    <p className="text-sp-text-muted text-[10px]">{requests.length} pending</p>
                </div>
            </div>

            {requests.length === 0 ? (
                <p className="text-sp-text-muted text-xs text-center py-4">All settled up</p>
            ) : (
                <div className="space-y-1">
                    {/* Owes you */}
                    {owesYou.length > 0 && (
                        <>
                            <p className="text-sp-text-muted text-[10px] uppercase tracking-wider px-2 pt-1">Owed to you</p>
                            {owesYou.map((r) => (
                                <RequestRow key={r.id} request={r} />
                            ))}
                        </>
                    )}

                    {/* You owe */}
                    {youOwe.length > 0 && (
                        <>
                            <p className="text-sp-text-muted text-[10px] uppercase tracking-wider px-2 pt-2">You owe</p>
                            {youOwe.map((r) => (
                                <RequestRow key={r.id} request={r} />
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function RequestRow({ request }: { request: DashboardPendingRequest }) {
    const isOwesYou = request.type === "OWES_YOU";
    const accentColor = isOwesYou ? "text-[#2CA94F]" : "text-red-400";
    const avatarBg = isOwesYou ? "bg-[#2CA94F]/10 text-[#2CA94F]" : "bg-red-500/10 text-red-400";
    const Icon = isOwesYou ? ArrowDownRight : ArrowUpRight;

    return (
        <div className="group flex items-center gap-3 px-2 py-2.5 rounded-xl
            transition-all duration-200 ease-out
            hover:translate-x-[3px] hover:bg-sp-surface-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center
                text-[10px] font-bold shrink-0 ${avatarBg}`}>
                {getInitials(request.name)}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sp-text-secondary text-xs font-medium truncate transition-colors duration-200 group-hover:text-sp-text">
                    {request.name}
                </p>
                {request.description && (
                    <p className="text-sp-text-muted text-[10px] truncate">{request.description}</p>
                )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                <Icon className={`w-3 h-3 ${accentColor}`} />
                <p className={`text-xs font-semibold ${accentColor}`}>
                    {formatCurrency(request.amount)}
                </p>
            </div>
        </div>
    );
}
