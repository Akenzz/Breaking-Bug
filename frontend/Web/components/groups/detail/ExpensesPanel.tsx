"use client";

import { useState } from "react";
import { Pencil, Receipt, Ban, AlertTriangle, X } from "lucide-react";
import type { GroupExpense } from "@/lib/api";
import { deleteExpenseAction } from "@/lib/actions";

interface Props {
    expenses: GroupExpense[];
    onEdit: (expense: GroupExpense) => void;
    onDeleted: () => void;
    currentUserId: number | null;
}

export default function ExpensesPanel({ expenses, onEdit, onDeleted, currentUserId }: Props) {
    const [confirmExpense, setConfirmExpense] = useState<GroupExpense | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async (expenseId: number) => {
        setDeleting(true);
        const res = await deleteExpenseAction(expenseId);
        setDeleting(false);
        if (res.success) {
            setConfirmExpense(null);
            onDeleted();
        } else {
            setConfirmExpense(null);
            alert(res.message);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                /* ── List ── */
                .ep-list {
                    font-family: 'DM Sans', sans-serif;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    animation: ep-fadeIn 0.3s ease both;
                }

                @keyframes ep-fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Row card ── */
                .ep-row {
                    border-radius: 16px;
                    padding: 16px 18px;
                    border: 1px solid;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    transition: border-color 0.15s ease, box-shadow 0.15s ease;
                }

                :root:not(.dark) .ep-row {
                    background: #fff;
                    border-color: #e2e8f0;
                    box-shadow: 0 1px 4px rgba(15,23,42,0.04);
                }

                :root:not(.dark) .ep-row:hover {
                    border-color: #cbd5e1;
                    box-shadow: 0 3px 10px rgba(15,23,42,0.07);
                }

                .dark .ep-row {
                    background: #111827;
                    border-color: rgba(255,255,255,0.07);
                }

                .dark .ep-row:hover {
                    border-color: rgba(255,255,255,0.13);
                }

                .ep-row.cancelled { opacity: 0.5; }

                /* ── Icon ── */
                .ep-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .ep-icon.active {
                    background: linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(5,150,105,0.08) 100%);
                }

                :root:not(.dark) .ep-icon.voided { background: #f1f5f9; }
                .dark .ep-icon.voided            { background: rgba(255,255,255,0.04); }

                /* ── Info ── */
                .ep-info {
                    flex: 1;
                    min-width: 0;
                }

                .ep-description {
                    font-family: 'Sora', sans-serif;
                    font-size: 0.925rem;
                    font-weight: 600;
                    letter-spacing: -0.01em;
                    margin: 0 0 5px;
                    line-height: 1.3;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                :root:not(.dark) .ep-description { color: #0f172a; }
                .dark .ep-description            { color: #f1f5f9; }

                .ep-description.cancelled {
                    text-decoration: line-through;
                    text-decoration-color: #94a3b8;
                }

                :root:not(.dark) .ep-description.cancelled { color: #94a3b8; }
                .dark .ep-description.cancelled            { color: #475569; }

                .ep-amount {
                    font-family: monospace;
                    font-size: 1rem;
                    font-weight: 700;
                    display: block;
                    margin-bottom: 4px;
                }

                :root:not(.dark) .ep-amount { color: #0f172a; }
                .dark .ep-amount            { color: #f1f5f9; }

                .ep-cancelled-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                    padding: 3px 8px;
                    border-radius: 20px;
                    background: rgba(239,68,68,0.07);
                    border: 1px solid rgba(239,68,68,0.2);
                    color: #ef4444;
                }

                .dark .ep-cancelled-pill { color: #f87171; }

                /* ── Action buttons ── */
                .ep-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                    flex-shrink: 0;
                }

                .ep-edit-btn, .ep-cancel-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 10px 18px;
                    border-radius: 10px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    border: 1.5px solid;
                    background: transparent;
                    white-space: nowrap;
                    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                    min-width: 100px;
                }

                /* Edit — green */
                :root:not(.dark) .ep-edit-btn { border-color: rgba(16,185,129,0.3); color: #059669; }
                :root:not(.dark) .ep-edit-btn:hover { background: rgba(16,185,129,0.07); border-color: rgba(16,185,129,0.5); }
                .dark .ep-edit-btn { border-color: rgba(16,185,129,0.22); color: #34d399; }
                .dark .ep-edit-btn:hover { background: rgba(16,185,129,0.07); border-color: rgba(16,185,129,0.38); }
                .ep-edit-btn:active { transform: scale(0.96); }

                /* Cancel — red */
                :root:not(.dark) .ep-cancel-btn { border-color: rgba(239,68,68,0.25); color: #ef4444; }
                :root:not(.dark) .ep-cancel-btn:hover { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.45); }
                .dark .ep-cancel-btn { border-color: rgba(239,68,68,0.2); color: #f87171; }
                .dark .ep-cancel-btn:hover { background: rgba(239,68,68,0.07); border-color: rgba(239,68,68,0.38); }
                .ep-cancel-btn:active { transform: scale(0.96); }

                /* ── Full-page confirm modal ── */
                .ep-modal-overlay {
                    position: fixed;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    width: 100dvw;
                    height: 100dvh;
                    z-index: 9999;
                    transform: none !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    font-family: 'DM Sans', sans-serif;
                }

                .ep-modal-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                }

                .ep-modal-card {
                    position: relative;
                    width: 100%;
                    max-width: 380px;
                    border-radius: 22px;
                    padding: 28px 24px;
                    z-index: 1;
                    animation: ep-popIn 0.3s cubic-bezier(0.32,1.1,0.64,1) both;
                }

                :root:not(.dark) .ep-modal-card {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 16px 48px rgba(15,23,42,0.14), 0 4px 16px rgba(15,23,42,0.06);
                }

                .dark .ep-modal-card {
                    background: #111827;
                    border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.55);
                }

                @keyframes ep-popIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                /* Modal close */
                .ep-modal-close {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .ep-modal-close { color: #94a3b8; }
                :root:not(.dark) .ep-modal-close:hover { background: #f1f5f9; color: #475569; }
                .dark .ep-modal-close { color: #475569; }
                .dark .ep-modal-close:hover { background: rgba(255,255,255,0.07); color: #94a3b8; }

                /* Modal body */
                .ep-modal-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(239,68,68,0.1);
                    margin: 0 auto 16px;
                }

                .ep-modal-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 1.05rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    text-align: center;
                    margin: 0 0 8px;
                }

                :root:not(.dark) .ep-modal-title { color: #0f172a; }
                .dark .ep-modal-title            { color: #f1f5f9; }

                .ep-modal-desc {
                    font-size: 0.875rem;
                    text-align: center;
                    margin: 0 0 6px;
                    line-height: 1.5;
                }

                :root:not(.dark) .ep-modal-desc { color: #64748b; }
                .dark .ep-modal-desc            { color: #475569; }

                /* Expense name in modal */
                .ep-modal-expense-name {
                    text-align: center;
                    font-family: 'Sora', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 700;
                    padding: 8px 14px;
                    border-radius: 10px;
                    margin: 0 0 22px;
                    display: block;
                }

                :root:not(.dark) .ep-modal-expense-name { background: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0; }
                .dark .ep-modal-expense-name            { background: rgba(255,255,255,0.04); color: #f1f5f9; border: 1px solid rgba(255,255,255,0.07); }

                /* Modal buttons */
                .ep-modal-btns {
                    display: flex;
                    gap: 10px;
                }

                .ep-modal-keep {
                    flex: 1;
                    padding: 13px;
                    border-radius: 12px;
                    border: 1.5px solid;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 600;
                    background: transparent;
                    cursor: pointer;
                    transition: background 0.15s ease, border-color 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .ep-modal-keep { border-color: #e2e8f0; color: #64748b; }
                :root:not(.dark) .ep-modal-keep:hover { background: #f8fafc; border-color: #cbd5e1; }
                .dark .ep-modal-keep { border-color: rgba(255,255,255,0.08); color: #475569; }
                .dark .ep-modal-keep:hover { background: rgba(255,255,255,0.04); }

                .ep-modal-confirm {
                    flex: 1;
                    padding: 13px;
                    border-radius: 12px;
                    border: none;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    box-shadow: 0 3px 12px rgba(239,68,68,0.28);
                    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, opacity 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                .ep-modal-confirm:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(239,68,68,0.35); }
                .ep-modal-confirm:active { transform: scale(0.97); }
                .ep-modal-confirm:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; transform: none; }

                .ep-spin { animation: ep-rotate 0.8s linear infinite; }
                @keyframes ep-rotate { to { transform: rotate(360deg); } }
            `}</style>

            {/* Full-page cancel confirm modal */}
            {confirmExpense && (
                <div className="ep-modal-overlay">
                    <div className="ep-modal-backdrop" onClick={() => !deleting && setConfirmExpense(null)} />
                    <div className="ep-modal-card">
                        <button
                            onClick={() => setConfirmExpense(null)}
                            className="ep-modal-close"
                            disabled={deleting}
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="ep-modal-icon">
                            <AlertTriangle style={{ width: 24, height: 24, color: "#ef4444" }} strokeWidth={2} />
                        </div>

                        <h2 className="ep-modal-title">Cancel this expense?</h2>
                        <p className="ep-modal-desc">You're about to cancel:</p>
                        <span className="ep-modal-expense-name">
                            {confirmExpense.description} — ₹{confirmExpense.totalAmount}
                        </span>

                        <div className="ep-modal-btns">
                            <button
                                onClick={() => setConfirmExpense(null)}
                                disabled={deleting}
                                className="ep-modal-keep"
                            >
                                Keep it
                            </button>
                            <button
                                onClick={() => handleDelete(confirmExpense.id)}
                                disabled={deleting}
                                className="ep-modal-confirm"
                            >
                                {deleting
                                    ? <Ban className="w-4 h-4 ep-spin" />
                                    : <Ban className="w-4 h-4" />
                                }
                                {deleting ? "Cancelling…" : "Yes, Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Expense list — active first, cancelled at bottom */}
            <div className="ep-list">
                {[...expenses].sort((a, b) => Number(a.cancelled) - Number(b.cancelled)).map((expense) => (
                    <div
                        key={expense.id}
                        className={`ep-row${expense.cancelled ? " cancelled" : ""}`}
                    >
                        {/* Icon */}
                        <div className={`ep-icon ${expense.cancelled ? "voided" : "active"}`}>
                            {expense.cancelled
                                ? <Ban style={{ width: 18, height: 18, color: "#94a3b8" }} strokeWidth={1.6} />
                                : <Receipt style={{ width: 18, height: 18, color: "#10b981" }} strokeWidth={1.6} />
                            }
                        </div>

                        {/* Info */}
                        <div className="ep-info">
                            <p className={`ep-description${expense.cancelled ? " cancelled" : ""}`}>
                                {expense.description}
                            </p>
                            <span className="ep-amount">₹{expense.totalAmount}</span>
                            {expense.cancelled && (
                                <span className="ep-cancelled-pill">
                                    <Ban style={{ width: 9, height: 9 }} strokeWidth={2.5} />
                                    Cancelled
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        {!expense.cancelled && expense.paidByUserId === currentUserId && (
                            <div className="ep-actions">
                                <button onClick={() => onEdit(expense)} className="ep-edit-btn">
                                    <Pencil style={{ width: 14, height: 14 }} strokeWidth={2} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setConfirmExpense(expense)}
                                    className="ep-cancel-btn"
                                >
                                    <Ban style={{ width: 14, height: 14 }} strokeWidth={2} />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}