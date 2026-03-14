"use client";

import { useState } from "react";
import {
    ChevronDown, ChevronUp, Trash2, Calendar, Store, Tag,
    UtensilsCrossed, Plane, ShoppingBag, Clapperboard,
    HeartPulse, GraduationCap, Lightbulb, Package,
} from "lucide-react";
import type { CategoryGroup, BillResult } from "@/lib/bills";
import { formatCurrency, getCategoryStyle } from "@/lib/bills";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
    UtensilsCrossed, Plane, ShoppingBag, Clapperboard, HeartPulse, GraduationCap, Lightbulb, Package,
};

interface Props { group: CategoryGroup; onRemoveBill?: (fileHash: string) => void; }

export default function CategoryCard({ group, onRemoveBill }: Props) {
    const [expanded, setExpanded] = useState(true);
    const style = getCategoryStyle(group.category);
    const Icon = ICON_MAP[style.iconName] || Package;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                .cc-card {
                    font-family: 'DM Sans', sans-serif;
                    border-radius: 18px;
                    overflow: hidden;
                    transition: box-shadow 0.2s ease, border-color 0.2s ease;
                    animation: cc-fadeUp 0.38s ease both;
                }

                @keyframes cc-fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                :root:not(.dark) .cc-card {
                    background: #ffffff;
                    border: 1px solid #e9eef5;
                    box-shadow: 0 1px 4px rgba(15,23,42,0.05);
                }
                .dark .cc-card {
                    background: #111827;
                    border: 1px solid rgba(255,255,255,0.07);
                    box-shadow: 0 1px 6px rgba(0,0,0,0.3);
                }
                :root:not(.dark) .cc-card:hover {
                    border-color: #c7d7ed;
                    box-shadow: 0 4px 16px rgba(15,23,42,0.08);
                }
                .dark .cc-card:hover {
                    border-color: rgba(255,255,255,0.11);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                }

                /* ── Header button ── */
                .cc-header {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                    transition: background 0.15s ease;
                }
                @media (min-width: 640px) { .cc-header { padding: 16px 20px; } }
                :root:not(.dark) .cc-header:hover { background: #f8fafc; }
                .dark .cc-header:hover            { background: rgba(255,255,255,0.03); }

                .cc-header-left  { display: flex; align-items: center; gap: 12px; }
                .cc-header-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

                /* Icon wrap */
                .cc-icon-wrap {
                    width: 38px;
                    height: 38px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
                }
                .cc-card:hover .cc-icon-wrap { transform: scale(1.08); }

                .cc-cat-name {
                    font-family: 'Sora', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    margin: 0 0 1px;
                    text-align: left;
                }
                :root:not(.dark) .cc-cat-name { color: #0f172a; }
                .dark .cc-cat-name            { color: #f1f5f9; }

                .cc-bill-count {
                    font-size: 0.72rem;
                    text-align: left;
                    margin: 0;
                }
                :root:not(.dark) .cc-bill-count { color: #94a3b8; }
                .dark .cc-bill-count            { color: #9CA3AF; }

                .cc-total {
                    font-family: 'Sora', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }

                .cc-chevron {
                    transition: transform 0.25s cubic-bezier(0.34,1.2,0.64,1);
                    flex-shrink: 0;
                }
                .cc-chevron.open { transform: rotate(180deg); }
                :root:not(.dark) .cc-chevron { color: #cbd5e1; }
                .dark .cc-chevron            { color: #9CA3AF; }

                /* ── Expanded body ── */
                .cc-body {
                    animation: cc-slideDown 0.28s cubic-bezier(0.4,0,0.2,1) both;
                    overflow: hidden;
                }
                @keyframes cc-slideDown {
                    from { opacity: 0; max-height: 0; }
                    to   { opacity: 1; max-height: 9999px; }
                }

                :root:not(.dark) .cc-body { border-top: 1px solid #f1f5f9; }
                .dark .cc-body            { border-top: 1px solid rgba(255,255,255,0.06); }

                /* ── Bill row ── */
                .cc-bill-row {
                    transition: background 0.12s ease;
                }
                :root:not(.dark) .cc-bill-row:not(:last-child) { border-bottom: 1px solid #f8fafc; }
                .dark .cc-bill-row:not(:last-child)             { border-bottom: 1px solid rgba(255,255,255,0.04); }

                .cc-bill-inner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 11px 16px;
                    transition: background 0.12s ease;
                }
                @media (min-width: 640px) { .cc-bill-inner { padding: 12px 20px; } }
                :root:not(.dark) .cc-bill-inner:hover { background: #f8fafc; }
                .dark .cc-bill-inner:hover            { background: rgba(255,255,255,0.025); }

                .cc-bill-info { flex: 1; min-width: 0; }

                .cc-merchant-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 3px;
                }

                .cc-merchant-icon { flex-shrink: 0; }
                :root:not(.dark) .cc-merchant-icon { color: #cbd5e1; }
                .dark .cc-merchant-icon            { color: #9CA3AF; }

                .cc-merchant-name {
                    font-size: 0.845rem;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    transition: color 0.12s ease;
                }
                :root:not(.dark) .cc-merchant-name { color: #475569; }
                :root:not(.dark) .cc-bill-inner:hover .cc-merchant-name { color: #0f172a; }
                .dark .cc-merchant-name { color: #9CA3AF; }
                .dark .cc-bill-inner:hover .cc-merchant-name { color: #e2e8f0; }

                /* Duplicate badge */
                .cc-dup-badge {
                    font-size: 0.62rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    padding: 1px 6px;
                    border-radius: 4px;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                :root:not(.dark) .cc-dup-badge {
                    background: rgba(245,158,11,0.1);
                    color: #d97706;
                    border: 1px solid rgba(245,158,11,0.2);
                }
                .dark .cc-dup-badge {
                    background: rgba(251,191,36,0.08);
                    color: #fbbf24;
                    border: 1px solid rgba(251,191,36,0.15);
                }

                .cc-meta-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.72rem;
                }
                :root:not(.dark) .cc-meta-row { color: #cbd5e1; }
                .dark .cc-meta-row            { color: #9CA3AF; }

                .cc-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                }

                .cc-items-btn {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    border: none;
                    background: transparent;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.72rem;
                    cursor: pointer;
                    padding: 0;
                    transition: color 0.12s ease;
                    -webkit-tap-highlight-color: transparent;
                }
                :root:not(.dark) .cc-items-btn { color: #cbd5e1; }
                :root:not(.dark) .cc-items-btn:hover { color: #64748b; }
                .dark .cc-items-btn { color: #9CA3AF; }
                .dark .cc-items-btn:hover { color: #D1D5DB; }

                /* Right side of bill row */
                .cc-bill-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-shrink: 0;
                    margin-left: 12px;
                }

                .cc-bill-amount {
                    font-size: 0.875rem;
                    font-weight: 600;
                    font-variant-numeric: tabular-nums;
                    letter-spacing: -0.01em;
                }
                :root:not(.dark) .cc-bill-amount { color: #0f172a; }
                .dark .cc-bill-amount            { color: #f1f5f9; }

                .cc-remove-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 26px;
                    height: 26px;
                    border-radius: 7px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
                    -webkit-tap-highlight-color: transparent;
                }
                :root:not(.dark) .cc-remove-btn { color: #cbd5e1; }
                :root:not(.dark) .cc-remove-btn:hover {
                    background: #fee2e2;
                    color: #ef4444;
                    transform: scale(1.1);
                }
                .dark .cc-remove-btn { color: #374151; }
                .dark .cc-remove-btn:hover {
                    background: rgba(239,68,68,0.1);
                    color: #f87171;
                    transform: scale(1.1);
                }
                .cc-remove-btn:active { transform: scale(0.9) !important; }

                /* ── Items list ── */
                .cc-items-list {
                    padding: 0 16px 12px 16px;
                    animation: cc-fadeUp 0.2s ease both;
                }
                @media (min-width: 640px) { .cc-items-list { padding: 0 20px 14px 20px; } }

                .cc-items-inner {
                    margin-left: 20px;
                    padding-left: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                :root:not(.dark) .cc-items-inner { border-left: 2px solid #f1f5f9; }
                .dark .cc-items-inner            { border-left: 2px solid rgba(255,255,255,0.06); }

                .cc-item-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.775rem;
                }
                .cc-item-name {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 60%;
                }
                :root:not(.dark) .cc-item-name { color: #94a3b8; }
                .dark .cc-item-name            { color: #9CA3AF; }

                .cc-item-price {
                    font-variant-numeric: tabular-nums;
                    font-weight: 500;
                    flex-shrink: 0;
                }
                :root:not(.dark) .cc-item-price { color: #cbd5e1; }
                .dark .cc-item-price            { color: #9CA3AF; }

                @media (max-width: 390px) {
                    .cc-cat-name  { font-size: 0.85rem; }
                    .cc-total     { font-size: 0.88rem; }
                    .cc-bill-inner { padding: 10px 14px; }
                }
            `}</style>

            <div className="cc-card">
                {/* Header */}
                <button className="cc-header" onClick={() => setExpanded(!expanded)}>
                    <div className="cc-header-left">
                        <div className={`cc-icon-wrap ${style.iconBg}`}>
                            <Icon className="w-4 h-4" strokeWidth={1.8} />
                        </div>
                        <div>
                            <p className="cc-cat-name">{group.category}</p>
                            <p className="cc-bill-count">{group.bills.length} bill{group.bills.length > 1 ? "s" : ""}</p>
                        </div>
                    </div>
                    <div className="cc-header-right">
                        <span className={`cc-total ${style.text}`}>{formatCurrency(group.total)}</span>
                        <ChevronDown className={`cc-chevron w-4 h-4${expanded ? " open" : ""}`} />
                    </div>
                </button>

                {/* Body */}
                {expanded && (
                    <div className="cc-body">
                        {group.bills.map((bill, i) => (
                            <BillRow
                                key={bill.file_hash || i}
                                bill={bill}
                                isLast={i === group.bills.length - 1}
                                onRemove={onRemoveBill}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function BillRow({ bill, isLast, onRemove }: { bill: BillResult; isLast: boolean; onRemove?: (hash: string) => void }) {
    const [showItems, setShowItems] = useState(false);

    return (
        <div className="cc-bill-row">
            <div className="cc-bill-inner">
                <div className="cc-bill-info">
                    <div className="cc-merchant-row">
                        <Store className="cc-merchant-icon w-3.5 h-3.5" strokeWidth={1.5} />
                        <span className="cc-merchant-name">
                            {bill.data.merchant || bill.filename}
                        </span>
                        {bill.is_duplicate && (
                            <span className="cc-dup-badge">DUPE</span>
                        )}
                    </div>
                    <div className="cc-meta-row">
                        {bill.data.date && (
                            <span className="cc-meta-item">
                                <Calendar className="w-3 h-3" />
                                {bill.data.date}
                            </span>
                        )}
                        {bill.data.items?.length > 0 && (
                            <button
                                onClick={() => setShowItems(!showItems)}
                                className="cc-items-btn"
                            >
                                <Tag className="w-3 h-3" />
                                {bill.data.items.length} item{bill.data.items.length > 1 ? "s" : ""}
                                {showItems
                                    ? <ChevronUp className="w-3 h-3" />
                                    : <ChevronDown className="w-3 h-3" />
                                }
                            </button>
                        )}
                    </div>
                </div>

                <div className="cc-bill-right">
                    <span className="cc-bill-amount">
                        {formatCurrency(bill.data.total, bill.data.currency)}
                    </span>
                    {onRemove && (
                        <button
                            onClick={() => onRemove(bill.file_hash)}
                            className="cc-remove-btn"
                            title="Remove bill"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {showItems && bill.data.items?.length > 0 && (
                <div className="cc-items-list">
                    <div className="cc-items-inner">
                        {bill.data.items.map((item, j) => (
                            <div key={j} className="cc-item-row">
                                <span className="cc-item-name">{item.name}</span>
                                <span className="cc-item-price">
                                    {formatCurrency(item.price, bill.data.currency)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}