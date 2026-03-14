"use client";

import { Users, PartyPopper, Sparkles } from "lucide-react";

export default function EmptyGroups() {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                .eg-wrap {
                    font-family: 'DM Sans', sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 64px 24px;
                    text-align: center;
                    animation: eg-fadeIn 0.35s ease both;
                }

                @media (min-width: 640px) { .eg-wrap { padding: 96px 24px; } }

                @keyframes eg-fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Icon cluster ── */
                .eg-icon-cluster {
                    position: relative;
                    margin-bottom: 22px;
                }

                .eg-icon-wrap {
                    width: 68px;
                    height: 68px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.07) 100%);
                }

                :root:not(.dark) .eg-icon-wrap { border: 1px solid rgba(16,185,129,0.15); }
                .dark .eg-icon-wrap            { border: 1px solid rgba(16,185,129,0.1); }

                /* Party popper badge */
                .eg-badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid;
                }

                :root:not(.dark) .eg-badge {
                    background: #fff;
                    border-color: #e2e8f0;
                    box-shadow: 0 2px 6px rgba(15,23,42,0.08);
                }

                .dark .eg-badge {
                    background: #1e293b;
                    border-color: rgba(255,255,255,0.08);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }

                /* ── Text ── */
                .eg-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 1.15rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin: 0 0 10px;
                }

                @media (min-width: 640px) { .eg-title { font-size: 1.3rem; } }

                :root:not(.dark) .eg-title { color: #0f172a; }
                .dark .eg-title            { color: #f1f5f9; }

                .eg-desc {
                    font-size: 0.875rem;
                    max-width: 300px;
                    margin: 0 0 14px;
                    line-height: 1.65;
                }

                :root:not(.dark) .eg-desc { color: #64748b; }
                .dark .eg-desc            { color: #9CA3AF; }

                .eg-hint {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 0.78rem;
                    margin: 0;
                }

                :root:not(.dark) .eg-hint { color: #94a3b8; }
                .dark .eg-hint            { color: #6B7280; }
            `}</style>

            <div className="eg-wrap">
                {/* Icon cluster */}
                <div className="eg-icon-cluster">
                    <div className="eg-icon-wrap">
                        <Users className="w-8 h-8" style={{ color: "#10b981" }} strokeWidth={1.5} />
                    </div>
                    <div className="eg-badge">
                        <PartyPopper className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} strokeWidth={2} />
                    </div>
                </div>

                {/* Text */}
                <h3 className="eg-title">No Groups Yet!</h3>
                <p className="eg-desc">
                    Looks like you&apos;re flying solo for now.<br />
                    Create a group to start splitting bills, or join one your friends already made!
                </p>
                <p className="eg-hint">
                    Splitting bills is way more fun with friends
                    <Sparkles className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
                </p>
            </div>
        </>
    );
}