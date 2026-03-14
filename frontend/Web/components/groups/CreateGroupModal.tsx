"use client";

import { useState } from "react";
import { X, Loader2, Copy, Check, Users, PartyPopper } from "lucide-react";
import { createGroupAction } from "@/lib/actions";
import type { Group } from "@/lib/api";

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: (group: Group) => void;
}

export default function CreateGroupModal({ open, onClose, onCreated }: Props) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [created, setCreated] = useState<Group | null>(null);
    const [copied, setCopied] = useState<"code" | "link" | null>(null);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError("");
        const res = await createGroupAction({ name: name.trim(), description: description.trim() });
        setLoading(false);
        if (res.success && res.data && !Array.isArray(res.data)) {
            setCreated(res.data);
            onCreated(res.data);
        } else {
            setError(res.message || "Something went wrong");
        }
    };

    const copyToClipboard = async (text: string, type: "code" | "link") => {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleClose = () => {
        setName("");
        setDescription("");
        setError("");
        setCreated(null);
        setCopied(null);
        onClose();
    };

    const joinLink = created
        ? `${window.location.origin}/groups/join?code=${created.groupCode}`
        : "";

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                /* ── Overlay ── */
                .cgm-overlay {
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

                .cgm-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                }

                /* ── Card ── */
                .cgm-card {
                    position: relative;
                    width: 100%;
                    max-width: 440px;
                    border-radius: 22px;
                    padding: 28px 24px;
                    z-index: 1;
                    animation: cgm-popIn 0.32s cubic-bezier(0.32,1.1,0.64,1) both;
                }

                @media (min-width: 640px) { .cgm-card { padding: 32px 28px; } }

                :root:not(.dark) .cgm-card {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 16px 48px rgba(15,23,42,0.14), 0 4px 16px rgba(15,23,42,0.06);
                }

                .dark .cgm-card {
                    background: #111827;
                    border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.55);
                }

                @keyframes cgm-popIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                /* ── Close button ── */
                .cgm-close {
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

                :root:not(.dark) .cgm-close { color: #94a3b8; }
                :root:not(.dark) .cgm-close:hover { background: #f1f5f9; color: #0f172a; }
                .dark .cgm-close { color: #475569; }
                .dark .cgm-close:hover { background: rgba(255,255,255,0.07); color: #f1f5f9; }

                /* ── Header ── */
                .cgm-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 24px;
                    padding-right: 32px;
                }

                .cgm-icon-wrap {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%);
                }

                .cgm-header-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 1.05rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin: 0 0 3px;
                }

                :root:not(.dark) .cgm-header-title { color: #0f172a; }
                .dark .cgm-header-title            { color: #f1f5f9; }

                .cgm-header-sub {
                    font-size: 0.8rem;
                    margin: 0;
                }

                :root:not(.dark) .cgm-header-sub { color: #94a3b8; }
                .dark .cgm-header-sub            { color: #475569; }

                /* ── Form ── */
                .cgm-form-group { margin-bottom: 16px; }
                .cgm-form-group:last-of-type { margin-bottom: 20px; }

                .cgm-label {
                    display: block;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }

                :root:not(.dark) .cgm-label { color: #475569; }
                .dark .cgm-label            { color: #64748b; }

                .cgm-input, .cgm-textarea {
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

                .cgm-textarea { resize: none; }

                :root:not(.dark) .cgm-input, :root:not(.dark) .cgm-textarea {
                    background: #f8fafc;
                    border-color: #e2e8f0;
                    color: #0f172a;
                }
                :root:not(.dark) .cgm-input::placeholder,
                :root:not(.dark) .cgm-textarea::placeholder { color: #cbd5e1; }
                :root:not(.dark) .cgm-input:focus,
                :root:not(.dark) .cgm-textarea:focus {
                    background: #fff;
                    border-color: #10b981;
                    box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
                }

                .dark .cgm-input, .dark .cgm-textarea {
                    background: rgba(255,255,255,0.04);
                    border-color: rgba(255,255,255,0.07);
                    color: #f1f5f9;
                }
                .dark .cgm-input::placeholder,
                .dark .cgm-textarea::placeholder { color: #334155; }
                .dark .cgm-input:focus,
                .dark .cgm-textarea:focus {
                    background: rgba(255,255,255,0.06);
                    border-color: #10b981;
                    box-shadow: 0 0 0 3px rgba(16,185,129,0.08);
                }

                /* ── Error ── */
                .cgm-error {
                    font-size: 0.8rem;
                    padding: 10px 12px;
                    border-radius: 10px;
                    margin-bottom: 16px;
                    background: rgba(239,68,68,0.07);
                    border: 1px solid rgba(239,68,68,0.18);
                    color: #ef4444;
                }

                .dark .cgm-error { color: #f87171; }

                /* ── Submit / Done button ── */
                .cgm-submit-btn {
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

                :root:not(.dark) .cgm-submit-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    box-shadow: 0 3px 12px rgba(16,185,129,0.28);
                }

                .dark .cgm-submit-btn {
                    background: linear-gradient(135deg, #10b981 0%, #047857 100%);
                    box-shadow: 0 3px 14px rgba(16,185,129,0.18);
                }

                .cgm-submit-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.14) 50%, transparent 60%);
                    transform: translateX(-100%);
                }

                .cgm-submit-btn:not(:disabled):hover::before { transform: translateX(100%); transition: transform 0.5s ease; }
                .cgm-submit-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(16,185,129,0.32); }
                .cgm-submit-btn:not(:disabled):active { transform: scale(0.97); }
                .cgm-submit-btn:disabled { opacity: 0.42; cursor: not-allowed; box-shadow: none; }

                /* ── Spin ── */
                .cgm-spin { animation: cgm-rotate 0.8s linear infinite; }
                @keyframes cgm-rotate { to { transform: rotate(360deg); } }

                /* ── Success view ── */
                .cgm-success {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding-right: 0;
                }

                .cgm-success-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                    background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%);
                }

                .cgm-success-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 1.1rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin: 0 0 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                :root:not(.dark) .cgm-success-title { color: #0f172a; }
                .dark .cgm-success-title            { color: #f1f5f9; }

                .cgm-success-sub {
                    font-size: 0.875rem;
                    margin: 0 0 24px;
                }

                :root:not(.dark) .cgm-success-sub { color: #64748b; }
                .dark .cgm-success-sub            { color: #475569; }

                /* Share boxes */
                .cgm-share-box {
                    width: 100%;
                    border-radius: 14px;
                    padding: 14px 16px;
                    text-align: left;
                    margin-bottom: 10px;
                }

                :root:not(.dark) .cgm-share-box { background: #f8fafc; border: 1.5px solid #e2e8f0; }
                .dark .cgm-share-box            { background: rgba(255,255,255,0.03); border: 1.5px solid rgba(255,255,255,0.07); }

                .cgm-share-label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.09em;
                    text-transform: uppercase;
                    display: block;
                    margin-bottom: 6px;
                }

                :root:not(.dark) .cgm-share-label { color: #94a3b8; }
                .dark .cgm-share-label            { color: #475569; }

                .cgm-share-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                }

                .cgm-code-text {
                    font-family: 'Sora', sans-serif;
                    font-size: 1.3rem;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                }

                :root:not(.dark) .cgm-code-text { color: #0f172a; }
                .dark .cgm-code-text            { color: #f1f5f9; }

                .cgm-link-text {
                    font-size: 0.78rem;
                    font-family: monospace;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                :root:not(.dark) .cgm-link-text { color: #64748b; }
                .dark .cgm-link-text            { color: #475569; }

                .cgm-copy-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 9px;
                    border: none;
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: background 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .cgm-copy-btn:hover { background: #e2e8f0; }
                .dark .cgm-copy-btn:hover            { background: rgba(255,255,255,0.08); }

                .cgm-done-gap { margin-bottom: 20px; width: 100%; }
            `}</style>

            <div className="cgm-overlay">
                <div className="cgm-backdrop" onClick={handleClose} />

                <div className="cgm-card">
                    {/* Close */}
                    <button onClick={handleClose} className="cgm-close" aria-label="Close">
                        <X className="w-4 h-4" />
                    </button>

                    {!created ? (
                        <>
                            {/* Header */}
                            <div className="cgm-header">
                                <div className="cgm-icon-wrap">
                                    <Users className="w-5 h-5" style={{ color: "#10b981" }} strokeWidth={1.8} />
                                </div>
                                <div>
                                    <h2 className="cgm-header-title">Create Group</h2>
                                    <p className="cgm-header-sub">Start splitting with your crew</p>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="cgm-form-group">
                                    <label className="cgm-label">Group Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Patiala Trip"
                                        className="cgm-input"
                                        maxLength={50}
                                        required
                                    />
                                </div>

                                <div className="cgm-form-group">
                                    <label className="cgm-label">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What's this group for?"
                                        rows={3}
                                        className="cgm-textarea"
                                        maxLength={200}
                                    />
                                </div>

                                {error && <div className="cgm-error">{error}</div>}

                                <button
                                    type="submit"
                                    disabled={loading || !name.trim()}
                                    className="cgm-submit-btn"
                                >
                                    {loading && <Loader2 className="w-4 h-4 cgm-spin" />}
                                    {loading ? "Creating…" : "Create Group"}
                                </button>
                            </form>
                        </>
                    ) : (
                        /* ── Success view ── */
                        <div className="cgm-success">
                            <div className="cgm-success-icon">
                                <Check className="w-7 h-7" style={{ color: "#10b981" }} />
                            </div>

                            <h2 className="cgm-success-title">
                                Group Created!
                                <PartyPopper className="w-5 h-5" style={{ color: "#f59e0b" }} />
                            </h2>
                            <p className="cgm-success-sub">
                                Share the code or link so friends can join.
                            </p>

                            {/* Group Code */}
                            <div className="cgm-share-box">
                                <span className="cgm-share-label">Group Code</span>
                                <div className="cgm-share-row">
                                    <span className="cgm-code-text">{created.groupCode}</span>
                                    <button
                                        onClick={() => copyToClipboard(created.groupCode, "code")}
                                        className="cgm-copy-btn"
                                        aria-label="Copy code"
                                    >
                                        {copied === "code"
                                            ? <Check className="w-4 h-4" style={{ color: "#10b981" }} />
                                            : <Copy className="w-4 h-4" style={{ color: "#94a3b8" }} />
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* Invite Link */}
                            <div className="cgm-share-box cgm-done-gap">
                                <span className="cgm-share-label">Invite Link</span>
                                <div className="cgm-share-row">
                                    <span className="cgm-link-text">{joinLink}</span>
                                    <button
                                        onClick={() => copyToClipboard(joinLink, "link")}
                                        className="cgm-copy-btn"
                                        aria-label="Copy link"
                                    >
                                        {copied === "link"
                                            ? <Check className="w-4 h-4" style={{ color: "#10b981" }} />
                                            : <Copy className="w-4 h-4" style={{ color: "#94a3b8" }} />
                                        }
                                    </button>
                                </div>
                            </div>

                            <button onClick={handleClose} className="cgm-submit-btn">
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}