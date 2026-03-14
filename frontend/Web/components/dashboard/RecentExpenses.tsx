"use client";

import { Receipt } from "lucide-react";
import type { DashboardRecentActivity } from "@/lib/api";

interface Props {
    activities: DashboardRecentActivity[];
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function RecentActivity({ activities }: Props) {
    return (
        <div className="bg-sp-surface rounded-2xl border border-sp-border p-5 flex flex-col gap-4
            transition-all duration-250 ease-in-out hover:-translate-y-0.5
            hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-sp-border-hover">
            <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sp-surface-2 border border-sp-border flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-sp-text-secondary" />
                </div>
                <div>
                    <h3 className="text-sp-text text-sm font-semibold">Recent Activity</h3>
                    <p className="text-sp-text-muted text-[10px]">{activities.length} latest entries</p>
                </div>
            </div>

            {activities.length === 0 ? (
                <p className="text-sp-text-muted text-xs text-center py-4">No recent activity</p>
            ) : (
                <div className="space-y-1">
                    {activities.map((a) => (
                        <div
                            key={a.id}
                            className="group flex items-center gap-3 px-2 py-2.5 rounded-xl
                                transition-all duration-200 ease-out
                                hover:translate-x-[3px] hover:bg-sp-surface-2"
                        >
                            <div className="w-8 h-8 rounded-full bg-[#2072CE]/10 flex items-center justify-center
                                text-[#2072CE] text-[10px] font-bold shrink-0
                                transition-all duration-200 group-hover:scale-105">
                                {a.description.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sp-text-secondary text-xs font-medium truncate transition-colors duration-200 group-hover:text-sp-text">
                                    {a.description}
                                </p>
                                <p className="text-sp-text-muted text-[10px] truncate">
                                    {a.fromUserName} to {a.toUserName}
                                </p>
                            </div>

                            <div className="text-right shrink-0">
                                <p className="text-sp-text text-xs font-semibold">{formatCurrency(a.amount)}</p>
                                <p className="text-sp-text-muted text-[10px]">{formatDate(a.createdAt)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
