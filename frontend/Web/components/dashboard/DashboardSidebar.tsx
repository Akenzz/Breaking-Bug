"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import {
    LayoutDashboard, BarChart2, User, Sun, Moon,
} from "lucide-react";
import { OrbitalClock } from "@/components/ui/orbital-clock";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Analysis", href: "/analysis", icon: BarChart2 },
    { label: "Account", href: "/profile", icon: User },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const { theme, toggle } = useTheme();

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                /* ── Sidebar shell ── */
                .ds-aside {
                    display: none;
                    flex-direction: column;
                    width: 64px;
                    flex-shrink: 0;
                    min-height: 100vh;
                    position: sticky;
                    top: 0;
                    font-family: 'DM Sans', sans-serif;
                    transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    z-index: 40;
                }

                @media (min-width: 1024px) { .ds-aside { display: flex; } }

                .ds-aside:hover { width: 220px; }

                :root:not(.dark) .ds-aside {
                    background: #FFFFFF;
                    border-right: 1px solid #E0E3E8;
                    box-shadow: 2px 0 16px rgba(15,23,42,0.04);
                }

                .dark .ds-aside {
                    background: #0D1117;
                    border-right: 1px solid rgba(255,255,255,0.055);
                    box-shadow: 2px 0 20px rgba(0,0,0,0.15);
                }

                /* ── Logo ── */
                .ds-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 0 18px;
                    height: 64px;
                    text-decoration: none;
                    border-bottom: 1px solid;
                    flex-shrink: 0;
                    overflow: hidden;
                    transition: opacity 0.15s ease;
                }

                :root:not(.dark) .ds-logo { border-color: #E0E3E8; }
                .dark .ds-logo            { border-color: rgba(255,255,255,0.055); }
                .ds-logo:hover { opacity: 0.7; }

                .ds-logo img { flex-shrink: 0; width: 28px; height: 28px; object-fit: contain; }

                .ds-logo-text {
                    font-family: 'Sora', sans-serif;
                    font-size: 1.05rem;
                    font-weight: 700;
                    letter-spacing: -0.025em;
                    white-space: nowrap;
                    opacity: 0;
                    transform: translateX(-6px);
                    transition: opacity 0.22s ease 0.06s, transform 0.22s ease 0.06s;
                }

                :root:not(.dark) .ds-logo-text { color: #0F1419; }
                .dark .ds-logo-text            { color: #f1f5f9; }

                .ds-aside:hover .ds-logo-text {
                    opacity: 1;
                    transform: translateX(0);
                }

                /* ── Nav ── */
                .ds-nav {
                    flex: 1;
                    padding: 16px 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                /* ── Nav item ── */
                .ds-nav-item {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px;
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-decoration: none;
                    border: 1px solid transparent;
                    overflow: hidden;
                    white-space: nowrap;
                    transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                /* Active — light */
                :root:not(.dark) .ds-nav-item.active {
                    background: #EEF0F4;
                    color: #0F1419;
                    border-color: #E0E3E8;
                }

                /* Active — dark */
                .dark .ds-nav-item.active {
                    background: rgba(255,255,255,0.08);
                    color: #f1f5f9;
                    border-color: rgba(255,255,255,0.09);
                }

                /* Inactive — light */
                :root:not(.dark) .ds-nav-item:not(.active) { color: #6B7280; }
                :root:not(.dark) .ds-nav-item:not(.active):hover {
                    background: #F7F8FA;
                    color: #4B5563;
                    border-color: #E0E3E8;
                }

                /* Inactive — dark */
                .dark .ds-nav-item:not(.active) { color: #9CA3AF; }
                .dark .ds-nav-item:not(.active):hover {
                    background: rgba(255,255,255,0.045);
                    color: #F3F4F6;
                    border-color: rgba(255,255,255,0.06);
                }

                /* Active bar */
                .ds-nav-bar {
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 3px;
                    border-radius: 0 3px 3px 0;
                    transition: height 0.2s ease, opacity 0.2s ease;
                }

                .ds-nav-bar.on  { height: 18px; opacity: 1; }
                .ds-nav-bar.off { height: 0;    opacity: 0; }

                :root:not(.dark) .ds-nav-bar.on { background: #0F1419; }
                .dark .ds-nav-bar.on            { background: rgba(255,255,255,0.45); }

                /* Icon — always visible, fixed size */
                .ds-nav-icon {
                    flex-shrink: 0;
                    width: 16px;
                    height: 16px;
                    transition: transform 0.2s ease;
                }

                .ds-nav-item:hover .ds-nav-icon { transform: scale(1.1); }
                .ds-nav-item.active .ds-nav-icon { transform: scale(1.05); }

                /* Label — fades in when sidebar expands */
                .ds-nav-label {
                    opacity: 0;
                    transform: translateX(-4px);
                    transition: opacity 0.2s ease 0.07s, transform 0.2s ease 0.07s;
                    font-size: 0.875rem;
                }

                .ds-aside:hover .ds-nav-label {
                    opacity: 1;
                    transform: translateX(0);
                }

                /* ── Tooltip (visible when collapsed) ── */
                .ds-tooltip {
                    position: absolute;
                    left: 72px;
                    top: 50%;
                    transform: translateY(-50%);
                    padding: 5px 10px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    white-space: nowrap;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.15s ease;
                    z-index: 100;
                }

                :root:not(.dark) .ds-tooltip {
                    background: #1e293b;
                    color: #f1f5f9;
                    box-shadow: 0 4px 12px rgba(15,23,42,0.2);
                }

                .dark .ds-tooltip {
                    background: #f1f5f9;
                    color: #0f172a;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                }

                /* Show tooltip only when sidebar is NOT hovered */
                .ds-nav-item:hover .ds-tooltip { opacity: 1; }
                .ds-aside:hover .ds-nav-item .ds-tooltip { opacity: 0 !important; }

                /* ── Divider ── */
                .ds-divider {
                    margin: 4px 10px;
                    height: 1px;
                    border: none;
                }

                :root:not(.dark) .ds-divider { background: #E0E3E8; }
                .dark .ds-divider            { background: rgba(255,255,255,0.055); }

                /* ── Bottom section ── */
                .ds-bottom {
                    padding: 8px 10px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                /* ── Theme toggle ── */
                .ds-theme-btn {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px;
                    border-radius: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 500;
                    border: 1px solid transparent;
                    background: transparent;
                    cursor: pointer;
                    white-space: nowrap;
                    overflow: hidden;
                    transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .ds-theme-btn { color: #6B7280; }
                :root:not(.dark) .ds-theme-btn:hover {
                    background: #F7F8FA;
                    color: #4B5563;
                    border-color: #E0E3E8;
                }

                .dark .ds-theme-btn { color: #9CA3AF; }
                .dark .ds-theme-btn:hover {
                    background: rgba(255,255,255,0.045);
                    color: #F3F4F6;
                    border-color: rgba(255,255,255,0.06);
                }

                .ds-theme-icon {
                    flex-shrink: 0;
                    width: 16px;
                    height: 16px;
                    transition: transform 0.3s ease;
                }

                .ds-theme-btn:hover .ds-theme-icon { transform: rotate(15deg); }

                .ds-theme-label {
                    opacity: 0;
                    transform: translateX(-4px);
                    transition: opacity 0.2s ease 0.07s, transform 0.2s ease 0.07s;
                }

                .ds-aside:hover .ds-theme-label {
                    opacity: 1;
                    transform: translateX(0);
                }

                /* Theme tooltip */
                .ds-theme-btn .ds-tooltip { left: 72px; }
            `}</style>

            <aside className="ds-aside">
                {/* Logo */}
                <Link href="/" className="ds-logo">
                    <img src="/watermark.png" alt="SmartPay Logo" />
                    <span className="ds-logo-text">SmartPay</span>
                </Link>

                {/* Nav */}
                <nav className="ds-nav">
                    {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                        const active = pathname === href || pathname.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`ds-nav-item${active ? " active" : ""}`}
                            >
                                <span className={`ds-nav-bar ${active ? "on" : "off"}`} />
                                <Icon
                                    className="ds-nav-icon"
                                    strokeWidth={active ? 2.2 : 1.6}
                                />
                                <span className="ds-nav-label">{label}</span>
                                <span className="ds-tooltip">{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <hr className="ds-divider" />

                {/* Bottom */}
                <div className="ds-bottom">
                    <button
                        onClick={toggle}
                        className="ds-theme-btn"
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {theme === "dark"
                            ? <Sun className="ds-theme-icon" />
                            : <Moon className="ds-theme-icon" />
                        }
                        <span className="ds-theme-label">
                            {theme === "dark" ? "Light Mode" : "Dark Mode"}
                        </span>
                        <span className="ds-tooltip">
                            {theme === "dark" ? "Light Mode" : "Dark Mode"}
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}