"use client";

import { useState } from "react";
import { X, Loader2, UserPlus, Phone, CheckCircle2 } from "lucide-react";
import { sendFriendRequestAction } from "@/lib/actions";

interface Props {
    open: boolean;
    onClose: () => void;
    onSent: () => void;
}

export default function AddFriendModal({ open, onClose, onSent }: Props) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber.trim()) return;

        setLoading(true);
        setError("");
        setSuccess("");

        const res = await sendFriendRequestAction(phoneNumber.trim());
        setLoading(false);

        if (res.success) {
            setSuccess(res.message || "Friend request sent!");
            setPhoneNumber("");
            setTimeout(() => {
                onSent();
                onClose();
                setSuccess("");
            }, 1200);
        } else {
            setError(res.message || "Something went wrong");
        }
    };

    const handleClose = () => {
        setPhoneNumber("");
        setError("");
        setSuccess("");
        onClose();
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                /* ── Overlay ── */
                .afm-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 50;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    animation: afm-overlayIn 0.22s ease forwards;
                }

                @media (min-width: 480px) {
                    .afm-overlay {
                        align-items: center;
                        padding: 16px;
                    }
                }

                @keyframes afm-overlayIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                .afm-backdrop {
                    position: absolute;
                    inset: 0;
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                }

                :root:not(.dark) .afm-backdrop { background: rgba(15, 23, 42, 0.45); }
                .dark .afm-backdrop            { background: rgba(0, 0, 0, 0.65); }

                /* ── Card ── */
                .afm-card {
                    font-family: 'DM Sans', sans-serif;
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 420px;
                    border-radius: 24px 24px 0 0;
                    padding: 28px 24px 36px;
                    animation: afm-sheetUp 0.38s cubic-bezier(0.32, 1.2, 0.64, 1) forwards;
                    overflow: hidden;
                }

                @media (min-width: 480px) {
                    .afm-card {
                        border-radius: 22px;
                        padding: 32px 28px;
                        animation: afm-popIn 0.38s cubic-bezier(0.32, 1.2, 0.64, 1) forwards;
                    }
                }

                :root:not(.dark) .afm-card {
                    background: #ffffff;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    box-shadow: 0 24px 64px rgba(15, 23, 42, 0.14), 0 4px 16px rgba(15,23,42,0.06);
                }

                .dark .afm-card {
                    background: #111827;
                    border: 1px solid rgba(255,255,255,0.07);
                    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55), 0 4px 16px rgba(0,0,0,0.3);
                }

                /* Drag pill (mobile sheet) */
                .afm-pill {
                    width: 36px;
                    height: 4px;
                    border-radius: 2px;
                    margin: 0 auto 20px;
                    display: block;
                }

                :root:not(.dark) .afm-pill { background: #e2e8f0; }
                .dark .afm-pill            { background: rgba(255,255,255,0.1); }

                @media (min-width: 480px) {
                    .afm-pill { display: none; }
                }

                /* Background decoration */
                .afm-card::before {
                    content: '';
                    position: absolute;
                    top: -60px;
                    right: -60px;
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    pointer-events: none;
                }

                :root:not(.dark) .afm-card::before { background: radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%); }
                .dark .afm-card::before            { background: radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%); }

                @keyframes afm-sheetUp {
                    from { opacity: 0; transform: translateY(100%); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                @keyframes afm-popIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* ── Close button ── */
                .afm-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.15s ease, transform 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .afm-close { background: #f1f5f9; color: #64748b; }
                :root:not(.dark) .afm-close:hover { background: #e2e8f0; color: #0f172a; }
                .dark .afm-close { background: rgba(255,255,255,0.07); color: #94a3b8; }
                .dark .afm-close:hover { background: rgba(255,255,255,0.12); color: #f1f5f9; }

                .afm-close:active { transform: scale(0.9); }

                /* ── Header ── */
                .afm-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 24px;
                }

                .afm-icon-wrap {
                    width: 48px;
                    height: 48px;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                :root:not(.dark) .afm-icon-wrap {
                    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
                    box-shadow: 0 2px 10px rgba(16,185,129,0.18);
                }

                .dark .afm-icon-wrap {
                    background: linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.12) 100%);
                    box-shadow: 0 2px 12px rgba(16,185,129,0.1);
                }

                .afm-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 1.15rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin: 0 0 2px;
                }

                :root:not(.dark) .afm-title { color: #0f172a; }
                .dark .afm-title            { color: #f1f5f9; }

                .afm-subtitle {
                    font-size: 0.8rem;
                    margin: 0;
                }

                :root:not(.dark) .afm-subtitle { color: #94a3b8; }
                .dark .afm-subtitle            { color: #64748b; }

                /* ── Label ── */
                .afm-label {
                    display: block;
                    font-size: 0.78rem;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }

                :root:not(.dark) .afm-label { color: #475569; }
                .dark .afm-label            { color: #64748b; }

                /* ── Input ── */
                .afm-input-wrap {
                    position: relative;
                }

                .afm-input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                    transition: color 0.15s ease;
                }

                :root:not(.dark) .afm-input-icon { color: #94a3b8; }
                .dark .afm-input-icon            { color: #475569; }

                .afm-input {
                    width: 100%;
                    padding: 13px 14px 13px 42px;
                    font-family: 'DM Sans', monospace;
                    font-size: 0.95rem;
                    border-radius: 12px;
                    border: 1.5px solid transparent;
                    outline: none;
                    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
                    box-sizing: border-box;
                    letter-spacing: 0.02em;
                }

                :root:not(.dark) .afm-input {
                    background: #f8fafc;
                    border-color: #e2e8f0;
                    color: #0f172a;
                }

                :root:not(.dark) .afm-input::placeholder { color: #cbd5e1; }

                :root:not(.dark) .afm-input:focus {
                    background: #fff;
                    border-color: #10b981;
                    box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
                }

                :root:not(.dark) .afm-input:focus + .afm-input-icon,
                :root:not(.dark) .afm-input-wrap:focus-within .afm-input-icon {
                    color: #10b981;
                }

                .dark .afm-input {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.08);
                    color: #f1f5f9;
                }

                .dark .afm-input::placeholder { color: #334155; }

                .dark .afm-input:focus {
                    background: rgba(255,255,255,0.06);
                    border-color: #10b981;
                    box-shadow: 0 0 0 3px rgba(16,185,129,0.08);
                }

                .dark .afm-input-wrap:focus-within .afm-input-icon {
                    color: #10b981;
                }

                /* ── Feedback banners ── */
                .afm-banner {
                    border-radius: 10px;
                    padding: 10px 14px;
                    font-size: 0.83rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    animation: afm-bannerIn 0.25s ease forwards;
                    margin-top: 12px;
                }

                @keyframes afm-bannerIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .afm-banner-error {
                    background: rgba(239,68,68,0.08);
                    border: 1px solid rgba(239,68,68,0.2);
                    color: #ef4444;
                }

                .dark .afm-banner-error {
                    background: rgba(239,68,68,0.07);
                    border-color: rgba(239,68,68,0.15);
                    color: #f87171;
                }

                .afm-banner-success {
                    background: rgba(16,185,129,0.08);
                    border: 1px solid rgba(16,185,129,0.2);
                    color: #059669;
                }

                .dark .afm-banner-success {
                    background: rgba(16,185,129,0.07);
                    border-color: rgba(16,185,129,0.15);
                    color: #34d399;
                }

                /* ── Submit button ── */
                .afm-btn {
                    width: 100%;
                    margin-top: 20px;
                    padding: 14px;
                    border: none;
                    border-radius: 13px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .afm-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    box-shadow: 0 4px 16px rgba(16,185,129,0.28);
                }

                .dark .afm-btn {
                    background: linear-gradient(135deg, #10b981 0%, #047857 100%);
                    box-shadow: 0 4px 18px rgba(16,185,129,0.18);
                }

                /* Shimmer */
                .afm-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
                    transform: translateX(-100%);
                }

                .afm-btn:not(:disabled):hover::before {
                    transform: translateX(100%);
                    transition: transform 0.5s ease;
                }

                .afm-btn:not(:disabled):hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 22px rgba(16,185,129,0.32);
                }

                .afm-btn:not(:disabled):active {
                    transform: scale(0.97) translateY(0);
                }

                .afm-btn:disabled {
                    opacity: 0.48;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                /* Loading spinner */
                .afm-spin {
                    animation: afm-rotate 0.8s linear infinite;
                }

                @keyframes afm-rotate {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div className="afm-overlay">
                <div className="afm-backdrop" onClick={handleClose} />

                <div className="afm-card">
                    {/* Mobile drag pill */}
                    <span className="afm-pill" />

                    {/* Close */}
                    <button onClick={handleClose} className="afm-close" aria-label="Close">
                        <X className="w-4 h-4" />
                    </button>

                    {/* Header */}
                    <div className="afm-header">
                        <div className="afm-icon-wrap">
                            <UserPlus className="w-5 h-5 text-sp-green" strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="afm-title">Add Friend</h2>
                            <p className="afm-subtitle">Send a request by phone number</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label className="afm-label">Phone Number *</label>
                            <div className="afm-input-wrap">
                                <Phone className="afm-input-icon w-4 h-4" strokeWidth={1.5} />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="e.g. 9999988888"
                                    className="afm-input"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="afm-banner afm-banner-error">
                                <span>⚠</span>
                                <p style={{ margin: 0 }}>{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="afm-banner afm-banner-success">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <p style={{ margin: 0, fontWeight: 600 }}>{success}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !phoneNumber.trim()}
                            className="afm-btn"
                        >
                            {loading
                                ? <Loader2 className="w-4 h-4 afm-spin" />
                                : <UserPlus className="w-4 h-4" />
                            }
                            {loading ? "Sending..." : "Send Request"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}