"use client";

import Link from "next/link";
import {
    IndianRupee, Split, Users, Handshake, Receipt, UserPlus, ArrowLeftRight, Wallet,
} from "lucide-react";

const ACTIONS = [
    { label: "Pay",        icon: IndianRupee,    href: "/pay" },
    { label: "Split Bill", icon: Split,          href: "/split" },
    { label: "Groups",     icon: Users,          href: "/groups" },
    { label: "Settle Up",  icon: Handshake,      href: "/settle" },
    { label: "Bills",      icon: Receipt,        href: "/bills" },
    { label: "Friends",    icon: UserPlus,       href: "/friends" },
    { label: "History",    icon: ArrowLeftRight, href: "/transactions" },
    { label: "Payments",   icon: Wallet,         href: "/payments" },
];

export default function QuickActions() {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2CA94F] shadow-[0_0_6px_rgba(44,169,79,0.5)]" />
                <h2 className="text-[#2CA94F] text-xs font-bold tracking-widest uppercase">Quick Actions</h2>
            </div>

            {/* Mobile: original 4-col grid, untouched */}
            <div className="grid grid-cols-4 gap-3 sm:hidden">
                {ACTIONS.map(({ label, icon: Icon, href }) => (
                    <Link
                        key={label}
                        href={href}
                        className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl
                            bg-sp-surface border border-sp-border
                            transition-all duration-250 ease-in-out
                            hover:-translate-y-[3px]
                            hover:border-[#2072CE]/30
                            hover:shadow-[0_8px_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(32,114,206,0.06)]
                            hover:bg-sp-surface-2
                            active:translate-y-0 active:scale-[0.98] active:shadow-none"
                    >
                        <div className="w-10 h-10 rounded-xl bg-sp-surface-2 flex items-center justify-center
                            transition-all duration-200
                            group-hover:bg-[#2072CE]/10
                            group-hover:scale-[1.05]
                            group-hover:shadow-[0_0_12px_rgba(32,114,206,0.15)]">
                            <Icon className="w-5 h-5 text-sp-text transition-all duration-200 group-hover:text-[#2072CE]" strokeWidth={1.5} />
                        </div>
                        <span className="text-[11px] font-medium text-sp-text transition-colors duration-200 dark:group-hover:text-white text-center leading-tight">
                            {label}
                        </span>
                    </Link>
                ))}
            </div>

            {/* Desktop: all 8 in one row, larger buttons */}
            <div className="hidden sm:grid gap-3" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
                {ACTIONS.map(({ label, icon: Icon, href }) => (
                    <Link
                        key={label}
                        href={href}
                        className="group flex flex-col items-center gap-3 py-5 px-2 rounded-2xl
                            bg-sp-surface border border-sp-border
                            transition-all duration-250 ease-in-out
                            hover:-translate-y-[3px]
                            hover:border-[#2072CE]/30
                            hover:shadow-[0_8px_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(32,114,206,0.06)]
                            hover:bg-sp-surface-2
                            active:translate-y-0 active:scale-[0.98] active:shadow-none
                            min-w-0"
                    >
                        <div className="w-12 h-12 rounded-xl bg-sp-surface-2 flex items-center justify-center shrink-0
                            transition-all duration-200
                            group-hover:bg-[#2072CE]/10
                            group-hover:scale-[1.05]
                            group-hover:shadow-[0_0_12px_rgba(32,114,206,0.15)]">
                            <Icon className="w-6 h-6 text-sp-text transition-all duration-200 group-hover:text-[#2072CE]" strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-medium text-sp-text transition-colors duration-200
                            dark:group-hover:text-white text-center leading-tight w-full truncate">
                            {label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}