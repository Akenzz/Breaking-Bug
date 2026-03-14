"use client";

import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";

const NAV_LINKS = [
    { label: "Features", href: "#features", mobileHref: "#features-list" },
    { label: "Architecture", href: "#architecture", mobileHref: "#architecture" },
    { label: "Security", href: "#security", mobileHref: "#security" },
] as const;

export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, toggle } = useTheme();

    return (
        <header
            className="
        sticky top-0 z-50
        w-full
        bg-sp-bg/95 backdrop-blur-sm
        border-b border-sp-border
      "
            role="banner"
        >

            <nav className="w-full flex items-center h-16 px-6 md:px-10 lg:px-16">

                {/* Left - Logo */}
                <div className="flex-1">
                    <Link
                        href="/"
                        className="sp-link-interactive flex items-center gap-3 text-xl font-bold tracking-tight text-sp-text select-none"
                    >
                        <img
                            src="/watermark.png"
                            alt="SmartPay Logo"
                            className="w-8 h-8 object-contain"
                        />
                        SmartPay
                    </Link>
                </div>

                {/* Desktop links */}
                <ul className="hidden md:flex flex-1 items-center justify-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                className="sp-link-interactive text-sm font-medium text-sp-text-secondary hover:text-sp-text transition-colors duration-200"
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Desktop actions */}
                <div className="hidden md:flex flex-1 items-center justify-end gap-3">
                    <button
                        onClick={toggle}
                        className="
                            sp-interactive
                            relative w-10 h-10 
                            flex items-center justify-center 
                            rounded-full
                            border-2 border-sp-border 
                            bg-linear-to-br from-sp-bg to-sp-bg/80
                            hover:border-sp-highlight/60
                            text-sp-text-secondary hover:text-sp-text
                            cursor-pointer
                            group
                            overflow-hidden
                        "
                        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-sp-highlight/0 to-sp-highlight/0 group-hover:from-sp-highlight/5 group-hover:to-sp-highlight/10 rounded-full transition-all duration-300"></div>
                        <div className="relative transition-transform duration-300 ease-in-out group-hover:rotate-12">
                            {theme === "light" ? <Moon className="w-5 h-5" strokeWidth={2} /> : <Sun className="w-5 h-5" strokeWidth={2} />}
                        </div>
                    </button>
                    <Link href="/login">
                        <Button variant="ghost" size="sm" aria-label="Login">
                            Login
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button variant="secondary" size="sm" aria-label="Sign Up">
                            Sign Up
                        </Button>
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden sp-interactive flex items-center justify-center w-10 h-10 text-sp-text rounded-lg"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </nav>

            {/* Mobile full-width dropdown menu */}
            {mobileOpen && (
                <div className="md:hidden bg-[#0f0f0f] border-b border-white/10">

                    {/* Navigation links */}
                    <div className="px-5 pb-2">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.mobileHref}
                                className="sp-link-interactive block py-3 text-[15px] font-medium text-white/80 hover:text-white transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="px-5 pb-5 space-y-3">
                        {/* Theme toggle button */}
                        <button
                            onClick={toggle}
                            className="w-full sp-interactive flex items-center justify-center gap-2 py-3 border border-white/15 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/5"
                        >
                            {theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {theme === "light" ? "Light Mode" : "Dark Mode"}
                        </button>

                        {/* Sign Up button */}
                        <Link href="/signup" className="block" onClick={() => setMobileOpen(false)}>
                            <button className="w-full sp-interactive py-3 border border-white/15 rounded-md text-sm font-bold text-white hover:bg-white/5">
                                Sign Up
                            </button>
                        </Link>

                        {/* Login link */}
                        <Link
                            href="/login"
                            className="sp-link-interactive block text-center py-2 text-sm text-white/60 hover:text-white transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            Login
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
