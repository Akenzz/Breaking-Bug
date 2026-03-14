"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export function ProtectedNavbar() {
    const pathname = usePathname();
    const { theme, toggle } = useTheme();
    const isProfile = pathname === "/profile";

    return (
        <header className="sticky top-0 z-50 w-full bg-sp-bg/95 backdrop-blur-sm border-b border-sp-border">
            <nav className="w-full flex items-center justify-between h-14 px-4 sm:px-6">
                {/* Left — Logo */}
                <Link
                    href="/dashboard"
                    className="sp-link-interactive flex items-center gap-2.5 text-lg font-bold tracking-tight text-sp-text select-none"
                >
                    <img
                        src="/watermark.png"
                        alt="SmartPay"
                        className="w-7 h-7 object-contain"
                    />
                    <span className="hidden sm:inline">SmartPay</span>
                </Link>

                {/* Right — Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggle}
                        className="sp-interactive p-2 rounded-full text-sp-text-tertiary hover:text-sp-text transition-colors cursor-pointer"
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <Sun className="w-5 h-5" strokeWidth={1.5} />
                        ) : (
                            <Moon className="w-5 h-5" strokeWidth={1.5} />
                        )}
                    </button>

                    <Link
                        href="/profile"
                        className={`sp-interactive p-2 rounded-full transition-colors ${isProfile
                                ? "bg-sp-blue text-white"
                                : "text-sp-text-tertiary hover:text-sp-text"
                            }`}
                        aria-label="Profile"
                    >
                        <User className="w-5 h-5" strokeWidth={1.5} />
                    </Link>
                </div>
            </nav>
        </header>
    );
}
