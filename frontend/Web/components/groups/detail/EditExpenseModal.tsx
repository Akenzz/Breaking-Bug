"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Pencil, IndianRupee, Users } from "lucide-react";
import type { GroupExpense, GroupMember } from "@/lib/api";
import { editExpenseAction } from "@/lib/actions";

interface Props {
    open: boolean;
    expense: GroupExpense | null;
    members: GroupMember[];
    currentUserId: number | null;
    onClose: () => void;
    onUpdated: () => void;
}

export default function EditExpenseModal({
    open,
    expense,
    members,
    currentUserId,
    onClose,
    onUpdated,
}: Props) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (expense) {
            setDescription(expense.description);
            setAmount(expense.totalAmount);
        }
    }, [expense]);

    if (!open || !expense) return null;

    const handleSave = async () => {
        if (!currentUserId) return;
        setLoading(true);
        const res = await editExpenseAction(expense.id, {
            description,
            amount,
            payerId: expense.paidByUserId ?? currentUserId,
            splitType: "EQUAL",
            userIds: members.map((m) => m.userId),
        });
        setLoading(false);
        if (res.success) {
            onUpdated();
            onClose();
        }
    };

    const perPerson = members.length > 0 && amount > 0
        ? (amount / members.length).toFixed(2)
        : null;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                /* ── Overlay ── */
                .eem-overlay {
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

                .eem-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                }

                /* ── Card ── */
                .eem-card {
                    position: relative;
                    width: 100%;
                    max-width: 420px;
                    border-radius: 22px;
                    padding: 28px 24px 24px;
                    z-index: 1;
                    animation: eem-popIn 0.32s cubic-bezier(0.32,1.1,0.64,1) both;
                }

                @media (min-width: 640px) { .eem-card { padding: 32px 28px 26px; } }

                :root:not(.dark) .eem-card {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 16px 48px rgba(15,23,42,0.14), 0 4px 16px rgba(15,23,42,0.06);
                }

                .dark .eem-card {
                    background: #111827;
                    border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.55);
                }

                @keyframes eem-popIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                /* ── Close ── */
                .eem-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.15s ease, color 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .eem-close { color: #94a3b8; }
                :root:not(.dark) .eem-close:hover { background: #f1f5f9; color: #0f172a; }
                .dark .eem-close { color: #475569; }
                .dark .eem-close:hover { background: rgba(255,255,255,0.07); color: #f1f5f9; }

                /* ── Header ── */
                .eem-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 24px;
                    padding-right: 32px;
                }

                .eem-icon-wrap {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%);
                }

                .eem-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 1.05rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin: 0 0 3px;
                }

                :root:not(.dark) .eem-title { color: #0f172a; }
                .dark .eem-title            { color: #f1f5f9; }

                .eem-subtitle {
                    font-size: 0.78rem;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 220px;
                }

                :root:not(.dark) .eem-subtitle { color: #94a3b8; }
                .dark .eem-subtitle            { color: #475569; }

                /* ── Fields ── */
                .eem-group { margin-bottom: 16px; }

                .eem-label {
                    display: block;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }

                :root:not(.dark) .eem-label { color: #475569; }
                .dark .eem-label            { color: #64748b; }

                /* Input wrapper with leading icon */
                .eem-input-wrap {
                    position: relative;
                }

                .eem-input-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                }

                .eem-input {
                    width: 100%;
                    padding: 12px 14px 12px 38px;
                    border-radius: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    border: 1.5px solid transparent;
                    outline: none;
                    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
                    box-sizing: border-box;
                }

                .eem-input.no-icon {
                    padding-left: 14px;
                }

                :root:not(.dark) .eem-input { background: #f8fafc; border-color: #e2e8f0; color: #0f172a; }
                :root:not(.dark) .eem-input::placeholder { color: #cbd5e1; }
                :root:not(.dark) .eem-input:focus { background: #fff; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
                .dark .eem-input { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.07); color: #f1f5f9; }
                .dark .eem-input::placeholder { color: #334155; }
                .dark .eem-input:focus { background: rgba(255,255,255,0.06); border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.08); }

                /* Per person hint */
                .eem-per-person {
                    border-radius: 11px;
                    padding: 10px 14px;
                    margin-top: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    animation: eem-slideIn 0.2s ease both;
                }

                @keyframes eem-slideIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                :root:not(.dark) .eem-per-person { background: rgba(16,185,129,0.07); border: 1px solid rgba(16,185,129,0.18); }
                .dark .eem-per-person            { background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.12); }

                .eem-per-left {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                :root:not(.dark) .eem-per-left { color: #059669; }
                .dark .eem-per-left            { color: #34d399; }

                .eem-per-amount {
                    font-family: monospace;
                    font-size: 0.9rem;
                    font-weight: 700;
                }

                :root:not(.dark) .eem-per-amount { color: #059669; }
                .dark .eem-per-amount            { color: #34d399; }

                /* ── Divider ── */
                .eem-divider {
                    height: 1px;
                    margin: 20px 0;
                }

                :root:not(.dark) .eem-divider { background: #f1f5f9; }
                .dark .eem-divider            { background: rgba(255,255,255,0.05); }

                /* ── Footer buttons ── */
                .eem-footer {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }

                .eem-cancel-btn {
                    padding: 11px 18px;
                    border-radius: 12px;
                    border: 1.5px solid;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 600;
                    background: transparent;
                    cursor: pointer;
                    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .eem-cancel-btn { border-color: #e2e8f0; color: #64748b; }
                :root:not(.dark) .eem-cancel-btn:hover { background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }
                .dark .eem-cancel-btn { border-color: rgba(255,255,255,0.08); color: #475569; }
                .dark .eem-cancel-btn:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.14); color: #94a3b8; }
                .eem-cancel-btn:active { transform: scale(0.97); }

                .eem-save-btn {
                    padding: 11px 22px;
                    border-radius: 12px;
                    border: none;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, opacity 0.18s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .eem-save-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    box-shadow: 0 3px 12px rgba(16,185,129,0.28);
                }

                .dark .eem-save-btn {
                    background: linear-gradient(135deg, #10b981 0%, #047857 100%);
                    box-shadow: 0 3px 14px rgba(16,185,129,0.18);
                }

                .eem-save-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.14) 50%, transparent 60%);
                    transform: translateX(-100%);
                }

                .eem-save-btn:not(:disabled):hover::before { transform: translateX(100%); transition: transform 0.5s ease; }
                .eem-save-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(16,185,129,0.32); }
                .eem-save-btn:not(:disabled):active { transform: scale(0.97); }
                .eem-save-btn:disabled { opacity: 0.42; cursor: not-allowed; box-shadow: none; }

                .eem-spin { animation: eem-rotate 0.8s linear infinite; }
                @keyframes eem-rotate { to { transform: rotate(360deg); } }
            `}</style>

            <div className="eem-overlay">
                <div className="eem-backdrop" onClick={onClose} />

                <div className="eem-card">
                    {/* Close */}
                    <button onClick={onClose} className="eem-close" aria-label="Close">
                        <X className="w-4 h-4" />
                    </button>

                    {/* Header */}
                    <div className="eem-header">
                        <div className="eem-icon-wrap">
                            <Pencil className="w-5 h-5" style={{ color: "#10b981" }} strokeWidth={1.8} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h2 className="eem-title">Edit Expense</h2>
                            <p className="eem-subtitle" title={expense.description}>
                                {expense.description}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="eem-group">
                        <label className="eem-label">Description</label>
                        <div className="eem-input-wrap">
                            <div className="eem-input-icon">
                                <Pencil style={{ width: 14, height: 14, color: "#94a3b8" }} strokeWidth={1.8} />
                            </div>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Dinner at restaurant"
                                className="eem-input"
                            />
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="eem-group">
                        <label className="eem-label">Total Amount</label>
                        <div className="eem-input-wrap">
                            <div className="eem-input-icon">
                                <IndianRupee style={{ width: 14, height: 14, color: "#94a3b8" }} strokeWidth={1.8} />
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                placeholder="0.00"
                                className="eem-input"
                                style={{ fontFamily: "monospace" }}
                            />
                        </div>

                        {/* Per person preview */}
                        {perPerson && (
                            <div className="eem-per-person">
                                <div className="eem-per-left">
                                    <Users style={{ width: 13, height: 13 }} strokeWidth={2} />
                                    Split equally among {members.length}
                                </div>
                                <span className="eem-per-amount">₹{perPerson} each</span>
                            </div>
                        )}
                    </div>

                    <div className="eem-divider" />

                    {/* Footer */}
                    <div className="eem-footer">
                        <button onClick={onClose} className="eem-cancel-btn">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || !currentUserId}
                            className="eem-save-btn"
                        >
                            {loading
                                ? <><Loader2 className="w-4 h-4 eem-spin" /> Saving…</>
                                : <><Pencil style={{ width: 14, height: 14 }} strokeWidth={2} /> Save Changes</>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}