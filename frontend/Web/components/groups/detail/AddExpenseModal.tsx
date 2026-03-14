"use client";

import { useState, useEffect } from "react";
import { X, Loader2, IndianRupee, Check } from "lucide-react";
import { createExpenseAction } from "@/lib/actions";
import type { GroupMember, CreateExpensePayload } from "@/lib/api";

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
    groupId: number;
    members: GroupMember[];
    currentUserId: number | null;
}

export default function AddExpenseModal({ open, onClose, onCreated, groupId, members, currentUserId }: Props) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [splitType, setSplitType] = useState<"EQUAL" | "EXACT">("EQUAL");
    const [selectedIds, setSelectedIds] = useState<number[]>(members.map((m) => m.userId));
    const [exactSplits, setExactSplits] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setSelectedIds(members.map((m) => m.userId));
    }, [members]);

    if (!open) return null;

    const toggleMember = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => setSelectedIds(members.map((m) => m.userId));
    const deselectAll = () => setSelectedIds([]);

    const updateExactAmount = (userId: number, val: string) => {
        setExactSplits((prev) => ({ ...prev, [userId]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || !amount) return;
        setLoading(true);
        setError("");

        let payload: CreateExpensePayload;

        if (splitType === "EQUAL") {
            if (selectedIds.length === 0) {
                setError("Select at least one member");
                setLoading(false);
                return;
            }
            payload = {
                groupId,
                description: description.trim(),
                amount: parseFloat(amount),
                splitType: "EQUAL",
                userIds: selectedIds,
            };
        } else {
            const splits = Object.entries(exactSplits)
                .filter(([, v]) => v && parseFloat(v) > 0)
                .map(([k, v]) => ({ userId: parseInt(k), amount: parseFloat(v) }));

            if (splits.length === 0) {
                setError("Add at least one split amount");
                setLoading(false);
                return;
            }

            const totalSplit = splits.reduce((s, x) => s + x.amount, 0);
            if (Math.abs(totalSplit - parseFloat(amount)) > 0.01) {
                setError(`Split total (${totalSplit.toFixed(2)}) must equal amount (${parseFloat(amount).toFixed(2)})`);
                setLoading(false);
                return;
            }

            payload = {
                groupId,
                description: description.trim(),
                amount: parseFloat(amount),
                splitType: "EXACT",
                exactSplits: splits,
            };
        }

        const res = await createExpenseAction(payload);
        setLoading(false);

        if (res.success) {
            setDescription("");
            setAmount("");
            setExactSplits({});
            setSelectedIds(members.map((m) => m.userId));
            onCreated();
            onClose();
        } else {
            setError(res.message || "Something went wrong");
        }
    };

    const handleClose = () => {
        setDescription("");
        setAmount("");
        setError("");
        setExactSplits({});
        setSelectedIds(members.map((m) => m.userId));
        onClose();
    };

    const exactTotal = Object.values(exactSplits)
        .filter(Boolean)
        .reduce((s, v) => s + (parseFloat(v) || 0), 0);

    const perPerson = amount && selectedIds.length > 0
        ? (parseFloat(amount) / selectedIds.length).toFixed(2)
        : null;

    const isBalanced = amount ? Math.abs(exactTotal - parseFloat(amount)) < 0.01 : false;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                /* ── Overlay — breaks out of any parent stacking context ── */
                .aem-overlay {
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

                .aem-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                }

                /* ── Card ── */
                .aem-card {
                    position: relative;
                    width: 100%;
                    max-width: 460px;
                    border-radius: 22px;
                    padding: 28px 24px;
                    z-index: 1;
                    max-height: 90dvh;
                    overflow-y: auto;
                    animation: aem-popIn 0.32s cubic-bezier(0.32,1.1,0.64,1) both;
                    scrollbar-width: thin;
                }

                @media (min-width: 640px) { .aem-card { padding: 32px 28px; } }

                :root:not(.dark) .aem-card {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 16px 48px rgba(15,23,42,0.14), 0 4px 16px rgba(15,23,42,0.06);
                    scrollbar-color: #e2e8f0 transparent;
                }

                .dark .aem-card {
                    background: #111827;
                    border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.55);
                    scrollbar-color: rgba(255,255,255,0.08) transparent;
                }

                @keyframes aem-popIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                /* ── Close ── */
                .aem-close {
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

                :root:not(.dark) .aem-close { color: #94a3b8; }
                :root:not(.dark) .aem-close:hover { background: #f1f5f9; color: #0f172a; }
                .dark .aem-close { color: #475569; }
                .dark .aem-close:hover { background: rgba(255,255,255,0.07); color: #f1f5f9; }

                /* ── Header ── */
                .aem-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 24px;
                    padding-right: 32px;
                }

                .aem-icon-wrap {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%);
                }

                .aem-header-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 1.05rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin: 0 0 3px;
                }

                :root:not(.dark) .aem-header-title { color: #0f172a; }
                .dark .aem-header-title            { color: #f1f5f9; }

                .aem-header-sub {
                    font-size: 0.8rem;
                    margin: 0;
                }

                :root:not(.dark) .aem-header-sub { color: #94a3b8; }
                .dark .aem-header-sub            { color: #475569; }

                /* ── Form groups ── */
                .aem-group { margin-bottom: 18px; }

                .aem-label {
                    display: block;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }

                :root:not(.dark) .aem-label { color: #475569; }
                .dark .aem-label            { color: #64748b; }

                /* ── Inputs ── */
                .aem-input {
                    width: 100%;
                    padding: 12px 14px;
                    border-radius: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    border: 1.5px solid transparent;
                    outline: none;
                    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
                    box-sizing: border-box;
                }

                :root:not(.dark) .aem-input { background: #f8fafc; border-color: #e2e8f0; color: #0f172a; }
                :root:not(.dark) .aem-input::placeholder { color: #cbd5e1; }
                :root:not(.dark) .aem-input:focus { background: #fff; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
                .dark .aem-input { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.07); color: #f1f5f9; }
                .dark .aem-input::placeholder { color: #334155; }
                .dark .aem-input:focus { background: rgba(255,255,255,0.06); border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.08); }

                /* ── Split type toggle ── */
                .aem-split-toggle {
                    display: flex;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1.5px solid;
                }

                :root:not(.dark) .aem-split-toggle { border-color: #e2e8f0; background: #f8fafc; }
                .dark .aem-split-toggle            { border-color: rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); }

                .aem-split-btn {
                    flex: 1;
                    padding: 11px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.78rem;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    border: none;
                    cursor: pointer;
                    transition: background 0.18s ease, color 0.18s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                .aem-split-btn.active {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: #fff;
                }

                :root:not(.dark) .aem-split-btn:not(.active) { background: transparent; color: #94a3b8; }
                .dark .aem-split-btn:not(.active)            { background: transparent; color: #475569; }
                :root:not(.dark) .aem-split-btn:not(.active):hover { color: #475569; }
                .dark .aem-split-btn:not(.active):hover            { color: #94a3b8; }

                /* ── Member list (equal) ── */
                .aem-member-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .aem-select-btns {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .aem-select-all, .aem-select-none {
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    -webkit-tap-highlight-color: transparent;
                    transition: color 0.15s ease;
                }

                :root:not(.dark) .aem-select-all { color: #10b981; }
                :root:not(.dark) .aem-select-all:hover { color: #059669; }
                .dark .aem-select-all { color: #34d399; }
                .dark .aem-select-all:hover { color: #6ee7b7; }

                :root:not(.dark) .aem-select-none { color: #94a3b8; }
                :root:not(.dark) .aem-select-none:hover { color: #475569; }
                .dark .aem-select-none { color: #475569; }
                .dark .aem-select-none:hover { color: #94a3b8; }

                .aem-sep {
                    font-size: 0.68rem;
                }
                :root:not(.dark) .aem-sep { color: #e2e8f0; }
                .dark .aem-sep            { color: rgba(255,255,255,0.1); }

                .aem-member-list {
                    border-radius: 13px;
                    overflow: hidden;
                    max-height: 192px;
                    overflow-y: auto;
                    scrollbar-width: thin;
                }

                :root:not(.dark) .aem-member-list { border: 1.5px solid #e2e8f0; scrollbar-color: #e2e8f0 transparent; }
                .dark .aem-member-list            { border: 1.5px solid rgba(255,255,255,0.07); scrollbar-color: rgba(255,255,255,0.08) transparent; }

                .aem-member-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 11px 14px;
                    cursor: pointer;
                    transition: background 0.13s ease;
                    -webkit-tap-highlight-color: transparent;
                    border-bottom: 1px solid;
                }

                :root:not(.dark) .aem-member-row { border-color: #f1f5f9; }
                .dark .aem-member-row            { border-color: rgba(255,255,255,0.04); }
                .aem-member-row:last-child { border-bottom: none; }

                :root:not(.dark) .aem-member-row:hover { background: #f8fafc; }
                .dark .aem-member-row:hover            { background: rgba(255,255,255,0.03); }
                :root:not(.dark) .aem-member-row.selected { background: rgba(16,185,129,0.04); }
                .dark .aem-member-row.selected           { background: rgba(16,185,129,0.06); }

                .aem-checkbox {
                    width: 18px;
                    height: 18px;
                    border-radius: 5px;
                    border: 1.5px solid;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: background 0.15s ease, border-color 0.15s ease;
                }

                :root:not(.dark) .aem-checkbox { border-color: #cbd5e1; }
                .dark .aem-checkbox            { border-color: rgba(255,255,255,0.15); }
                .aem-checkbox.checked { background: #10b981; border-color: #10b981; }

                .aem-member-name {
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                :root:not(.dark) .aem-member-name { color: #0f172a; }
                .dark .aem-member-name            { color: #f1f5f9; }

                /* ── Per person info ── */
                .aem-per-person {
                    border-radius: 11px;
                    padding: 11px 14px;
                    margin-top: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    animation: aem-slideIn 0.2s ease both;
                }

                @keyframes aem-slideIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                :root:not(.dark) .aem-per-person { background: rgba(16,185,129,0.07); border: 1px solid rgba(16,185,129,0.18); }
                .dark .aem-per-person            { background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.12); }

                .aem-per-label { font-size: 0.8rem; font-weight: 500; }
                :root:not(.dark) .aem-per-label { color: #059669; }
                .dark .aem-per-label            { color: #34d399; }

                .aem-per-amount { font-family: monospace; font-size: 0.95rem; font-weight: 700; }
                :root:not(.dark) .aem-per-amount { color: #059669; }
                .dark .aem-per-amount            { color: #34d399; }

                /* ── Exact splits ── */
                .aem-exact-list {
                    border-radius: 13px;
                    overflow: hidden;
                    max-height: 224px;
                    overflow-y: auto;
                    scrollbar-width: thin;
                }

                :root:not(.dark) .aem-exact-list { border: 1.5px solid #e2e8f0; scrollbar-color: #e2e8f0 transparent; }
                .dark .aem-exact-list            { border: 1.5px solid rgba(255,255,255,0.07); scrollbar-color: rgba(255,255,255,0.08) transparent; }

                .aem-exact-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 10px 14px;
                    border-bottom: 1px solid;
                }

                :root:not(.dark) .aem-exact-row { border-color: #f1f5f9; }
                .dark .aem-exact-row            { border-color: rgba(255,255,255,0.04); }
                .aem-exact-row:last-child { border-bottom: none; }

                .aem-exact-name {
                    font-size: 0.875rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                :root:not(.dark) .aem-exact-name { color: #475569; }
                .dark .aem-exact-name            { color: #94a3b8; }

                .aem-exact-input {
                    width: 100px;
                    padding: 7px 10px;
                    border-radius: 9px;
                    font-family: monospace;
                    font-size: 0.875rem;
                    text-align: right;
                    border: 1.5px solid transparent;
                    outline: none;
                    flex-shrink: 0;
                    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
                }

                :root:not(.dark) .aem-exact-input { background: #f8fafc; border-color: #e2e8f0; color: #0f172a; }
                :root:not(.dark) .aem-exact-input:focus { background: #fff; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
                .dark .aem-exact-input { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.07); color: #f1f5f9; }
                .dark .aem-exact-input:focus { background: rgba(255,255,255,0.06); border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.08); }

                /* ── Balance row ── */
                .aem-balance {
                    border-radius: 11px;
                    padding: 11px 14px;
                    margin-top: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: background 0.2s ease, border-color 0.2s ease;
                    animation: aem-slideIn 0.2s ease both;
                }

                .aem-balance.balanced {
                    background: rgba(16,185,129,0.07);
                    border: 1px solid rgba(16,185,129,0.18);
                }

                :root:not(.dark) .aem-balance:not(.balanced) { background: #f8fafc; border: 1px solid #e2e8f0; }
                .dark .aem-balance:not(.balanced)            { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); }

                .aem-balance-total { font-family: monospace; font-size: 0.8rem; }
                :root:not(.dark) .aem-balance-total { color: #94a3b8; }
                .dark .aem-balance-total            { color: #475569; }

                .aem-balance-status { font-size: 0.8rem; font-weight: 600; }
                .aem-balance-status.balanced { color: #10b981; }
                :root:not(.dark) .aem-balance-status:not(.balanced) { color: #94a3b8; }
                .dark .aem-balance-status:not(.balanced)            { color: #475569; }

                /* ── Error banner ── */
                .aem-error {
                    font-size: 0.8rem;
                    padding: 10px 12px;
                    border-radius: 10px;
                    margin-bottom: 16px;
                    background: rgba(239,68,68,0.07);
                    border: 1px solid rgba(239,68,68,0.18);
                    color: #ef4444;
                }

                .dark .aem-error { color: #f87171; }

                /* ── Submit ── */
                .aem-submit-btn {
                    width: 100%;
                    padding: 13px;
                    border-radius: 13px;
                    border: none;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, opacity 0.18s ease;
                    -webkit-tap-highlight-color: transparent;
                    margin-top: 20px;
                }

                :root:not(.dark) .aem-submit-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    box-shadow: 0 3px 12px rgba(16,185,129,0.28);
                }

                .dark .aem-submit-btn {
                    background: linear-gradient(135deg, #10b981 0%, #047857 100%);
                    box-shadow: 0 3px 14px rgba(16,185,129,0.18);
                }

                .aem-submit-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.14) 50%, transparent 60%);
                    transform: translateX(-100%);
                }

                .aem-submit-btn:not(:disabled):hover::before { transform: translateX(100%); transition: transform 0.5s ease; }
                .aem-submit-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(16,185,129,0.32); }
                .aem-submit-btn:not(:disabled):active { transform: scale(0.97); }
                .aem-submit-btn:disabled { opacity: 0.42; cursor: not-allowed; box-shadow: none; }

                .aem-spin { animation: aem-rotate 0.8s linear infinite; }
                @keyframes aem-rotate { to { transform: rotate(360deg); } }
            `}</style>

            <div className="aem-overlay">
                <div className="aem-backdrop" onClick={handleClose} />

                <div className="aem-card">
                    {/* Close */}
                    <button onClick={handleClose} className="aem-close" aria-label="Close">
                        <X className="w-4 h-4" />
                    </button>

                    {/* Header */}
                    <div className="aem-header">
                        <div className="aem-icon-wrap">
                            <IndianRupee className="w-5 h-5" style={{ color: "#10b981" }} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="aem-header-title">Add Expense</h2>
                            <p className="aem-header-sub">Split among group members</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Description */}
                        <div className="aem-group">
                            <label className="aem-label">Description *</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Dinner at restaurant"
                                className="aem-input"
                                maxLength={100}
                                required
                            />
                        </div>

                        {/* Amount */}
                        <div className="aem-group">
                            <label className="aem-label">Total Amount *</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                className="aem-input"
                                style={{ fontFamily: "monospace" }}
                                required
                            />
                        </div>

                        {/* Split type */}
                        <div className="aem-group">
                            <label className="aem-label">Split Type</label>
                            <div className="aem-split-toggle">
                                {(["EQUAL", "EXACT"] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setSplitType(t)}
                                        className={`aem-split-btn${splitType === t ? " active" : ""}`}
                                    >
                                        {t === "EQUAL" ? "Equal Split" : "Custom Split"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Equal split — member picker */}
                        {splitType === "EQUAL" && (
                            <div className="aem-group">
                                <div className="aem-member-header">
                                    <label className="aem-label" style={{ margin: 0 }}>Split between</label>
                                    <div className="aem-select-btns">
                                        <button type="button" onClick={selectAll} className="aem-select-all">All</button>
                                        <span className="aem-sep">/</span>
                                        <button type="button" onClick={deselectAll} className="aem-select-none">None</button>
                                    </div>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <div className="aem-member-list">
                                        {members.map((m) => {
                                            const selected = selectedIds.includes(m.userId);
                                            return (
                                                <div
                                                    key={`eq-${m.userId}`}
                                                    onClick={() => toggleMember(m.userId)}
                                                    className={`aem-member-row${selected ? " selected" : ""}`}
                                                >
                                                    <div className={`aem-checkbox${selected ? " checked" : ""}`}>
                                                        {selected && <Check className="w-3 h-3" style={{ color: "#fff" }} strokeWidth={3} />}
                                                    </div>
                                                    <span className="aem-member-name">{m.fullName}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {perPerson && (
                                        <div className="aem-per-person">
                                            <span className="aem-per-label">Per person ({selectedIds.length})</span>
                                            <span className="aem-per-amount">₹{perPerson}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Exact split */}
                        {splitType === "EXACT" && (
                            <div className="aem-group">
                                <label className="aem-label">Amounts per member</label>
                                <div className="aem-exact-list">
                                    {members.map((m) => (
                                        <div key={`exact-${m.userId}`} className="aem-exact-row">
                                            <span className="aem-exact-name">{m.fullName}</span>
                                            <input
                                                type="number"
                                                value={exactSplits[m.userId] || ""}
                                                onChange={(e) => updateExactAmount(m.userId, e.target.value)}
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                className="aem-exact-input"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {amount && (
                                    <div className={`aem-balance${isBalanced ? " balanced" : ""}`}>
                                        <span className="aem-balance-total">
                                            {exactTotal.toFixed(2)} / {parseFloat(amount).toFixed(2)}
                                        </span>
                                        <span className={`aem-balance-status${isBalanced ? " balanced" : ""}`}>
                                            {isBalanced
                                                ? "Balanced ✓"
                                                : `₹${(parseFloat(amount) - exactTotal).toFixed(2)} remaining`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {error && <div className="aem-error">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading || !description.trim() || !amount}
                            className="aem-submit-btn"
                        >
                            {loading && <Loader2 className="w-4 h-4 aem-spin" />}
                            {loading ? "Creating…" : "Add Expense"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}