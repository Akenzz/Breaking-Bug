"use client";

import { Check, X, Loader2, Clock } from "lucide-react";
import { useState } from "react";
import { acceptFriendRequestAction, rejectFriendRequestAction } from "@/lib/actions";
import type { FriendRequest } from "@/lib/api";

interface Props {
    request: FriendRequest;
    onHandled: () => void;
}

export default function PendingRequestCard({ request, onHandled }: Props) {
    const [accepting, setAccepting] = useState(false);
    const [rejecting, setRejecting] = useState(false);

    const busy = accepting || rejecting;

    const requesterName = request.requesterName ?? "Unknown";
    const requesterPhone = request.requesterPhone ?? "";

    const initials = requesterName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

    const hue = requesterName
        .split("")
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360;

    const timeAgo = (() => {
        const diff = Date.now() - new Date(request.createdAt).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    })();

    const handleAccept = async () => {
        setAccepting(true);
        const res = await acceptFriendRequestAction(request.requestId);
        setAccepting(false);
        if (res.success) onHandled();
    };

    const handleReject = async () => {
        setRejecting(true);
        const res = await rejectFriendRequestAction(request.requestId);
        setRejecting(false);
        if (res.success) onHandled();
    };

    return (
        <div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                .prc-card {
                    font-family: 'DM Sans', sans-serif;
                    position: relative;
                    border-radius: 18px;
                    padding: 16px;
                    overflow: hidden;
                    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1),
                                box-shadow 0.22s ease,
                                border-color 0.18s ease;
                    animation: prc-fadeUp 0.4s ease both;
                    -webkit-tap-highlight-color: transparent;
                }

                @keyframes prc-fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                :root:not(.dark) .prc-card {
                    background: #ffffff;
                    border: 1px solid #e9eef5;
                    box-shadow: 0 1px 4px rgba(15,23,42,0.05);
                }

                .dark .prc-card {
                    background: #111827;
                    border: 1px solid rgba(255,255,255,0.07);
                    box-shadow: 0 1px 6px rgba(0,0,0,0.3);
                }

                .prc-card:hover {
                    transform: translateY(-2px);
                }

                :root:not(.dark) .prc-card:hover {
                    border-color: #c7d7ed;
                    box-shadow: 0 6px 20px rgba(15,23,42,0.08);
                }

                .dark .prc-card:hover {
                    border-color: rgba(255,255,255,0.11);
                    box-shadow: 0 6px 24px rgba(0,0,0,0.4);
                }

                /* Amber left-edge indicator */
                .prc-card::after {
                    content: '';
                    position: absolute;
                    left: 0; top: 12px; bottom: 12px;
                    width: 3px;
                    border-radius: 0 3px 3px 0;
                    background: linear-gradient(180deg, #f59e0b, #d97706);
                    opacity: 0.7;
                }

                /* ── Layout ── */
                .prc-inner {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                /* ── Avatar ── */
                .prc-avatar {
                    width: 46px;
                    height: 46px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
                }

                .prc-card:hover .prc-avatar {
                    transform: scale(1.07);
                }

                .prc-avatar-text {
                    font-family: 'Sora', sans-serif;
                    font-size: 0.85rem;
                    font-weight: 700;
                }

                /* ── Info ── */
                .prc-info {
                    min-width: 0;
                    flex: 1;
                }

                .prc-name-row {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    flex-wrap: wrap;
                }

                .prc-name {
                    font-family: 'Sora', sans-serif;
                    font-size: 0.92rem;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 130px;
                }

                :root:not(.dark) .prc-name { color: #0f172a; }
                .dark .prc-name            { color: #f1f5f9; }

                /* Pending badge */
                .prc-badge {
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    padding: 2px 7px;
                    border-radius: 20px;
                    flex-shrink: 0;
                    white-space: nowrap;
                }

                :root:not(.dark) .prc-badge {
                    color: #b45309;
                    background: #fef3c7;
                    border: 1px solid #fcd34d;
                }

                .dark .prc-badge {
                    color: #fbbf24;
                    background: rgba(245,158,11,0.1);
                    border: 1px solid rgba(245,158,11,0.2);
                }

                .prc-email {
                    font-size: 0.77rem;
                    margin: 3px 0 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                :root:not(.dark) .prc-email { color: #94a3b8; }
                .dark .prc-email            { color: #9CA3AF; }

                .prc-time {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 4px;
                }

                .prc-time-icon { flex-shrink: 0; }
                :root:not(.dark) .prc-time-icon { color: #cbd5e1; }
                .dark .prc-time-icon            { color: #6B7280; }

                .prc-time-text {
                    font-size: 0.72rem;
                }

                :root:not(.dark) .prc-time-text { color: #94a3b8; }
                .dark .prc-time-text            { color: #9CA3AF; }

                /* ── Action buttons ── */
                .prc-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-shrink: 0;
                }

                .prc-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 11px;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1),
                                background 0.15s ease,
                                box-shadow 0.15s ease;
                    position: relative;
                    overflow: hidden;
                    -webkit-tap-highlight-color: transparent;
                }

                .prc-btn:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                    transform: none !important;
                }

                .prc-btn:not(:disabled):active {
                    transform: scale(0.9) !important;
                }

                /* Reject */
                .prc-btn-reject {
                    background: transparent;
                    border: 1.5px solid transparent;
                }

                :root:not(.dark) .prc-btn-reject {
                    color: #94a3b8;
                    border-color: #e2e8f0;
                }

                :root:not(.dark) .prc-btn-reject:not(:disabled):hover {
                    background: #fff1f2;
                    border-color: #fca5a5;
                    color: #ef4444;
                    transform: scale(1.1);
                    box-shadow: 0 2px 10px rgba(239,68,68,0.12);
                }

                .dark .prc-btn-reject {
                    color: #475569;
                    border-color: rgba(255,255,255,0.07);
                }

                .dark .prc-btn-reject:not(:disabled):hover {
                    background: rgba(239,68,68,0.1);
                    border-color: rgba(239,68,68,0.25);
                    color: #f87171;
                    transform: scale(1.1);
                    box-shadow: 0 2px 10px rgba(239,68,68,0.1);
                }

                /* Accept */
                .prc-btn-accept {
                    border: none;
                }

                :root:not(.dark) .prc-btn-accept {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: #fff;
                    box-shadow: 0 3px 10px rgba(16,185,129,0.25);
                }

                :root:not(.dark) .prc-btn-accept:not(:disabled):hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 14px rgba(16,185,129,0.35);
                }

                .dark .prc-btn-accept {
                    background: linear-gradient(135deg, #10b981, #047857);
                    color: #fff;
                    box-shadow: 0 3px 10px rgba(16,185,129,0.15);
                }

                .dark .prc-btn-accept:not(:disabled):hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 14px rgba(16,185,129,0.22);
                }

                /* Spinner */
                .prc-spin {
                    animation: prc-rotate 0.8s linear infinite;
                }

                @keyframes prc-rotate {
                    to { transform: rotate(360deg); }
                }

                /* Mobile */
                @media (max-width: 390px) {
                    .prc-card { padding: 14px 12px; border-radius: 16px; }
                    .prc-name { max-width: 100px; }
                    .prc-btn  { width: 32px; height: 32px; border-radius: 9px; }
                }
            `}</style>

            <div className="prc-card">
                <div className="prc-inner">
                    {/* Avatar */}
                    <div
                        className="prc-avatar"
                        style={{
                            background: `linear-gradient(135deg, hsl(${hue},60%,92%) 0%, hsl(${hue},50%,84%) 100%)`,
                        }}
                    >
                        <span
                            className="prc-avatar-text"
                            style={{ color: `hsl(${hue}, 55%, 38%)` }}
                        >
                            {initials}
                        </span>
                    </div>

                    {/* Info */}
                    <div className="prc-info">
                        <div className="prc-name-row">
                            <h3 className="prc-name">{requesterName}</h3>
                            <span className="prc-badge">Pending</span>
                        </div>
                        <p className="prc-email">{requesterPhone}</p>
                        <div className="prc-time">
                            <Clock className="prc-time-icon w-3 h-3" strokeWidth={1.5} />
                            <span className="prc-time-text">{timeAgo}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="prc-actions">
                        <button
                            onClick={handleReject}
                            disabled={busy}
                            className="prc-btn prc-btn-reject"
                            title="Reject"
                        >
                            {rejecting
                                ? <Loader2 className="w-4 h-4 prc-spin" />
                                : <X className="w-4 h-4" />
                            }
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={busy}
                            className="prc-btn prc-btn-accept"
                            title="Accept"
                        >
                            {accepting
                                ? <Loader2 className="w-4 h-4 prc-spin" />
                                : <Check className="w-4 h-4" />
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}