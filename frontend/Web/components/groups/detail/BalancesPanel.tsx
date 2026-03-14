"use client";

import { TrendingUp, TrendingDown, Minus, Loader2, Wallet } from "lucide-react";
import type { UserBalance } from "@/lib/api";

interface Props {
    balances: UserBalance[];
    currentUserId: number | null;
    loading?: boolean;
}

export default function BalancesPanel({ balances, currentUserId, loading = false }: Props) {
    const sorted = [...balances].sort((a, b) => (b.netBalance ?? 0) - (a.netBalance ?? 0));

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                .bp-wrap {
                    font-family: 'DM Sans', sans-serif;
                    border-radius: 16px;
                    overflow: hidden;
                    animation: bp-fadeIn 0.3s ease both;
                }

                @keyframes bp-fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                :root:not(.dark) .bp-wrap {
                    border: 1px solid #e2e8f0;
                    background: #fff;
                    box-shadow: 0 1px 4px rgba(15,23,42,0.04);
                }

                .dark .bp-wrap {
                    border: 1px solid rgba(255,255,255,0.07);
                    background: #111827;
                }

                /* ── Panel header ── */
                .bp-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid;
                }

                :root:not(.dark) .bp-header { border-color: #f1f5f9; }
                .dark .bp-header            { border-color: rgba(255,255,255,0.05); }

                .bp-header-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bp-header-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    margin: 0;
                }

                :root:not(.dark) .bp-header-title { color: #0f172a; }
                .dark .bp-header-title            { color: #f1f5f9; }

                .bp-count {
                    font-family: monospace;
                    font-size: 0.72rem;
                    padding: 2px 7px;
                    border-radius: 6px;
                    font-weight: 700;
                }

                :root:not(.dark) .bp-count { background: #f1f5f9; color: #94a3b8; }
                .dark .bp-count            { background: rgba(255,255,255,0.05); color: #475569; }

                /* ── Loader / empty ── */
                .bp-loader {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 0;
                }

                .bp-spin { animation: bp-rotate 0.8s linear infinite; }
                @keyframes bp-rotate { to { transform: rotate(360deg); } }

                .bp-empty {
                    text-align: center;
                    padding: 40px 24px;
                    font-size: 0.82rem;
                }

                :root:not(.dark) .bp-empty { color: #94a3b8; }
                .dark .bp-empty            { color: #475569; }

                /* ── Balance row ── */
                .bp-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 13px 20px;
                    border-bottom: 1px solid;
                    transition: background 0.13s ease;
                }

                :root:not(.dark) .bp-row { border-color: #f8fafc; }
                .dark .bp-row            { border-color: rgba(255,255,255,0.03); }
                .bp-row:last-child { border-bottom: none; }

                :root:not(.dark) .bp-row:hover { background: #fafafa; }
                .dark .bp-row:hover            { background: rgba(255,255,255,0.02); }

                .bp-row-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 0;
                }

                /* Dot indicator */
                .bp-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .bp-dot.positive { background: #10b981; }
                .bp-dot.negative { background: #ef4444; }
                .bp-dot.neutral  {
                    background: transparent;
                    border: 1.5px solid;
                }

                :root:not(.dark) .bp-dot.neutral { border-color: #cbd5e1; }
                .dark .bp-dot.neutral            { border-color: rgba(255,255,255,0.2); }

                .bp-name {
                    font-size: 0.875rem;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                :root:not(.dark) .bp-name { color: #0f172a; }
                .dark .bp-name            { color: #f1f5f9; }

                /* "You" badge */
                .bp-you-badge {
                    font-size: 0.6rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding: 2px 6px;
                    border-radius: 5px;
                    flex-shrink: 0;
                    border: 1px solid;
                }

                :root:not(.dark) .bp-you-badge {
                    color: #3b82f6;
                    border-color: rgba(59,130,246,0.25);
                    background: rgba(59,130,246,0.06);
                }

                .dark .bp-you-badge {
                    color: #60a5fa;
                    border-color: rgba(59,130,246,0.2);
                    background: rgba(59,130,246,0.07);
                }

                /* Balance amount */
                .bp-row-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-shrink: 0;
                    margin-left: 12px;
                }

                .bp-amount {
                    font-family: monospace;
                    font-size: 0.875rem;
                    font-weight: 700;
                }

                .bp-amount.positive { color: #10b981; }
                .bp-amount.negative { color: #ef4444; }

                :root:not(.dark) .bp-amount.neutral { color: #94a3b8; }
                .dark .bp-amount.neutral            { color: #475569; }
            `}</style>

            <div className="bp-wrap">
                {/* Header */}
                <div className="bp-header">
                    <div className="bp-header-left">
                        <Wallet className="w-4 h-4" style={{ color: "#3b82f6" }} strokeWidth={1.8} />
                        <h3 className="bp-header-title">Balances</h3>
                    </div>
                    {!loading && (
                        <span className="bp-count">{balances.length}</span>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bp-loader">
                        <Loader2 className="w-5 h-5 bp-spin" style={{ color: "#10b981" }} />
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="bp-empty">No balances yet</div>
                ) : (
                    <div>
                        {sorted.map((b) => {
                            const bal = b.netBalance ?? 0;
                            const isPositive = bal > 0;
                            const isNeutral = bal === 0;
                            const isYou = b.userId === currentUserId;

                            const state = isNeutral ? "neutral" : isPositive ? "positive" : "negative";

                            return (
                                <div key={b.userId} className="bp-row">
                                    <div className="bp-row-left">
                                        <div className={`bp-dot ${state}`} />
                                        <span className="bp-name">{b.fullName}</span>
                                        {isYou && <span className="bp-you-badge">You</span>}
                                    </div>

                                    <div className="bp-row-right">
                                        {isNeutral ? (
                                            <Minus className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
                                        ) : isPositive ? (
                                            <TrendingUp className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                                        ) : (
                                            <TrendingDown className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                                        )}
                                        <span className={`bp-amount ${state}`}>
                                            {isPositive ? "+" : ""}₹{Math.abs(bal).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}