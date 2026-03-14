"use client";

import { Mail, Phone, Calendar, ArrowUpRight } from "lucide-react";
import type { FriendUser } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Props {
    friend: FriendUser;
}

export default function FriendCard({ friend }: Props) {

    const router = useRouter();

    const joinDate = new Date(friend.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    const initials = friend.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    // Deterministic hue from name for avatar color variety
    const hue = friend.fullName
        .split("")
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                .fc-card {
                    font-family: 'DM Sans', sans-serif;
                    position: relative;
                    border-radius: 18px;
                    padding: 16px;
                    cursor: default;
                    overflow: hidden;
                    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1),
                                box-shadow 0.22s ease,
                                border-color 0.18s ease;
                    -webkit-tap-highlight-color: transparent;
                    animation: fc-fadeUp 0.4s ease both;
                }

                @keyframes fc-fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                :root:not(.dark) .fc-card {
                    background: #ffffff;
                    border: 1px solid #e9eef5;
                    box-shadow: 0 1px 4px rgba(15,23,42,0.05);
                }

                .dark .fc-card {
                    background: #111827;
                    border: 1px solid rgba(255,255,255,0.07);
                    box-shadow: 0 1px 6px rgba(0,0,0,0.3);
                }

                .fc-card:hover {
                    transform: translateY(-3px);
                }

                :root:not(.dark) .fc-card:hover {
                    border-color: #c7d7ed;
                    box-shadow: 0 8px 24px rgba(15,23,42,0.09);
                }

                .dark .fc-card:hover {
                    border-color: rgba(255,255,255,0.12);
                    box-shadow: 0 8px 28px rgba(0,0,0,0.45);
                }

                /* Subtle top-edge accent line on hover */
                .fc-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 10%; right: 10%;
                    height: 2px;
                    border-radius: 0 0 4px 4px;
                    opacity: 0;
                    transition: opacity 0.22s ease;
                    background: linear-gradient(90deg, transparent, var(--fc-accent), transparent);
                }

                .fc-card:hover::before { opacity: 1; }

                /* ── Avatar ── */
                .fc-avatar {
                    width: 46px;
                    height: 46px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    position: relative;
                    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
                }

                .fc-card:hover .fc-avatar {
                    transform: scale(1.08);
                }

                .fc-avatar-text {
                    font-family: 'Sora', sans-serif;
                    font-size: 0.85rem;
                    font-weight: 700;
                    letter-spacing: 0.01em;
                    position: relative;
                    z-index: 1;
                }

                /* ── Name ── */
                .fc-name {
                    font-family: 'Sora', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    margin: 0 0 10px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                :root:not(.dark) .fc-name { color: #0f172a; }
                .dark .fc-name            { color: #f1f5f9; }

                /* ── Meta rows ── */
                .fc-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .fc-row {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    min-width: 0;
                }

                .fc-row-icon {
                    flex-shrink: 0;
                    transition: color 0.15s ease;
                }

                :root:not(.dark) .fc-row-icon { color: #94a3b8; }
                .dark .fc-row-icon            { color: #9CA3AF; }

                .fc-card:hover .fc-row-icon {
                    color: var(--fc-accent) !important;
                }

                .fc-row-text {
                    font-size: 0.78rem;
                    line-height: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                :root:not(.dark) .fc-row-text { color: #64748b; }
                .dark .fc-row-text            { color: #9CA3AF; }

                .fc-row-text.mono {
                    font-family: 'DM Mono', 'Fira Mono', monospace;
                    letter-spacing: 0.02em;
                }

                /* ── Joined chip ── */
                .fc-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 3px 8px 3px 5px;
                    border-radius: 20px;
                    font-size: 0.73rem;
                    font-weight: 500;
                    width: fit-content;
                    transition: background 0.15s ease;
                }

                :root:not(.dark) .fc-chip {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .dark .fc-chip {
                    background: rgba(255,255,255,0.05);
                    color: #9CA3AF;
                }

                /* Mobile */
                @media (max-width: 390px) {
                    .fc-card { padding: 14px; border-radius: 16px; }
                    .fc-name { font-size: 0.9rem; }
                }
            `}</style>

            <div
                className="fc-card"
                style={{
                    "--fc-accent": `hsl(${hue}, 55%, 58%)`,
                } as React.CSSProperties}
            >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    {/* Avatar */}
                    <div
                        className="fc-avatar"
                        style={{
                            background: `linear-gradient(135deg, hsl(${hue},60%,92%) 0%, hsl(${hue},50%,84%) 100%)`,
                        }}
                    >
                        <span
                            className="fc-avatar-text"
                            style={{ color: `hsl(${hue}, 55%, 38%)` }}
                        >
                            {initials}
                        </span>
                    </div>

                    {/* Info */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 className="fc-name">{friend.fullName}</h3>

                        <div className="fc-meta">
                            <div className="fc-row">
                                <Mail className="fc-row-icon w-3 h-3" strokeWidth={1.5} />
                                <span className="fc-row-text">{friend.email}</span>
                            </div>

                            <div className="fc-row">
                                <Phone className="fc-row-icon w-3 h-3" strokeWidth={1.5} />
                                <span className="fc-row-text mono">{friend.phoneNumber}</span>
                            </div>

                            <div className="fc-chip">
                                <Calendar className="fc-row-icon w-3 h-3" strokeWidth={1.5} />
                                <span>Joined {joinDate}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() =>
                            router.push(`/transfers/send?userId=${friend.id}&returnTo=/friends`)
                        }
                        className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl
                            text-sm font-semibold text-white transition-all duration-150
                            active:scale-95 hover:opacity-90"
                        style={{
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            boxShadow: "0 2px 10px rgba(16,185,129,0.32)",
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
                        Pay
                    </button>
                </div>
            </div>
        </>
    );
}