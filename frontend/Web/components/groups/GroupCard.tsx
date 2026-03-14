"use client";

import { Users, Copy, Check, Crown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Group } from "@/lib/api";

export default function GroupCard({ group, isAdmin = false }: { group: Group; isAdmin?: boolean }) {
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    const copyToClipboard = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(group.groupCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                /* ── Card ── */
                .gc-card {
                    font-family: 'DM Sans', sans-serif;
                    border-radius: 18px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    min-height: 176px;
                    cursor: pointer;
                    border: 1.5px solid;
                    transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
                    -webkit-tap-highlight-color: transparent;
                    animation: gc-fadeIn 0.3s ease both;
                }

                @media (min-width: 640px) { .gc-card { padding: 22px 24px; } }

                @keyframes gc-fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                :root:not(.dark) .gc-card {
                    background: #fff;
                    border-color: #e2e8f0;
                    box-shadow: 0 1px 4px rgba(15,23,42,0.04);
                }

                :root:not(.dark) .gc-card:hover {
                    border-color: rgba(16,185,129,0.3);
                    transform: translateY(-3px);
                    box-shadow: 0 8px 24px rgba(16,185,129,0.1), 0 2px 8px rgba(15,23,42,0.06);
                }

                .dark .gc-card {
                    background: #111827;
                    border-color: rgba(255,255,255,0.07);
                }

                .dark .gc-card:hover {
                    border-color: rgba(16,185,129,0.22);
                    transform: translateY(-3px);
                    box-shadow: 0 8px 28px rgba(16,185,129,0.08);
                }

                /* ── Card header ── */
                .gc-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }

                .gc-header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 0;
                }

                /* Icon */
                .gc-icon-wrap {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    background: linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.07) 100%);
                    transition: background 0.2s ease;
                }

                .gc-card:hover .gc-icon-wrap {
                    background: linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.12) 100%);
                }

                /* Group name */
                .gc-name {
                    font-family: 'Sora', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 700;
                    letter-spacing: -0.015em;
                    margin: 0 0 3px;
                    line-height: 1.25;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                @media (min-width: 640px) { .gc-name { font-size: 0.975rem; } }

                :root:not(.dark) .gc-name { color: #0f172a; }
                .dark .gc-name            { color: #f1f5f9; }

                /* Creator */
                .gc-creator {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .gc-creator-text {
                    font-size: 0.7rem;
                }

                :root:not(.dark) .gc-creator-text { color: #94a3b8; }
                .dark .gc-creator-text            { color: #6B7280; }

                /* Description */
                .gc-desc {
                    font-size: 0.8rem;
                    line-height: 1.6;
                    margin: 0 0 auto;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                :root:not(.dark) .gc-desc { color: #64748b; }
                .dark .gc-desc            { color: #9CA3AF; }

                /* ── Admin footer ── */
                .gc-footer {
                    margin-top: 14px;
                    padding-top: 12px;
                    border-top: 1px solid;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                :root:not(.dark) .gc-footer { border-color: #f1f5f9; }
                .dark .gc-footer            { border-color: rgba(255,255,255,0.05); }

                .gc-code-wrap {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .gc-code-label {
                    font-size: 0.6rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }

                :root:not(.dark) .gc-code-label { color: #94a3b8; }
                .dark .gc-code-label            { color: #9CA3AF; }

                .gc-code-badge {
                    font-family: 'Sora', sans-serif;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    padding: 3px 8px;
                    border-radius: 7px;
                }

                :root:not(.dark) .gc-code-badge {
                    background: rgba(16,185,129,0.1);
                    color: #059669;
                }

                .dark .gc-code-badge {
                    background: rgba(16,185,129,0.1);
                    color: #34d399;
                }

                /* Copy button */
                .gc-copy-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
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

                :root:not(.dark) .gc-copy-btn:hover { background: #f1f5f9; }
                .dark .gc-copy-btn:hover            { background: rgba(255,255,255,0.07); }

                /* Admin crown badge */
                .gc-admin-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    padding: 3px 8px;
                    border-radius: 6px;
                    flex-shrink: 0;
                }

                :root:not(.dark) .gc-admin-badge {
                    background: rgba(245,158,11,0.1);
                    color: #d97706;
                }

                .dark .gc-admin-badge {
                    background: rgba(245,158,11,0.08);
                    color: #fbbf24;
                }
            `}</style>

            <div onClick={() => router.push(`/groups/${group.id}`)} className="gc-card">
                {/* Header */}
                <div className="gc-header">
                    <div className="gc-header-left">
                        <div className="gc-icon-wrap">
                            <Users className="w-5 h-5" style={{ color: "#10b981" }} strokeWidth={1.8} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h3 className="gc-name">{group.name}</h3>
                            <div className="gc-creator">
                                <Crown className="w-3 h-3" style={{ color: "#94a3b8" }} />
                                <span className="gc-creator-text">{group.createdByName}</span>
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="gc-admin-badge">
                            <Crown className="w-3 h-3" />
                            Admin
                        </div>
                    )}
                </div>

                {/* Description */}
                {group.description && (
                    <p className="gc-desc">{group.description}</p>
                )}

                {/* Admin footer — group code */}
                {isAdmin && (
                    <div className="gc-footer">
                        <div className="gc-code-wrap">
                            <span className="gc-code-label">Code</span>
                            <span className="gc-code-badge">{group.groupCode}</span>
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="gc-copy-btn"
                            title="Copy group code"
                        >
                            {copied
                                ? <Check className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                                : <Copy className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
                            }
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}