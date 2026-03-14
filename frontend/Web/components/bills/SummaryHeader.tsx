"use client";

import {
    FileDown, Receipt, TrendingDown,
    UtensilsCrossed, Plane, ShoppingBag, Clapperboard,
    HeartPulse, GraduationCap, Lightbulb, Package,
} from "lucide-react";
import type { CategoryGroup } from "@/lib/bills";
import { formatCurrency, getCategoryStyle, calculateOverallTotal } from "@/lib/bills";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
    UtensilsCrossed, Plane, ShoppingBag, Clapperboard, HeartPulse, GraduationCap, Lightbulb, Package,
};

interface Props { groups: CategoryGroup[]; totalBills: number; parsedCount: number; failedCount: number; onDownloadPdf: () => void; }

export default function SummaryHeader({ groups, totalBills, parsedCount, failedCount, onDownloadPdf }: Props) {
    const overallTotal = calculateOverallTotal(groups);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                .sh-card {
                    font-family: 'DM Sans', sans-serif;
                    border-radius: 20px;
                    padding: 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                    animation: sh-in 0.4s ease both;
                    position: relative;
                    overflow: hidden;
                }
                @media (min-width: 640px)  { .sh-card { padding: 22px; } }
                @media (min-width: 1024px) { .sh-card { padding: 28px; } }

                :root:not(.dark) .sh-card {
                    background: #ffffff;
                    border: 1px solid #e9eef5;
                    box-shadow: 0 2px 12px rgba(15,23,42,0.06);
                }
                .dark .sh-card {
                    background: #111827;
                    border: 1px solid rgba(255,255,255,0.07);
                    box-shadow: 0 2px 16px rgba(0,0,0,0.35);
                }

                /* Subtle top-right decoration */
                .sh-card::before {
                    content: '';
                    position: absolute;
                    top: -40px; right: -40px;
                    width: 160px; height: 160px;
                    border-radius: 50%;
                    pointer-events: none;
                }
                :root:not(.dark) .sh-card::before { background: radial-gradient(circle, rgba(32,114,206,0.05) 0%, transparent 70%); }
                .dark .sh-card::before            { background: radial-gradient(circle, rgba(32,114,206,0.04) 0%, transparent 70%); }

                @keyframes sh-in {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Top row ── */
                .sh-top {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                @media (min-width: 640px) {
                    .sh-top { flex-direction: row; align-items: center; justify-content: space-between; }
                }

                .sh-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 1.15rem;
                    font-weight: 700;
                    letter-spacing: -0.025em;
                    margin: 0 0 3px;
                }
                @media (min-width: 640px) { .sh-title { font-size: 1.3rem; } }
                :root:not(.dark) .sh-title { color: #0f172a; }
                .dark .sh-title            { color: #f1f5f9; }

                .sh-meta {
                    font-size: 0.78rem;
                    margin: 0;
                }
                :root:not(.dark) .sh-meta { color: #94a3b8; }
                .dark .sh-meta            { color: #9CA3AF; }

                /* Download button */
                .sh-dl-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 10px 18px;
                    border: none;
                    border-radius: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.855rem;
                    font-weight: 600;
                    color: #fff;
                    cursor: pointer;
                    flex-shrink: 0;
                    align-self: flex-start;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
                    -webkit-tap-highlight-color: transparent;
                }
                @media (min-width: 640px) { .sh-dl-btn { align-self: auto; } }
                :root:not(.dark) .sh-dl-btn {
                    background: linear-gradient(135deg, #2072CE 0%, #1a5aaa 100%);
                    box-shadow: 0 3px 12px rgba(32,114,206,0.28);
                }
                .dark .sh-dl-btn {
                    background: linear-gradient(135deg, #2072CE 0%, #1550a0 100%);
                    box-shadow: 0 3px 14px rgba(32,114,206,0.18);
                }
                .sh-dl-btn::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.14) 50%, transparent 60%);
                    transform: translateX(-100%);
                }
                .sh-dl-btn:hover::before { transform: translateX(100%); transition: transform 0.5s ease; }
                .sh-dl-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(32,114,206,0.32); }
                .sh-dl-btn:active { transform: scale(0.96); }

                /* ── Total banner ── */
                .sh-total-banner {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px 16px;
                    border-radius: 14px;
                }
                :root:not(.dark) .sh-total-banner {
                    background: #f8fafc;
                    border: 1px solid #e9eef5;
                }
                .dark .sh-total-banner {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                }

                .sh-receipt-icon {
                    width: 46px;
                    height: 46px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                :root:not(.dark) .sh-receipt-icon { background: rgba(44,169,79,0.1); }
                .dark .sh-receipt-icon            { background: rgba(44,169,79,0.08); }

                .sh-total-label {
                    font-size: 0.68rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    margin: 0 0 2px;
                }
                :root:not(.dark) .sh-total-label { color: #94a3b8; }
                .dark .sh-total-label            { color: #9CA3AF; }

                .sh-total-amount {
                    font-family: 'Sora', sans-serif;
                    font-size: 1.7rem;
                    font-weight: 700;
                    letter-spacing: -0.03em;
                    margin: 0;
                    line-height: 1.1;
                }
                @media (min-width: 640px) { .sh-total-amount { font-size: 2rem; } }
                :root:not(.dark) .sh-total-amount { color: #0f172a; }
                .dark .sh-total-amount            { color: #f1f5f9; }

                /* ── Category breakdown ── */
                .sh-breakdown-label {
                    font-size: 0.67rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    margin: 0 0 8px;
                }
                :root:not(.dark) .sh-breakdown-label { color: #94a3b8; }
                .dark .sh-breakdown-label            { color: #9CA3AF; }

                /* Progress bar track */
                .sh-bar-track {
                    display: flex;
                    height: 10px;
                    border-radius: 99px;
                    overflow: hidden;
                    gap: 2px;
                }
                :root:not(.dark) .sh-bar-track { background: #f1f5f9; }
                .dark .sh-bar-track            { background: rgba(255,255,255,0.05); }

                .sh-bar-seg {
                    border-radius: 99px;
                    transition: opacity 0.15s ease;
                    animation: sh-barGrow 0.6s cubic-bezier(0.34,1.2,0.64,1) both;
                }
                .sh-bar-seg:hover { opacity: 0.8; }

                @keyframes sh-barGrow {
                    from { transform: scaleX(0); transform-origin: left; }
                    to   { transform: scaleX(1); transform-origin: left; }
                }

                /* Legend */
                .sh-legend {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px 14px;
                    margin-top: 10px;
                }

                .sh-legend-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 0.775rem;
                }

                .sh-legend-icon {
                    width: 20px;
                    height: 20px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .sh-legend-name {
                    font-weight: 500;
                }
                :root:not(.dark) .sh-legend-name { color: #64748b; }
                .dark .sh-legend-name            { color: #9CA3AF; }

                .sh-legend-val { font-weight: 600; }

                /* ── Stats row ── */
                .sh-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }

                .sh-stat {
                    padding: 12px 10px;
                    border-radius: 13px;
                    text-align: center;
                    animation: sh-in 0.4s ease both;
                }
                :root:not(.dark) .sh-stat {
                    background: #f8fafc;
                    border: 1px solid #e9eef5;
                }
                .dark .sh-stat {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                }

                .sh-stat-val {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    font-family: 'Sora', sans-serif;
                    font-size: 1.1rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin-bottom: 3px;
                }
                @media (min-width: 640px) { .sh-stat-val { font-size: 1.25rem; } }
                :root:not(.dark) .sh-stat-val { color: #0f172a; }
                .dark .sh-stat-val            { color: #f1f5f9; }

                .sh-stat-label {
                    font-size: 0.65rem;
                    font-weight: 600;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                }
                :root:not(.dark) .sh-stat-label { color: #94a3b8; }
                .dark .sh-stat-label            { color: #9CA3AF; }

                @media (max-width: 390px) {
                    .sh-total-amount { font-size: 1.45rem; }
                    .sh-stat-val     { font-size: 1rem; }
                    .sh-dl-btn       { padding: 9px 14px; font-size: 0.82rem; }
                }
            `}</style>

            <div className="sh-card">
                {/* Top row */}
                <div className="sh-top">
                    <div>
                        <h2 className="sh-title">Expense Report</h2>
                        <p className="sh-meta">
                            {parsedCount} of {totalBills} bills parsed
                            {failedCount > 0 && <span style={{ color: "#ef4444" }}> · {failedCount} failed</span>}
                        </p>
                    </div>
                    <button onClick={onDownloadPdf} className="sh-dl-btn">
                        <FileDown className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>

                {/* Total banner */}
                <div className="sh-total-banner">
                    <div className="sh-receipt-icon">
                        <Receipt className="w-5 h-5" style={{ color: "#2CA94F" }} strokeWidth={1.8} />
                    </div>
                    <div>
                        <p className="sh-total-label">Total Expenses</p>
                        <p className="sh-total-amount">{formatCurrency(overallTotal)}</p>
                    </div>
                </div>

                {/* Category breakdown */}
                {groups.length > 1 && (
                    <div>
                        <p className="sh-breakdown-label">Category Breakdown</p>
                        <div className="sh-bar-track">
                            {groups.map((g) => {
                                const pct = overallTotal > 0 ? (g.total / overallTotal) * 100 : 0;
                                const style = getCategoryStyle(g.category);
                                return (
                                    <div
                                        key={g.category}
                                        className={`sh-bar-seg ${style.bar}`}
                                        style={{ width: `${Math.max(pct, 3)}%` }}
                                        title={`${g.category}: ${formatCurrency(g.total)}`}
                                    />
                                );
                            })}
                        </div>
                        <div className="sh-legend">
                            {groups.map((g) => {
                                const style = getCategoryStyle(g.category);
                                const Icon = ICON_MAP[style.iconName] || Package;
                                return (
                                    <div key={g.category} className="sh-legend-item">
                                        <div className={`sh-legend-icon ${style.iconBg}`}>
                                            <Icon className="w-3 h-3" strokeWidth={2} />
                                        </div>
                                        <span className="sh-legend-name">{g.category}</span>
                                        <span className={`sh-legend-val ${style.text}`}>{formatCurrency(g.total)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="sh-stats">
                    {[
                        { value: groups.length, label: "Categories", icon: null },
                        { value: parsedCount, label: "Bills", icon: null },
                        {
                            value: groups.length > 0 ? formatCurrency(groups[groups.length - 1].total) : "₹0",
                            label: "Lowest Cat.",
                            icon: <TrendingDown className="w-3.5 h-3.5" style={{ color: "#2CA94F" }} />,
                        },
                    ].map(({ value, label, icon }) => (
                        <div key={label} className="sh-stat">
                            <div className="sh-stat-val">
                                {icon}
                                {value}
                            </div>
                            <p className="sh-stat-label">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}