"use client";

import { useState } from "react";
import { X, Loader2, LogIn } from "lucide-react";
import { joinGroupAction } from "@/lib/actions";

interface Props { open: boolean; onClose: () => void; onJoined: () => void; initialCode?: string; }

export default function JoinGroupModal({ open, onClose, onJoined, initialCode = "" }: Props) {
    const [code, setCode] = useState(initialCode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;
        setLoading(true); setError("");
        const res = await joinGroupAction(code.trim());
        setLoading(false);
        if (res.success) { setCode(""); onJoined(); onClose(); }
        else setError(res.message || "Failed to join group");
    };

    const handleClose = () => { setCode(initialCode); setError(""); onClose(); };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                /* ── Overlay — breaks out of any parent stacking context ── */
                .jgm-overlay {
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

                .jgm-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                }

                /* ── Card ── */
                .jgm-card {
                    position: relative;
                    width: 100%;
                    max-width: 420px;
                    border-radius: 22px;
                    padding: 28px 24px;
                    z-index: 1;
                    animation: jgm-popIn 0.32s cubic-bezier(0.32,1.1,0.64,1) both;
                }

                @media (min-width: 640px) { .jgm-card { padding: 32px 28px; } }

                :root:not(.dark) .jgm-card {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 16px 48px rgba(15,23,42,0.14), 0 4px 16px rgba(15,23,42,0.06);
                }

                .dark .jgm-card {
                    background: #111827;
                    border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.55);
                }

                @keyframes jgm-popIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                /* ── Close ── */
                .jgm-close {
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

                :root:not(.dark) .jgm-close { color: #94a3b8; }
                :root:not(.dark) .jgm-close:hover { background: #f1f5f9; color: #0f172a; }
                .dark .jgm-close { color: #475569; }
                .dark .jgm-close:hover { background: rgba(255,255,255,0.07); color: #f1f5f9; }

                /* ── Header ── */
                .jgm-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 24px;
                    padding-right: 32px;
                }

                .jgm-icon-wrap {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%);
                }

                .jgm-header-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 1.05rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin: 0 0 3px;
                }

                :root:not(.dark) .jgm-header-title { color: #0f172a; }
                .dark .jgm-header-title            { color: #f1f5f9; }

                .jgm-header-sub {
                    font-size: 0.8rem;
                    margin: 0;
                }

                :root:not(.dark) .jgm-header-sub { color: #94a3b8; }
                .dark .jgm-header-sub            { color: #475569; }

                /* ── Label ── */
                .jgm-label {
                    display: block;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }

                :root:not(.dark) .jgm-label { color: #475569; }
                .dark .jgm-label            { color: #64748b; }

                /* ── Code input ── */
                .jgm-code-input {
                    width: 100%;
                    padding: 16px 14px;
                    border-radius: 14px;
                    font-family: 'Sora', sans-serif;
                    font-size: 1.4rem;
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    text-align: center;
                    border: 1.5px solid transparent;
                    outline: none;
                    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
                    box-sizing: border-box;
                    margin-bottom: 20px;
                }

                :root:not(.dark) .jgm-code-input {
                    background: #f8fafc;
                    border-color: #e2e8f0;
                    color: #059669;
                }

                :root:not(.dark) .jgm-code-input::placeholder {
                    color: #e2e8f0;
                    letter-spacing: 0.1em;
                    font-size: 1rem;
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 400;
                }

                :root:not(.dark) .jgm-code-input:focus {
                    background: #fff;
                    border-color: #10b981;
                    box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
                }

                .dark .jgm-code-input {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.07);
                    color: #34d399;
                }

                .dark .jgm-code-input::placeholder {
                    color: rgba(255,255,255,0.1);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 1rem;
                    font-weight: 400;
                    letter-spacing: 0.1em;
                }

                .dark .jgm-code-input:focus {
                    background: rgba(255,255,255,0.06);
                    border-color: #10b981;
                    box-shadow: 0 0 0 3px rgba(16,185,129,0.08);
                }

                /* ── Error ── */
                .jgm-error {
                    font-size: 0.8rem;
                    padding: 10px 12px;
                    border-radius: 10px;
                    margin-bottom: 16px;
                    background: rgba(239,68,68,0.07);
                    border: 1px solid rgba(239,68,68,0.18);
                    color: #ef4444;
                }

                .dark .jgm-error { color: #f87171; }

                /* ── Submit button ── */
                .jgm-submit-btn {
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
                }

                :root:not(.dark) .jgm-submit-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    box-shadow: 0 3px 12px rgba(16,185,129,0.28);
                }

                .dark .jgm-submit-btn {
                    background: linear-gradient(135deg, #10b981 0%, #047857 100%);
                    box-shadow: 0 3px 14px rgba(16,185,129,0.18);
                }

                .jgm-submit-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.14) 50%, transparent 60%);
                    transform: translateX(-100%);
                }

                .jgm-submit-btn:not(:disabled):hover::before { transform: translateX(100%); transition: transform 0.5s ease; }
                .jgm-submit-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(16,185,129,0.32); }
                .jgm-submit-btn:not(:disabled):active { transform: scale(0.97); }
                .jgm-submit-btn:disabled { opacity: 0.42; cursor: not-allowed; box-shadow: none; }

                .jgm-spin { animation: jgm-rotate 0.8s linear infinite; }
                @keyframes jgm-rotate { to { transform: rotate(360deg); } }
            `}</style>

            <div className="jgm-overlay">
                <div className="jgm-backdrop" onClick={handleClose} />

                <div className="jgm-card">
                    {/* Close */}
                    <button onClick={handleClose} className="jgm-close" aria-label="Close">
                        <X className="w-4 h-4" />
                    </button>

                    {/* Header */}
                    <div className="jgm-header">
                        <div className="jgm-icon-wrap">
                            <LogIn className="w-5 h-5" style={{ color: "#10b981" }} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="jgm-header-title">Join Group</h2>
                            <p className="jgm-header-sub">Enter the group code to join</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <label className="jgm-label">Group Code *</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="A1B2C3D4"
                            className="jgm-code-input"
                            maxLength={20}
                            required
                        />

                        {error && <div className="jgm-error">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading || !code.trim()}
                            className="jgm-submit-btn"
                        >
                            {loading && <Loader2 className="w-4 h-4 jgm-spin" />}
                            {loading ? "Joining…" : "Join Group"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}