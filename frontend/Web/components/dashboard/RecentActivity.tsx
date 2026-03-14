"use client";

import { Zap } from "lucide-react";

export default function RecentActivity() {
    const activities = [
        { label: "Spotify Subscription", time: "Today, 11:30 AM", color: "bg-[#2CA94F]", dot: "shadow-[#2CA94F]/50" },
        { label: "Starbucks Coffee", time: "Yesterday, 1:15 PM", color: "bg-sp-text-secondary", dot: "" },
        { label: "Salary Deposit", time: "Feb 17, 9:00 AM", color: "bg-[#2CA94F]/60", dot: "shadow-[#2CA94F]/30" },
    ];

    return (
        <div className="bg-sp-surface rounded-2xl border border-sp-border p-5 flex flex-col gap-4
            transition-all duration-250 ease-in-out hover:-translate-y-0.5
            hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-sp-border-hover">
            <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sp-surface-2 border border-sp-border flex items-center justify-center">
                    <Zap className="w-4 h-4 text-sp-text-secondary" />
                </div>
                <h3 className="text-sp-text text-sm font-semibold">Recent Activity</h3>
            </div>

            <div className="space-y-1">
                {activities.map((a) => (
                    <div
                        key={a.label}
                        className="group flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer
                            transition-all duration-200 ease-out
                            hover:translate-x-[3px] hover:bg-sp-surface-2"
                    >
                        <div className={`w-2 h-2 rounded-full ${a.color} shrink-0 transition-all duration-200
                            ${a.dot ? `group-hover:shadow-[0_0_6px_2px] ${a.dot}` : ""}`}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sp-text-secondary text-xs font-medium truncate transition-colors duration-200 group-hover:text-sp-text">
                                {a.label}
                            </p>
                            <p className="text-sp-text-muted text-[10px] transition-colors duration-200 group-hover:text-sp-text-tertiary">
                                {a.time}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
