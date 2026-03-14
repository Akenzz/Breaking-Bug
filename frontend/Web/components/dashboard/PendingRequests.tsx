"use client";

import { Hourglass } from "lucide-react";

export default function PendingRequests() {
    const requests = [
        { name: "Jane Doe", desc: "Dinner Split", amount: "₹900", due: true },
        { name: "Alex Smith", desc: "Spotify Subscription", amount: "+₹1,200", due: false },
    ];

    return (
        <div className="bg-sp-surface rounded-2xl border border-sp-border p-5 flex flex-col gap-4
            transition-all duration-250 ease-in-out hover:-translate-y-0.5
            hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-sp-border-hover">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-sp-surface-2 border border-sp-border flex items-center justify-center">
                        <Hourglass className="w-4 h-4 text-sp-text-secondary" />
                    </div>
                    <h3 className="text-sp-text text-sm font-semibold">Pending Requests</h3>
                </div>
                <button className="text-[#2072CE] text-xs hover:opacity-70 transition-opacity duration-200 underline underline-offset-2">
                    View All
                </button>
            </div>

            <div className="space-y-1">
                {requests.map((r) => (
                    <div
                        key={r.name}
                        className="group flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer
                            transition-all duration-200 ease-out
                            hover:translate-x-[3px] hover:bg-sp-surface-2"
                    >
                        <div className="w-8 h-8 rounded-full bg-[#2072CE] flex items-center justify-center
                            text-white text-xs font-bold shrink-0
                            transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_10px_rgba(32,114,206,0.3)]">
                            {r.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sp-text-secondary text-xs font-medium truncate transition-colors duration-200 group-hover:text-sp-text">
                                {r.name}
                            </p>
                            <p className="text-sp-text-muted text-[10px] truncate">{r.desc}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className={`text-xs font-semibold transition-all duration-200
                                ${r.due ? "text-red-400 group-hover:text-red-300" : "text-[#2CA94F] group-hover:opacity-80"}`}>
                                {r.amount}
                            </p>
                            <p className={`text-[10px] ${r.due ? "text-red-400/60" : "text-[#2CA94F]/60"}`}>
                                {r.due ? "Due today" : "Received"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
