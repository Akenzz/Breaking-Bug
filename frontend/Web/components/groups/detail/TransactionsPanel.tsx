"use client";

import { ArrowUpRight, ArrowDownLeft, Receipt, Loader2 } from "lucide-react";
import type { Transaction } from "@/lib/api";

interface Props {
    transactions: Transaction[];
    loading?: boolean;
}

export default function TransactionsPanel({ transactions, loading = false }: Props) {
    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                .tp-wrap {
                    font-family: 'DM Sans', sans-serif;
                    border-radius: 16px;
                    overflow: hidden;
                    animation: tp-fadeIn 0.3s ease both;
                }

                @keyframes tp-fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                :root:not(.dark) .tp-wrap {
                    border: 1px solid #e2e8f0;
                    background: #fff;
                    box-shadow: 0 1px 4px rgba(15,23,42,0.04);
                }

                .dark .tp-wrap {
                    border: 1px solid rgba(255,255,255,0.07);
                    background: #111827;
                }

                /* ── Header ── */
                .tp-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid;
                }

                :root:not(.dark) .tp-header { border-color: #f1f5f9; }
                .dark .tp-header            { border-color: rgba(255,255,255,0.05); }

                .tp-header-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .tp-header-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    margin: 0;
                }

                :root:not(.dark) .tp-header-title { color: #0f172a; }
                .dark .tp-header-title            { color: #f1f5f9; }

                .tp-count {
                    font-family: monospace;
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 2px 7px;
                    border-radius: 6px;
                }

                :root:not(.dark) .tp-count { background: #f1f5f9; color: #94a3b8; }
                .dark .tp-count            { background: rgba(255,255,255,0.05); color: #475569; }

                /* ── Loader ── */
                .tp-loader {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 0;
                }

                .tp-spin { animation: tp-rotate 0.8s linear infinite; }
                @keyframes tp-rotate { to { transform: rotate(360deg); } }

                /* ── Empty state ── */
                .tp-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 48px 24px;
                    text-align: center;
                }

                .tp-empty-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 14px;
                    background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(99,102,241,0.06) 100%);
                }

                .tp-empty-title {
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin: 0 0 4px;
                }

                :root:not(.dark) .tp-empty-title { color: #475569; }
                .dark .tp-empty-title            { color: #64748b; }

                .tp-empty-sub {
                    font-size: 0.78rem;
                    margin: 0;
                }

                :root:not(.dark) .tp-empty-sub { color: #94a3b8; }
                .dark .tp-empty-sub            { color: #475569; }

                /* ── Transaction row ── */
                .tp-row {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 13px 20px;
                    border-bottom: 1px solid;
                    transition: background 0.13s ease;
                }

                :root:not(.dark) .tp-row { border-color: #f8fafc; }
                .dark .tp-row            { border-color: rgba(255,255,255,0.03); }
                .tp-row:last-child { border-bottom: none; }

                :root:not(.dark) .tp-row:hover { background: #fafafa; }
                .dark .tp-row:hover            { background: rgba(255,255,255,0.02); }

                /* ── Icon wrap ── */
                .tp-icon-wrap {
                    width: 36px;
                    height: 36px;
                    border-radius: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .tp-icon-wrap.settlement {
                    background: linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(5,150,105,0.08) 100%);
                }

                .tp-icon-wrap.expense {
                    background: linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.07) 100%);
                }

                /* ── Row body ── */
                .tp-body {
                    flex: 1;
                    min-width: 0;
                }

                .tp-description {
                    font-size: 0.875rem;
                    font-weight: 500;
                    margin: 0 0 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                :root:not(.dark) .tp-description { color: #0f172a; }
                .dark .tp-description            { color: #f1f5f9; }

                .tp-meta {
                    font-size: 0.72rem;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                :root:not(.dark) .tp-meta { color: #94a3b8; }
                .dark .tp-meta            { color: #475569; }

                .tp-meta-time {
                    opacity: 0.6;
                }

                /* ── Amount ── */
                .tp-amount-col {
                    text-align: right;
                    flex-shrink: 0;
                }

                .tp-amount {
                    font-family: monospace;
                    font-size: 0.9rem;
                    font-weight: 700;
                    display: block;
                    margin-bottom: 2px;
                }

                .tp-amount.settlement { color: #10b981; }

                :root:not(.dark) .tp-amount:not(.settlement) { color: #0f172a; }
                .dark .tp-amount:not(.settlement)            { color: #f1f5f9; }

                .tp-type-tag {
                    font-size: 0.6rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                .tp-type-tag.settlement { color: #10b981; }
                .tp-type-tag.expense    { color: #3b82f6; }
            `}</style>

            <div className="tp-wrap">
                {/* Header */}
                <div className="tp-header">
                    <div className="tp-header-left">
                        <Receipt className="w-4 h-4" style={{ color: "#3b82f6" }} strokeWidth={1.8} />
                        <h3 className="tp-header-title">Transactions</h3>
                    </div>
                    {!loading && <span className="tp-count">{transactions.length}</span>}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="tp-loader">
                        <Loader2 className="w-5 h-5 tp-spin" style={{ color: "#10b981" }} />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="tp-empty">
                        <div className="tp-empty-icon">
                            <Receipt className="w-6 h-6" style={{ color: "#3b82f6" }} strokeWidth={1.4} />
                        </div>
                        <p className="tp-empty-title">No transactions yet</p>
                        <p className="tp-empty-sub">Add an expense to get started</p>
                    </div>
                ) : (
                    <div>
                        {transactions.map((t, idx) => {
                            const isSettlement = t.type === "SETTLEMENT";
                            return (
                                <div key={`tx-${t.fromUserId}-${idx}`} className="tp-row">
                                    <div className={`tp-icon-wrap ${isSettlement ? "settlement" : "expense"}`}>
                                        {isSettlement ? (
                                            <ArrowDownLeft className="w-4 h-4" style={{ color: "#10b981" }} strokeWidth={2} />
                                        ) : (
                                            <ArrowUpRight className="w-4 h-4" style={{ color: "#3b82f6" }} strokeWidth={2} />
                                        )}
                                    </div>

                                    <div className="tp-body">
                                        <p className="tp-description">{t.description}</p>
                                        <p className="tp-meta">
                                            {t.fromUserName}
                                            <span>·</span>
                                            {formatDate(t.createdAt)}
                                            <span className="tp-meta-time">{formatTime(t.createdAt)}</span>
                                        </p>
                                    </div>

                                    <div className="tp-amount-col">
                                        <span className={`tp-amount${isSettlement ? " settlement" : ""}`}>
                                            ₹{(t.amount ?? 0).toFixed(2)}
                                        </span>
                                        <span className={`tp-type-tag ${isSettlement ? "settlement" : "expense"}`}>
                                            {isSettlement ? "Settlement" : "Expense"}
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