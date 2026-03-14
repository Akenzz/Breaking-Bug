"use client";

import { useState } from "react";
import { User, Crown, Loader2, Users, UserPlus, X } from "lucide-react";
import type { GroupMember } from "@/lib/api";
import { addMemberToGroupAction, sendFriendRequestAction } from "@/lib/actions";

interface Props {
    members: GroupMember[];
    creatorIdentifier: string;
    loading?: boolean;
    groupId: number;
    fetchMembers: () => Promise<void>;
    isAdmin?: boolean;
    currentUserId: number | null;
}

    export default function MembersPanel({
        members,
        creatorIdentifier,
        loading = false,
        groupId,
        fetchMembers,
        isAdmin = false,
        currentUserId,
    }: Props) {
        const [identifierInput, setIdentifierInput] = useState("");
        const [adding, setAdding] = useState(false);
        const [error, setError] = useState("");
        const [showInput, setShowInput] = useState(false);
        const [sendingFriendReq, setSendingFriendReq] = useState<number | null>(null);
        const [friendReqSent, setFriendReqSent] = useState<Set<number>>(new Set());
        const [friendReqError, setFriendReqError] = useState<string | null>(null);

        const handleAddMember = async () => {
            if (!identifierInput.trim()) return;

            setAdding(true);
            setError("");

            const res = await addMemberToGroupAction(
                groupId,
                identifierInput.trim()
            );

            setAdding(false);

            if (res.success) {
                await fetchMembers();
                setIdentifierInput("");
                setShowInput(false);
            } else {
                setError(res.message || "Failed to add member");
            }
        };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleAddMember();
        if (e.key === "Escape") { setShowInput(false); setIdentifierInput(""); setError(""); }
    };

    const handleCancelInput = () => {
        setShowInput(false);
        setIdentifierInput("");
        setError("");
    };

    const handleSendFriendRequest = async (member: GroupMember) => {
        setSendingFriendReq(member.userId);
        setFriendReqError(null);
        const res = await sendFriendRequestAction(member.identifier);
        setSendingFriendReq(null);
        if (res.success) {
            setFriendReqSent((prev) => new Set(prev).add(member.userId));
        } else {
            setFriendReqError(res.message || "Failed to send request");
            setTimeout(() => setFriendReqError(null), 3000);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                .mp-wrap {
                    font-family: 'DM Sans', sans-serif;
                    border-radius: 16px;
                    overflow: hidden;
                    animation: mp-fadeIn 0.3s ease both;
                }

                @keyframes mp-fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                :root:not(.dark) .mp-wrap {
                    border: 1px solid #e2e8f0;
                    background: #fff;
                    box-shadow: 0 1px 4px rgba(15,23,42,0.04);
                }

                .dark .mp-wrap {
                    border: 1px solid rgba(255,255,255,0.07);
                    background: #111827;
                }

                /* ── Header ── */
                .mp-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid;
                }

                :root:not(.dark) .mp-header { border-color: #f1f5f9; }
                .dark .mp-header            { border-color: rgba(255,255,255,0.05); }

                .mp-header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .mp-header-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    margin: 0;
                }

                :root:not(.dark) .mp-header-title { color: #0f172a; }
                .dark .mp-header-title            { color: #f1f5f9; }

                .mp-header-right {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .mp-count {
                    font-family: monospace;
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 2px 7px;
                    border-radius: 6px;
                }

                :root:not(.dark) .mp-count { background: #f1f5f9; color: #94a3b8; }
                .dark .mp-count            { background: rgba(255,255,255,0.05); color: #475569; }

                /* ── Add button (enlarged and repositioned) ── */
                .mp-add-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border-radius: 10px;
                    border: 1.5px solid;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    cursor: pointer;
                    background: transparent;
                    transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .mp-add-btn { border-color: rgba(16,185,129,0.3); color: #059669; }
                :root:not(.dark) .mp-add-btn:hover { background: rgba(16,185,129,0.07); border-color: rgba(16,185,129,0.5); }
                .dark .mp-add-btn { border-color: rgba(16,185,129,0.2); color: #34d399; }
                .dark .mp-add-btn:hover { background: rgba(16,185,129,0.06); border-color: rgba(16,185,129,0.35); }
                .mp-add-btn:active { transform: scale(0.96); }

                /* ── Input row ── */
                .mp-input-row {
                    padding: 14px 20px;
                    border-bottom: 1px solid;
                    animation: mp-slideDown 0.22s cubic-bezier(0.32,1.1,0.64,1) both;
                }

                @keyframes mp-slideDown {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                :root:not(.dark) .mp-input-row { border-color: #f1f5f9; background: #fafcff; }
                .dark .mp-input-row            { border-color: rgba(255,255,255,0.05); background: rgba(16,185,129,0.02); }

                .mp-input-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                    display: block;
                    margin-bottom: 8px;
                }

                :root:not(.dark) .mp-input-label { color: #94a3b8; }
                .dark .mp-input-label            { color: #475569; }

                .mp-input-group {
                    display: flex;
                    gap: 8px;
                }

                .mp-text-input {
                    flex: 1;
                    padding: 10px 12px;
                    border-radius: 10px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.875rem;
                    border: 1.5px solid transparent;
                    outline: none;
                    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
                    box-sizing: border-box;
                }

                :root:not(.dark) .mp-text-input { background: #f8fafc; border-color: #e2e8f0; color: #0f172a; }
                :root:not(.dark) .mp-text-input::placeholder { color: #cbd5e1; }
                :root:not(.dark) .mp-text-input:focus { background: #fff; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
                .dark .mp-text-input { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.07); color: #f1f5f9; }
                .dark .mp-text-input::placeholder { color: #334155; }
                .dark .mp-text-input:focus { background: rgba(255,255,255,0.06); border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.08); }
                .mp-text-input:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Confirm button */
                .mp-confirm-btn {
                    padding: 10px 14px;
                    border-radius: 10px;
                    border: none;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    flex-shrink: 0;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, opacity 0.18s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .mp-confirm-btn { background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 2px 8px rgba(16,185,129,0.28); }
                .dark .mp-confirm-btn            { background: linear-gradient(135deg, #10b981 0%, #047857 100%); box-shadow: 0 2px 8px rgba(16,185,129,0.18); }
                .mp-confirm-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(16,185,129,0.32); }
                .mp-confirm-btn:not(:disabled):active { transform: scale(0.96); }
                .mp-confirm-btn:disabled { opacity: 0.42; cursor: not-allowed; box-shadow: none; }

                /* Cancel button */
                .mp-cancel-btn {
                    width: 38px;
                    height: 38px;
                    border-radius: 9px;
                    border: 1.5px solid;
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: background 0.15s ease, color 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .mp-cancel-btn { border-color: #e2e8f0; color: #94a3b8; }
                :root:not(.dark) .mp-cancel-btn:hover { background: #f1f5f9; color: #475569; }
                .dark .mp-cancel-btn { border-color: rgba(255,255,255,0.08); color: #475569; }
                .dark .mp-cancel-btn:hover { background: rgba(255,255,255,0.05); color: #94a3b8; }

                /* Error */
                .mp-error {
                    font-size: 0.75rem;
                    margin-top: 8px;
                    padding: 7px 10px;
                    border-radius: 8px;
                    background: rgba(239,68,68,0.07);
                    border: 1px solid rgba(239,68,68,0.18);
                    color: #ef4444;
                }

                .dark .mp-error { color: #f87171; }

                /* ── Loader ── */
                .mp-loader {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 0;
                }

                .mp-spin { animation: mp-rotate 0.8s linear infinite; }
                @keyframes mp-rotate { to { transform: rotate(360deg); } }

                /* ── Member row ── */
                .mp-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 13px 20px;
                    border-bottom: 1px solid;
                    transition: background 0.13s ease;
                }

                :root:not(.dark) .mp-row { border-color: #f8fafc; }
                .dark .mp-row            { border-color: rgba(255,255,255,0.03); }
                .mp-row:last-child { border-bottom: none; }

                :root:not(.dark) .mp-row:hover { background: #fafafa; }
                .dark .mp-row:hover            { background: rgba(255,255,255,0.02); }

                .mp-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .mp-avatar.admin {
                    background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%);
                }

                :root:not(.dark) .mp-avatar:not(.admin) { background: #f1f5f9; }
                .dark .mp-avatar:not(.admin)            { background: rgba(255,255,255,0.05); }

                .mp-info { flex: 1; min-width: 0; }

                .mp-name-row {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    margin-bottom: 2px;
                }

                .mp-name {
                    font-size: 0.875rem;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                :root:not(.dark) .mp-name { color: #0f172a; }
                .dark .mp-name            { color: #f1f5f9; }

                .mp-admin-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    font-size: 0.6rem;
                    font-weight: 700;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                    padding: 2px 6px;
                    border-radius: 5px;
                    border: 1px solid;
                    flex-shrink: 0;
                }

                :root:not(.dark) .mp-admin-badge { color: #059669; border-color: rgba(16,185,129,0.25); background: rgba(16,185,129,0.07); }
                .dark .mp-admin-badge            { color: #34d399; border-color: rgba(16,185,129,0.2); background: rgba(16,185,129,0.06); }

                .mp-identifier {
                    font-size: 0.72rem;
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                :root:not(.dark) .mp-identifier { color: #94a3b8; }
                .dark .mp-identifier            { color: #475569; }

                /* ── Add Friend button ── */
                .mp-friend-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 5px 10px;
                    border-radius: 8px;
                    border: 1.5px solid;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.7rem;
                    font-weight: 600;
                    cursor: pointer;
                    background: transparent;
                    flex-shrink: 0;
                    transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .mp-friend-btn { border-color: rgba(59,130,246,0.3); color: #3b82f6; }
                :root:not(.dark) .mp-friend-btn:hover { background: rgba(59,130,246,0.07); border-color: rgba(59,130,246,0.5); }
                .dark .mp-friend-btn { border-color: rgba(59,130,246,0.2); color: #60a5fa; }
                .dark .mp-friend-btn:hover { background: rgba(59,130,246,0.07); border-color: rgba(59,130,246,0.35); }
                .mp-friend-btn:active { transform: scale(0.96); }
                .mp-friend-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .mp-friend-sent {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 5px 10px;
                    border-radius: 8px;
                    font-size: 0.68rem;
                    font-weight: 600;
                    border: 1px solid;
                }

                :root:not(.dark) .mp-friend-sent { border-color: rgba(16,185,129,0.25); color: #059669; background: rgba(16,185,129,0.05); }
                .dark .mp-friend-sent            { border-color: rgba(16,185,129,0.2); color: #34d399; background: rgba(16,185,129,0.05); }

                .mp-friend-error {
                    font-size: 0.72rem;
                    padding: 6px 12px;
                    border-radius: 8px;
                    background: rgba(239,68,68,0.07);
                    border: 1px solid rgba(239,68,68,0.18);
                    color: #ef4444;
                    text-align: center;
                    margin: 0 20px;
                    animation: mp-fadeIn 0.2s ease both;
                }

                .dark .mp-friend-error { color: #f87171; }
            `}</style>

            <div className="mp-wrap">
                {/* Header */}
                <div className="mp-header">
                    <div className="mp-header-left">
                        <Users className="w-4 h-4" style={{ color: "#10b981" }} strokeWidth={1.8} />
                        <h3 className="mp-header-title">Members</h3>
                        {isAdmin && !showInput && (
                            <button
                                onClick={() => { setShowInput(true); setError(""); }}
                                className="mp-add-btn"
                            >
                                <UserPlus style={{ width: 15, height: 15 }} strokeWidth={2.2} />
                                Add
                            </button>
                        )}
                    </div>
                    <div className="mp-header-right">
                        {!loading && <span className="mp-count">{members.length}</span>}
                    </div>
                </div>

                {/* Add member input — admin only, toggled */}
                {isAdmin && showInput && (
                    <div className="mp-input-row">
                        <span className="mp-input-label">Email or username</span>
                        <div className="mp-input-group">
                            <input
                                type="text"
                                value={identifierInput}
                                onChange={(e) => setIdentifierInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="name@email.com"
                                className="mp-text-input"
                                autoFocus
                                disabled={adding}
                            />
                            <button
                                onClick={handleAddMember}
                                disabled={adding || !identifierInput.trim()}
                                className="mp-confirm-btn"
                            >
                                {adding
                                    ? <Loader2 className="w-3.5 h-3.5 mp-spin" />
                                    : <UserPlus style={{ width: 14, height: 14 }} strokeWidth={2} />
                                }
                                {adding ? "Adding…" : "Add"}
                            </button>
                            <button
                                onClick={handleCancelInput}
                                className="mp-cancel-btn"
                                aria-label="Cancel"
                            >
                                <X style={{ width: 14, height: 14 }} />
                            </button>
                        </div>
                        {error && <div className="mp-error">{error}</div>}
                    </div>
                )}

                {/* Member list */}
                {loading ? (
                    <div className="mp-loader">
                        <Loader2 className="w-5 h-5 mp-spin" style={{ color: "#10b981" }} />
                    </div>
                ) : (
                    <div>
                        {friendReqError && <div className="mp-friend-error">{friendReqError}</div>}
                        {members.map((m) => {
                            const isAdminMember = m.role === "ADMIN";
                            const isCurrentUser = m.userId === currentUserId;
                            const alreadySent = friendReqSent.has(m.userId);
                            const showAddFriend = !m.friend && !isCurrentUser;
                            return (
                                <div key={m.userId} className="mp-row">
                                    <div className={`mp-avatar${isAdminMember ? " admin" : ""}`}>
                                        <User
                                            className="w-4 h-4"
                                            style={{ color: isAdminMember ? "#10b981" : "#94a3b8" }}
                                            strokeWidth={1.8}
                                        />
                                    </div>
                                    <div className="mp-info">
                                        <div className="mp-name-row">
                                            <span className="mp-name">{m.fullName}</span>
                                            {isAdminMember && (
                                                <span className="mp-admin-badge">
                                                    <Crown style={{ width: 8, height: 8 }} />
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                        <span className="mp-identifier">{m.identifier}</span>
                                    </div>
                                    {showAddFriend && (
                                        alreadySent ? (
                                            <span className="mp-friend-sent">✓ Sent</span>
                                        ) : (
                                            <button
                                                onClick={() => handleSendFriendRequest(m)}
                                                disabled={sendingFriendReq === m.userId}
                                                className="mp-friend-btn"
                                            >
                                                {sendingFriendReq === m.userId
                                                    ? <Loader2 className="w-3 h-3 mp-spin" />
                                                    : <UserPlus style={{ width: 12, height: 12 }} strokeWidth={2} />
                                                }
                                                Add Friend
                                            </button>
                                        )
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}