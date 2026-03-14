"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart2, User } from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Analysis", href: "/analysis", icon: BarChart2 },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sp-bg/95 backdrop-blur-md border-t border-sp-border pb-safe">
            <nav className="flex items-center justify-around px-2 h-16">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + "/");
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200
                                ${active ? "text-sp-blue" : "text-sp-text-tertiary hover:text-sp-text-secondary"}`}
                        >
                            <Icon
                                className={`w-5 h-5 transition-transform duration-200 ${active ? "scale-110" : ""}`}
                                strokeWidth={active ? 2.5 : 2}
                            />
                            <span className="text-[10px] font-medium tracking-wide">
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
