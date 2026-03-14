"use client";

import { UserPlus, Users } from "lucide-react";

interface Props {
    onAddFriend: () => void;
}

export default function EmptyFriends({ onAddFriend }: Props) {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                .ef-wrapper {
                    font-family: 'DM Sans', sans-serif;
                    display: flex;
                    flex-col: column;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 64px 24px;
                    position: relative;
                    overflow: hidden;
                }

                /* ── Animated background orbs ── */
                .ef-orb {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    filter: blur(56px);
                    opacity: 0;
                    animation: ef-orbFloat 3s ease-out forwards;
                }

                .ef-orb-1 {
                    width: 220px;
                    height: 220px;
                    top: -40px;
                    left: -60px;
                    animation-delay: 0.1s;
                }

                .ef-orb-2 {
                    width: 160px;
                    height: 160px;
                    bottom: -30px;
                    right: -40px;
                    animation-delay: 0.25s;
                }

                /* Light theme orbs */
                :root:not(.dark) .ef-orb-1 { background: rgba(59, 130, 246, 0.12); }
                :root:not(.dark) .ef-orb-2 { background: rgba(16, 185, 129, 0.10); }

                /* Dark theme orbs */
                .dark .ef-orb-1 { background: rgba(59, 130, 246, 0.08); }
                .dark .ef-orb-2 { background: rgba(16, 185, 129, 0.07); }

                @keyframes ef-orbFloat {
                    to { opacity: 1; }
                }

                /* ── Icon container ── */
                .ef-icon-wrap {
                    position: relative;
                    width: 72px;
                    height: 72px;
                    border-radius: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    opacity: 0;
                    transform: translateY(16px) scale(0.9);
                    animation: ef-slideUp 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards;
                }

                /* Light theme icon */
                :root:not(.dark) .ef-icon-wrap {
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                    box-shadow: 0 2px 16px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.8);
                }

                /* Dark theme icon */
                .dark .ef-icon-wrap {
                    background: linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.10) 100%);
                    box-shadow: 0 2px 20px rgba(59, 130, 246, 0.12), inset 0 1px 0 rgba(255,255,255,0.06);
                }

                /* Pulse ring */
                .ef-icon-wrap::before {
                    content: '';
                    position: absolute;
                    inset: -6px;
                    border-radius: 28px;
                    border: 1.5px solid transparent;
                    animation: ef-pulse 2.8s ease-in-out 1s infinite;
                }

                :root:not(.dark) .ef-icon-wrap::before {
                    border-color: rgba(59, 130, 246, 0.25);
                }
                .dark .ef-icon-wrap::before {
                    border-color: rgba(59, 130, 246, 0.18);
                }

                @keyframes ef-pulse {
                    0%, 100% { opacity: 0; transform: scale(0.95); }
                    50% { opacity: 1; transform: scale(1.05); }
                }

                /* ── Dot grid decoration ── */
                .ef-dot-grid {
                    position: absolute;
                    top: 8px;
                    right: -10px;
                    width: 48px;
                    height: 48px;
                    opacity: 0;
                    animation: ef-fadeIn 0.5s ease 0.6s forwards;
                    background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
                    background-size: 8px 8px;
                }

                :root:not(.dark) .ef-dot-grid { color: rgba(59,130,246,0.2); }
                .dark .ef-dot-grid { color: rgba(59,130,246,0.15); }

                /* ── Typography ── */
                .ef-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 1.2rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin: 0 0 8px;
                    opacity: 0;
                    transform: translateY(12px);
                    animation: ef-slideUp 0.5s ease 0.28s forwards;
                }

                :root:not(.dark) .ef-title { color: #0f172a; }
                .dark .ef-title { color: #F3F4F6; }

                .ef-subtitle {
                    font-size: 0.875rem;
                    line-height: 1.6;
                    text-align: center;
                    max-width: 280px;
                    margin: 0 0 28px;
                    opacity: 0;
                    transform: translateY(12px);
                    animation: ef-slideUp 0.5s ease 0.38s forwards;
                }

                :root:not(.dark) .ef-subtitle { color: #64748b; }
                .dark .ef-subtitle { color: #9CA3AF; }

                /* ── CTA Button ── */
                .ef-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 14px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    color: #fff;
                    position: relative;
                    overflow: hidden;
                    opacity: 0;
                    transform: translateY(12px);
                    animation: ef-slideUp 0.5s ease 0.48s forwards;
                    transition: transform 0.18s ease, box-shadow 0.18s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                :root:not(.dark) .ef-btn {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
                }

                .dark .ef-btn {
                    background: linear-gradient(135deg, #10b981 0%, #047857 100%);
                    box-shadow: 0 4px 18px rgba(16, 185, 129, 0.2);
                }

                /* Shimmer sweep */
                .ef-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
                    transform: translateX(-100%);
                    transition: transform 0s;
                }

                .ef-btn:hover::before {
                    transform: translateX(100%);
                    transition: transform 0.5s ease;
                }

                .ef-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
                }

                .ef-btn:active {
                    transform: translateY(0px) scale(0.97);
                }

                /* ── Shared keyframes ── */
                @keyframes ef-slideUp {
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes ef-fadeIn {
                    to { opacity: 1; }
                }

                /* ── Mobile refinements ── */
                @media (max-width: 390px) {
                    .ef-wrapper { padding: 48px 20px; }
                    .ef-title { font-size: 1.1rem; }
                    .ef-btn { padding: 12px 20px; font-size: 0.875rem; }
                }

                @media (min-width: 640px) {
                    .ef-wrapper { padding: 96px 24px; }
                    .ef-icon-wrap { width: 80px; height: 80px; border-radius: 24px; }
                    .ef-title { font-size: 1.35rem; }
                }
            `}</style>

            <div className="ef-wrapper">
                {/* Background orbs */}
                <div className="ef-orb ef-orb-1" />
                <div className="ef-orb ef-orb-2" />

                {/* Icon */}
                <div className="ef-icon-wrap">
                    <div className="ef-dot-grid" />
                    <Users className="w-8 h-8 text-sp-blue" strokeWidth={1.4} />
                </div>

                {/* Text */}
                <h2 className="ef-title">No friends yet</h2>
                <p className="ef-subtitle">
                    Add friends by their phone number to start splitting expenses together.
                </p>

                {/* CTA */}
                <button onClick={onAddFriend} className="ef-btn">
                    <UserPlus className="w-4 h-4" />
                    Add Your First Friend
                </button>
            </div>
        </>
    );
}