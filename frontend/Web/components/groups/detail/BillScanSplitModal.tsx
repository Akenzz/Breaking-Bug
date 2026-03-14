"use client";

import { useState, useEffect, useRef } from "react";
import {
    X, Loader2, IndianRupee, Check, Upload,
    ArrowRight, ArrowLeft, ScanLine, Receipt, AlertCircle,
    ChevronDown, ChevronUp,
    UtensilsCrossed, Plane, ShoppingBag, Clapperboard,
    HeartPulse, GraduationCap, Lightbulb, Package,
} from "lucide-react";
import { createExpenseAction } from "@/lib/actions";
import type { GroupMember, CreateExpensePayload } from "@/lib/api";
import {
    apiParseBills,
    groupByCategory,
    calculateOverallTotal,
    formatCurrency,
    type BillResult,
    type CategoryGroup,
    type ParseBillsResponse,
} from "@/lib/bills";

/* ─── Types ─── */
interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
    groupId: number;
    members: GroupMember[];
    currentUserId: number | null;
}

type Step = "upload" | "review" | "split";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface FileWithPreview { file: File; preview: string; id: string; }

/* ─── Component ─── */
export default function BillScanSplitModal({ open, onClose, onCreated, groupId, members, currentUserId }: Props) {
    /* ── Step state ── */
    const [step, setStep] = useState<Step>("upload");

    /* ── Upload state ── */
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    /* ── Scan results ── */
    const [response, setResponse] = useState<ParseBillsResponse | null>(null);
    const [results, setResults] = useState<BillResult[]>([]);
    const [groups, setGroups] = useState<CategoryGroup[]>([]);
    const [expandedCat, setExpandedCat] = useState<string | null>(null);

    /* ── Split state ── */
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [splitType, setSplitType] = useState<"EQUAL" | "EXACT">("EQUAL");
    const [selectedIds, setSelectedIds] = useState<number[]>(members.map((m) => m.userId));
    const [exactSplits, setExactSplits] = useState<Record<number, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [splitError, setSplitError] = useState("");

    useEffect(() => {
        setSelectedIds(members.map((m) => m.userId));
    }, [members]);

    if (!open) return null;

    /* ─── Upload helpers ─── */
    const addFiles = (newFiles: FileList | File[]) => {
        setUploadError("");
        const valid: FileWithPreview[] = [];
        for (const file of Array.from(newFiles)) {
            if (!ACCEPTED_TYPES.includes(file.type)) { setUploadError(`"${file.name}" is not supported.`); continue; }
            if (file.size > MAX_FILE_SIZE) { setUploadError(`"${file.name}" exceeds 10 MB.`); continue; }
            valid.push({ file, preview: URL.createObjectURL(file), id: `${file.name}-${Date.now()}-${Math.random()}` });
        }
        setFiles((prev) => [...prev, ...valid]);
    };

    const removeFile = (id: string) => setFiles((prev) => {
        const r = prev.find((f) => f.id === id);
        if (r) URL.revokeObjectURL(r.preview);
        return prev.filter((f) => f.id !== id);
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setDragActive(false);
        if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    };

    /* ─── Scan ─── */
    const handleScan = async () => {
        if (files.length === 0) return;
        setScanning(true);
        setUploadError("");
        const res = await apiParseBills(files.map((f) => f.file));
        if (!res.success && res.results.length === 0) {
            setUploadError("Failed to parse bills. Please try again.");
            setScanning(false);
            return;
        }
        const successfulResults = res.results.filter((r) => r.success);
        const grouped = groupByCategory(successfulResults);
        setResponse(res);
        setResults(successfulResults);
        setGroups(grouped);

        if (successfulResults.length > 0) {
            const total = calculateOverallTotal(grouped);
            setAmount(total.toFixed(2));
            const merchants = successfulResults.map((r) => r.data.merchant).filter(Boolean);
            setDescription(merchants.length > 0 ? `Bill: ${merchants.slice(0, 3).join(", ")}` : "Scanned Bill Expense");
            setStep("review");
        } else {
            setUploadError("No bills could be parsed. Try clearer images.");
        }
        setScanning(false);
    };

    /* ─── Split helpers ─── */
    const toggleMember = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => setSelectedIds(members.map((m) => m.userId));
    const deselectAll = () => setSelectedIds([]);

    const updateExactAmount = (userId: number, val: string) => {
        setExactSplits((prev) => ({ ...prev, [userId]: val }));
    };

    const exactTotal = Object.values(exactSplits)
        .filter(Boolean)
        .reduce((s, v) => s + (parseFloat(v) || 0), 0);

    const perPerson = amount && selectedIds.length > 0
        ? (parseFloat(amount) / selectedIds.length).toFixed(2)
        : null;

    const isBalanced = amount ? Math.abs(exactTotal - parseFloat(amount)) < 0.01 : false;

    /* ─── Submit ─── */
    const handleSubmit = async () => {
        if (!description.trim() || !amount) return;
        setSubmitting(true);
        setSplitError("");

        let payload: CreateExpensePayload;

        if (splitType === "EQUAL") {
            if (selectedIds.length === 0) {
                setSplitError("Select at least one member");
                setSubmitting(false);
                return;
            }
            payload = {
                groupId,
                description: description.trim(),
                amount: parseFloat(amount),
                splitType: "EQUAL",
                userIds: selectedIds,
            };
        } else {
            const splits = Object.entries(exactSplits)
                .filter(([, v]) => v && parseFloat(v) > 0)
                .map(([k, v]) => ({ userId: parseInt(k), amount: parseFloat(v) }));

            if (splits.length === 0) {
                setSplitError("Add at least one split amount");
                setSubmitting(false);
                return;
            }

            const totalSplit = splits.reduce((s, x) => s + x.amount, 0);
            if (Math.abs(totalSplit - parseFloat(amount)) > 0.01) {
                setSplitError(`Split total (${totalSplit.toFixed(2)}) must equal amount (${parseFloat(amount).toFixed(2)})`);
                setSubmitting(false);
                return;
            }

            payload = {
                groupId,
                description: description.trim(),
                amount: parseFloat(amount),
                splitType: "EXACT",
                exactSplits: splits,
            };
        }

        const res = await createExpenseAction(payload);
        setSubmitting(false);

        if (res.success) {
            resetAll();
            onCreated();
            onClose();
        } else {
            setSplitError(res.message || "Something went wrong");
        }
    };

    /* ─── Reset ─── */
    const resetAll = () => {
        files.forEach((f) => URL.revokeObjectURL(f.preview));
        setStep("upload");
        setFiles([]);
        setDragActive(false);
        setScanning(false);
        setUploadError("");
        setResponse(null);
        setResults([]);
        setGroups([]);
        setExpandedCat(null);
        setDescription("");
        setAmount("");
        setSplitType("EQUAL");
        setSelectedIds(members.map((m) => m.userId));
        setExactSplits({});
        setSubmitting(false);
        setSplitError("");
    };

    const handleClose = () => { resetAll(); onClose(); };

    const overallTotal = groups.length > 0 ? calculateOverallTotal(groups) : 0;

    /* ─── Category icon map ─── */
    const catIcons = {
        Food: UtensilsCrossed,
        Travel: Plane,
        Shopping: ShoppingBag,
        Entertainment: Clapperboard,
        Healthcare: HeartPulse,
        Education: GraduationCap,
        Utilities: Lightbulb,
        Others: Package,
    } as const;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

                .bsm-overlay {
                    position: fixed; inset: 0;
                    width: 100dvw; height: 100dvh;
                    z-index: 9999;
                    display: flex; align-items: center; justify-content: center;
                    padding: 16px;
                    font-family: 'DM Sans', sans-serif;
                }

                .bsm-backdrop {
                    position: absolute; inset: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    -webkit-backdrop-filter: blur(4px);
                }

                .bsm-card {
                    position: relative; width: 100%; max-width: 520px;
                    border-radius: 22px; padding: 28px 24px; z-index: 1;
                    max-height: 90dvh; overflow-y: auto;
                    animation: bsm-popIn 0.32s cubic-bezier(0.32,1.1,0.64,1) both;
                    scrollbar-width: thin;
                }
                @media (min-width: 640px) { .bsm-card { padding: 32px 28px; } }

                :root:not(.dark) .bsm-card {
                    background: #fff; border: 1px solid #e2e8f0;
                    box-shadow: 0 16px 48px rgba(15,23,42,0.14), 0 4px 16px rgba(15,23,42,0.06);
                    scrollbar-color: #e2e8f0 transparent;
                }
                .dark .bsm-card {
                    background: #111827; border: 1px solid rgba(255,255,255,0.08);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.55);
                    scrollbar-color: rgba(255,255,255,0.08) transparent;
                }

                @keyframes bsm-popIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                .bsm-close {
                    position: absolute; top: 16px; right: 16px;
                    width: 32px; height: 32px; border-radius: 8px; border: none;
                    background: transparent; display: flex; align-items: center;
                    justify-content: center; cursor: pointer;
                    transition: background 0.15s ease, color 0.15s ease;
                }
                :root:not(.dark) .bsm-close { color: #94a3b8; }
                :root:not(.dark) .bsm-close:hover { background: #f1f5f9; color: #0f172a; }
                .dark .bsm-close { color: #475569; }
                .dark .bsm-close:hover { background: rgba(255,255,255,0.07); color: #f1f5f9; }

                /* ── Header ── */
                .bsm-header {
                    display: flex; align-items: center; gap: 14px;
                    margin-bottom: 24px; padding-right: 32px;
                }
                .bsm-icon-wrap {
                    width: 44px; height: 44px; border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    background: linear-gradient(135deg, rgba(32,114,206,0.15) 0%, rgba(25,90,170,0.08) 100%);
                }
                .bsm-header-title {
                    font-family: 'Sora', sans-serif; font-size: 1.05rem;
                    font-weight: 700; letter-spacing: -0.02em; margin: 0 0 3px;
                }
                :root:not(.dark) .bsm-header-title { color: #0f172a; }
                .dark .bsm-header-title { color: #f1f5f9; }
                .bsm-header-sub { font-size: 0.8rem; margin: 0; }
                :root:not(.dark) .bsm-header-sub { color: #94a3b8; }
                .dark .bsm-header-sub { color: #475569; }

                /* ── Steps indicator ── */
                .bsm-steps {
                    display: flex; align-items: center; gap: 0;
                    margin-bottom: 24px;
                }
                .bsm-step-item {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 0.72rem; font-weight: 600;
                    letter-spacing: 0.04em; text-transform: uppercase;
                }
                .bsm-step-dot {
                    width: 24px; height: 24px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.68rem; font-weight: 700;
                    transition: background 0.2s, color 0.2s;
                }
                .bsm-step-dot.active {
                    background: linear-gradient(135deg, #2072CE 0%, #1a5aaa 100%);
                    color: #fff;
                }
                .bsm-step-dot.done {
                    background: #10b981; color: #fff;
                }
                :root:not(.dark) .bsm-step-dot:not(.active):not(.done) { background: #f1f5f9; color: #94a3b8; }
                .dark .bsm-step-dot:not(.active):not(.done) { background: rgba(255,255,255,0.06); color: #475569; }

                .bsm-step-label { line-height: 1; }
                :root:not(.dark) .bsm-step-item.active .bsm-step-label { color: #0f172a; }
                .dark .bsm-step-item.active .bsm-step-label { color: #f1f5f9; }
                :root:not(.dark) .bsm-step-item:not(.active) .bsm-step-label { color: #94a3b8; }
                .dark .bsm-step-item:not(.active) .bsm-step-label { color: #475569; }

                .bsm-step-line {
                    flex: 1; height: 2px; margin: 0 10px; border-radius: 1px;
                }
                :root:not(.dark) .bsm-step-line { background: #e2e8f0; }
                .dark .bsm-step-line { background: rgba(255,255,255,0.08); }
                .bsm-step-line.done { background: #10b981; }

                /* ── Dropzone ── */
                .bsm-dropzone {
                    border-radius: 14px; border: 2px dashed transparent;
                    padding: 32px 20px; text-align: center; cursor: pointer;
                    transition: border-color 0.18s ease, background 0.18s ease;
                    display: flex; flex-direction: column; align-items: center; gap: 12px;
                }
                :root:not(.dark) .bsm-dropzone { border-color: #dde3ed; background: #fafbfd; }
                :root:not(.dark) .bsm-dropzone:hover,
                :root:not(.dark) .bsm-dropzone.drag { border-color: rgba(32,114,206,0.4); background: rgba(32,114,206,0.02); }
                .dark .bsm-dropzone { border-color: rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); }
                .dark .bsm-dropzone:hover,
                .dark .bsm-dropzone.drag { border-color: rgba(32,114,206,0.4); background: rgba(32,114,206,0.04); }

                .bsm-drop-icon {
                    width: 48px; height: 48px; border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                }
                :root:not(.dark) .bsm-drop-icon { background: #f1f5f9; }
                .dark .bsm-drop-icon { background: rgba(255,255,255,0.06); }

                .bsm-drop-title {
                    font-family: 'Sora', sans-serif; font-size: 0.9rem;
                    font-weight: 600; margin: 0;
                }
                :root:not(.dark) .bsm-drop-title { color: #0f172a; }
                .dark .bsm-drop-title { color: #f1f5f9; }

                .bsm-drop-sub { font-size: 0.78rem; margin: 0; }
                :root:not(.dark) .bsm-drop-sub { color: #94a3b8; }
                .dark .bsm-drop-sub { color: #475569; }

                /* ── File previews ── */
                .bsm-previews {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
                    gap: 10px; margin-top: 16px;
                }
                .bsm-preview-item {
                    position: relative; aspect-ratio: 1; border-radius: 10px;
                    overflow: hidden;
                }
                .bsm-preview-item img {
                    width: 100%; height: 100%; object-fit: cover;
                }
                .bsm-preview-remove {
                    position: absolute; top: 4px; right: 4px;
                    width: 20px; height: 20px; border-radius: 50%;
                    background: rgba(0,0,0,0.6); color: #fff; border: none;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; font-size: 10px;
                    transition: background 0.15s;
                }
                .bsm-preview-remove:hover { background: rgba(239,68,68,0.9); }

                /* ── Error ── */
                .bsm-error {
                    font-size: 0.8rem; padding: 10px 12px; border-radius: 10px;
                    margin-top: 12px;
                    background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.18);
                    color: #ef4444;
                }
                .dark .bsm-error { color: #f87171; }

                /* ── Action buttons ── */
                .bsm-actions {
                    display: flex; gap: 10px; margin-top: 20px;
                }
                .bsm-btn {
                    flex: 1; padding: 12px; border-radius: 12px; border: none;
                    font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
                    font-weight: 600; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, opacity 0.18s;
                    -webkit-tap-highlight-color: transparent;
                    position: relative; overflow: hidden;
                }
                .bsm-btn:disabled { opacity: 0.42; cursor: not-allowed; box-shadow: none; }
                .bsm-btn:not(:disabled):active { transform: scale(0.97); }

                .bsm-btn-primary {
                    color: #fff;
                }
                :root:not(.dark) .bsm-btn-primary {
                    background: linear-gradient(135deg, #2072CE 0%, #1a5aaa 100%);
                    box-shadow: 0 3px 12px rgba(32,114,206,0.28);
                }
                .dark .bsm-btn-primary {
                    background: linear-gradient(135deg, #2072CE 0%, #1550a0 100%);
                    box-shadow: 0 3px 14px rgba(32,114,206,0.18);
                }
                .bsm-btn-primary::before {
                    content: ''; position: absolute; inset: 0;
                    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.13) 50%, transparent 60%);
                    transform: translateX(-100%);
                }
                .bsm-btn-primary:not(:disabled):hover::before { transform: translateX(100%); transition: transform 0.5s ease; }
                .bsm-btn-primary:not(:disabled):hover { transform: translateY(-2px); }

                .bsm-btn-green {
                    color: #fff;
                }
                :root:not(.dark) .bsm-btn-green {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    box-shadow: 0 3px 12px rgba(16,185,129,0.28);
                }
                .dark .bsm-btn-green {
                    background: linear-gradient(135deg, #10b981 0%, #047857 100%);
                    box-shadow: 0 3px 14px rgba(16,185,129,0.18);
                }
                .bsm-btn-green::before {
                    content: ''; position: absolute; inset: 0;
                    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.14) 50%, transparent 60%);
                    transform: translateX(-100%);
                }
                .bsm-btn-green:not(:disabled):hover::before { transform: translateX(100%); transition: transform 0.5s ease; }
                .bsm-btn-green:not(:disabled):hover { transform: translateY(-2px); }

                .bsm-btn-secondary {
                    background: transparent;
                }
                :root:not(.dark) .bsm-btn-secondary { border: 1.5px solid #e2e8f0; color: #64748b; }
                :root:not(.dark) .bsm-btn-secondary:hover { background: #f8fafc; color: #0f172a; }
                .dark .bsm-btn-secondary { border: 1.5px solid rgba(255,255,255,0.08); color: #64748b; }
                .dark .bsm-btn-secondary:hover { background: rgba(255,255,255,0.04); color: #f1f5f9; }

                /* ── Review: category cards ── */
                .bsm-summary-total {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 14px 16px; border-radius: 14px; margin-bottom: 16px;
                }
                :root:not(.dark) .bsm-summary-total { background: rgba(32,114,206,0.06); border: 1px solid rgba(32,114,206,0.15); }
                .dark .bsm-summary-total { background: rgba(32,114,206,0.08); border: 1px solid rgba(32,114,206,0.12); }

                .bsm-summary-label { font-size: 0.82rem; font-weight: 600; }
                :root:not(.dark) .bsm-summary-label { color: #1e5aaa; }
                .dark .bsm-summary-label { color: #60a5fa; }

                .bsm-summary-amount { font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 700; }
                :root:not(.dark) .bsm-summary-amount { color: #1e5aaa; }
                .dark .bsm-summary-amount { color: #60a5fa; }

                .bsm-stats-row {
                    display: flex; gap: 8px; margin-bottom: 16px;
                }
                .bsm-stat-chip {
                    flex: 1; padding: 10px; border-radius: 10px; text-align: center;
                }
                :root:not(.dark) .bsm-stat-chip { background: #f8fafc; border: 1px solid #e2e8f0; }
                .dark .bsm-stat-chip { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); }

                .bsm-stat-num { font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 700; display: block; }
                :root:not(.dark) .bsm-stat-num { color: #0f172a; }
                .dark .bsm-stat-num { color: #f1f5f9; }

                .bsm-stat-lbl { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
                :root:not(.dark) .bsm-stat-lbl { color: #94a3b8; }
                .dark .bsm-stat-lbl { color: #475569; }

                .bsm-cat-list { display: flex; flex-direction: column; gap: 8px; max-height: 260px; overflow-y: auto; scrollbar-width: thin; }
                :root:not(.dark) .bsm-cat-list { scrollbar-color: #e2e8f0 transparent; }
                .dark .bsm-cat-list { scrollbar-color: rgba(255,255,255,0.08) transparent; }

                .bsm-cat-card {
                    border-radius: 12px; overflow: hidden;
                    transition: box-shadow 0.15s ease;
                }
                :root:not(.dark) .bsm-cat-card { background: #fff; border: 1px solid #e9eef5; }
                .dark .bsm-cat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }

                .bsm-cat-header {
                    display: flex; align-items: center; gap: 10px;
                    padding: 12px 14px; cursor: pointer;
                    transition: background 0.13s;
                }
                :root:not(.dark) .bsm-cat-header:hover { background: #f8fafc; }
                .dark .bsm-cat-header:hover { background: rgba(255,255,255,0.03); }

                .bsm-cat-icon {
                    width: 26px;
                    height: 26px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                :root:not(.dark) .bsm-cat-icon { background: #f1f5f9; color: #64748b; }
                .dark .bsm-cat-icon { background: rgba(255,255,255,0.06); color: #94a3b8; }
                .bsm-cat-name { font-size: 0.85rem; font-weight: 600; flex: 1; }
                :root:not(.dark) .bsm-cat-name { color: #0f172a; }
                .dark .bsm-cat-name { color: #f1f5f9; }

                .bsm-cat-count { font-size: 0.68rem; font-weight: 600; padding: 2px 7px; border-radius: 20px; }
                :root:not(.dark) .bsm-cat-count { background: #f1f5f9; color: #64748b; }
                .dark .bsm-cat-count { background: rgba(255,255,255,0.06); color: #64748b; }

                .bsm-cat-amount { font-family: monospace; font-size: 0.85rem; font-weight: 600; }
                :root:not(.dark) .bsm-cat-amount { color: #0f172a; }
                .dark .bsm-cat-amount { color: #f1f5f9; }

                .bsm-cat-items {
                    padding: 0 14px 12px; animation: bsm-slideDown 0.2s ease both;
                }
                @keyframes bsm-slideDown {
                    from { opacity: 0; max-height: 0; }
                    to   { opacity: 1; max-height: 500px; }
                }

                .bsm-bill-row {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid;
                }
                .bsm-bill-row:last-child { border-bottom: none; }
                :root:not(.dark) .bsm-bill-row { border-color: #f1f5f9; }
                .dark .bsm-bill-row { border-color: rgba(255,255,255,0.04); }

                .bsm-bill-merchant { font-size: 0.8rem; font-weight: 500; }
                :root:not(.dark) .bsm-bill-merchant { color: #475569; }
                .dark .bsm-bill-merchant { color: #94a3b8; }

                .bsm-bill-total { font-family: monospace; font-size: 0.8rem; font-weight: 600; }
                :root:not(.dark) .bsm-bill-total { color: #0f172a; }
                .dark .bsm-bill-total { color: #f1f5f9; }

                /* ── Split form ── */
                .bsm-group { margin-bottom: 16px; }

                .bsm-label {
                    display: block; font-size: 0.72rem; font-weight: 700;
                    letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px;
                }
                :root:not(.dark) .bsm-label { color: #475569; }
                .dark .bsm-label { color: #64748b; }

                .bsm-input {
                    width: 100%; padding: 12px 14px; border-radius: 12px;
                    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
                    border: 1.5px solid transparent; outline: none;
                    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
                    box-sizing: border-box;
                }
                :root:not(.dark) .bsm-input { background: #f8fafc; border-color: #e2e8f0; color: #0f172a; }
                :root:not(.dark) .bsm-input::placeholder { color: #cbd5e1; }
                :root:not(.dark) .bsm-input:focus { background: #fff; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
                .dark .bsm-input { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.07); color: #f1f5f9; }
                .dark .bsm-input::placeholder { color: #334155; }
                .dark .bsm-input:focus { background: rgba(255,255,255,0.06); border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.08); }

                /* Split toggle */
                .bsm-split-toggle {
                    display: flex; border-radius: 12px; overflow: hidden;
                    border: 1.5px solid;
                }
                :root:not(.dark) .bsm-split-toggle { border-color: #e2e8f0; background: #f8fafc; }
                .dark .bsm-split-toggle { border-color: rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); }

                .bsm-split-btn {
                    flex: 1; padding: 11px; font-family: 'DM Sans', sans-serif;
                    font-size: 0.78rem; font-weight: 600; letter-spacing: 0.04em;
                    text-transform: uppercase; border: none; cursor: pointer;
                    transition: background 0.18s ease, color 0.18s ease;
                }
                .bsm-split-btn.active {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: #fff;
                }
                :root:not(.dark) .bsm-split-btn:not(.active) { background: transparent; color: #94a3b8; }
                .dark .bsm-split-btn:not(.active) { background: transparent; color: #475569; }

                /* Member list */
                .bsm-member-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
                .bsm-select-btns { display: flex; align-items: center; gap: 6px; }

                .bsm-select-all, .bsm-select-none {
                    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em;
                    text-transform: uppercase; background: none; border: none;
                    cursor: pointer; padding: 0;
                }
                :root:not(.dark) .bsm-select-all { color: #10b981; }
                .dark .bsm-select-all { color: #34d399; }
                :root:not(.dark) .bsm-select-none { color: #94a3b8; }
                .dark .bsm-select-none { color: #475569; }

                .bsm-sep { font-size: 0.68rem; }
                :root:not(.dark) .bsm-sep { color: #e2e8f0; }
                .dark .bsm-sep { color: rgba(255,255,255,0.1); }

                .bsm-member-list {
                    border-radius: 13px; overflow: hidden;
                    max-height: 180px; overflow-y: auto; scrollbar-width: thin;
                }
                :root:not(.dark) .bsm-member-list { border: 1.5px solid #e2e8f0; }
                .dark .bsm-member-list { border: 1.5px solid rgba(255,255,255,0.07); }

                .bsm-member-row {
                    display: flex; align-items: center; gap: 12px;
                    padding: 11px 14px; cursor: pointer;
                    transition: background 0.13s; border-bottom: 1px solid;
                }
                :root:not(.dark) .bsm-member-row { border-color: #f1f5f9; }
                .dark .bsm-member-row { border-color: rgba(255,255,255,0.04); }
                .bsm-member-row:last-child { border-bottom: none; }
                :root:not(.dark) .bsm-member-row:hover { background: #f8fafc; }
                .dark .bsm-member-row:hover { background: rgba(255,255,255,0.03); }
                :root:not(.dark) .bsm-member-row.selected { background: rgba(16,185,129,0.04); }
                .dark .bsm-member-row.selected { background: rgba(16,185,129,0.06); }

                .bsm-checkbox {
                    width: 18px; height: 18px; border-radius: 5px;
                    border: 1.5px solid; display: flex; align-items: center;
                    justify-content: center; flex-shrink: 0;
                    transition: background 0.15s, border-color 0.15s;
                }
                :root:not(.dark) .bsm-checkbox { border-color: #cbd5e1; }
                .dark .bsm-checkbox { border-color: rgba(255,255,255,0.15); }
                .bsm-checkbox.checked { background: #10b981; border-color: #10b981; }

                .bsm-member-name { font-size: 0.875rem; font-weight: 500; }
                :root:not(.dark) .bsm-member-name { color: #0f172a; }
                .dark .bsm-member-name { color: #f1f5f9; }

                /* Per person info */
                .bsm-per-person {
                    border-radius: 11px; padding: 11px 14px; margin-top: 8px;
                    display: flex; align-items: center; justify-content: space-between;
                    animation: bsm-slideIn 0.2s ease both;
                }
                @keyframes bsm-slideIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                :root:not(.dark) .bsm-per-person { background: rgba(16,185,129,0.07); border: 1px solid rgba(16,185,129,0.18); }
                .dark .bsm-per-person { background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.12); }

                .bsm-per-label { font-size: 0.8rem; font-weight: 500; }
                :root:not(.dark) .bsm-per-label { color: #059669; }
                .dark .bsm-per-label { color: #34d399; }

                .bsm-per-amount { font-family: monospace; font-size: 0.95rem; font-weight: 700; }
                :root:not(.dark) .bsm-per-amount { color: #059669; }
                .dark .bsm-per-amount { color: #34d399; }

                /* Exact splits */
                .bsm-exact-list {
                    border-radius: 13px; overflow: hidden;
                    max-height: 200px; overflow-y: auto; scrollbar-width: thin;
                }
                :root:not(.dark) .bsm-exact-list { border: 1.5px solid #e2e8f0; }
                .dark .bsm-exact-list { border: 1.5px solid rgba(255,255,255,0.07); }

                .bsm-exact-row {
                    display: flex; align-items: center; justify-content: space-between;
                    gap: 12px; padding: 10px 14px; border-bottom: 1px solid;
                }
                :root:not(.dark) .bsm-exact-row { border-color: #f1f5f9; }
                .dark .bsm-exact-row { border-color: rgba(255,255,255,0.04); }
                .bsm-exact-row:last-child { border-bottom: none; }

                .bsm-exact-name { font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                :root:not(.dark) .bsm-exact-name { color: #475569; }
                .dark .bsm-exact-name { color: #94a3b8; }

                .bsm-exact-input {
                    width: 100px; padding: 7px 10px; border-radius: 9px;
                    font-family: monospace; font-size: 0.875rem; text-align: right;
                    border: 1.5px solid transparent; outline: none; flex-shrink: 0;
                    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
                }
                :root:not(.dark) .bsm-exact-input { background: #f8fafc; border-color: #e2e8f0; color: #0f172a; }
                :root:not(.dark) .bsm-exact-input:focus { background: #fff; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
                .dark .bsm-exact-input { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.07); color: #f1f5f9; }
                .dark .bsm-exact-input:focus { background: rgba(255,255,255,0.06); border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.08); }

                /* Balance row */
                .bsm-balance {
                    border-radius: 11px; padding: 11px 14px; margin-top: 8px;
                    display: flex; align-items: center; justify-content: space-between;
                    transition: background 0.2s, border-color 0.2s;
                    animation: bsm-slideIn 0.2s ease both;
                }
                .bsm-balance.balanced { background: rgba(16,185,129,0.07); border: 1px solid rgba(16,185,129,0.18); }
                :root:not(.dark) .bsm-balance:not(.balanced) { background: #f8fafc; border: 1px solid #e2e8f0; }
                .dark .bsm-balance:not(.balanced) { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); }

                .bsm-balance-total { font-family: monospace; font-size: 0.8rem; }
                :root:not(.dark) .bsm-balance-total { color: #94a3b8; }
                .dark .bsm-balance-total { color: #475569; }

                .bsm-balance-status { font-size: 0.8rem; font-weight: 600; }
                .bsm-balance-status.balanced { color: #10b981; }
                :root:not(.dark) .bsm-balance-status:not(.balanced) { color: #94a3b8; }
                .dark .bsm-balance-status:not(.balanced) { color: #475569; }

                /* Spin animation */
                .bsm-spin { animation: bsm-rotate 0.8s linear infinite; }
                @keyframes bsm-rotate { to { transform: rotate(360deg); } }
            `}</style>

            <div className="bsm-overlay">
                <div className="bsm-backdrop" onClick={handleClose} />

                <div className="bsm-card">
                    {/* Close */}
                    <button onClick={handleClose} className="bsm-close" aria-label="Close">
                        <X className="w-4 h-4" />
                    </button>

                    {/* Header */}
                    <div className="bsm-header">
                        <div className="bsm-icon-wrap">
                            <ScanLine className="w-5 h-5" style={{ color: "#2072CE" }} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="bsm-header-title">Scan &amp; Split Bill</h2>
                            <p className="bsm-header-sub">Upload bills, review &amp; split with group</p>
                        </div>
                    </div>

                    {/* Steps indicator */}
                    <div className="bsm-steps">
                        <div className={`bsm-step-item ${step === "upload" ? "active" : ""}`}>
                            <span className={`bsm-step-dot ${step === "upload" ? "active" : "done"}`}>
                                {step !== "upload" ? <Check className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
                            </span>
                            <span className="bsm-step-label">Upload</span>
                        </div>
                        <div className={`bsm-step-line ${step === "split" ? "done" : step === "review" ? "done" : ""}`} />
                        <div className={`bsm-step-item ${step === "review" ? "active" : ""}`}>
                            <span className={`bsm-step-dot ${step === "review" ? "active" : step === "split" ? "done" : ""}`}>
                                {step === "split" ? <Check className="w-3 h-3" /> : <Receipt className="w-3 h-3" />}
                            </span>
                            <span className="bsm-step-label">Review</span>
                        </div>
                        <div className={`bsm-step-line ${step === "split" ? "done" : ""}`} />
                        <div className={`bsm-step-item ${step === "split" ? "active" : ""}`}>
                            <span className={`bsm-step-dot ${step === "split" ? "active" : ""}`}>
                                <IndianRupee className="w-3 h-3" />
                            </span>
                            <span className="bsm-step-label">Split</span>
                        </div>
                    </div>

                    {/* ═══════ STEP 1: Upload ═══════ */}
                    {step === "upload" && (
                        <div>
                            <div
                                className={`bsm-dropzone${dragActive ? " drag" : ""}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept={ACCEPTED_TYPES.join(",")}
                                    multiple
                                    onChange={(e) => e.target.files && addFiles(e.target.files)}
                                    style={{ display: "none" }}
                                />
                                <div className="bsm-drop-icon">
                                    <Upload className="w-5 h-5" style={{ color: "#94a3b8" }} strokeWidth={1.6} />
                                </div>
                                <p className="bsm-drop-title">Drop bill images here</p>
                                <p className="bsm-drop-sub">or click to browse · JPEG, PNG, WebP · Max 10 MB</p>
                            </div>

                            {files.length > 0 && (
                                <div className="bsm-previews">
                                    {files.map((f) => (
                                        <div key={f.id} className="bsm-preview-item">
                                            <img src={f.preview} alt={f.file.name} />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                                                className="bsm-preview-remove"
                                            >
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {uploadError && <div className="bsm-error"><AlertCircle className="w-3.5 h-3.5 inline mr-1" />{uploadError}</div>}

                            <div className="bsm-actions">
                                <button onClick={handleClose} className="bsm-btn bsm-btn-secondary">Cancel</button>
                                <button
                                    onClick={handleScan}
                                    disabled={files.length === 0 || scanning}
                                    className="bsm-btn bsm-btn-primary"
                                >
                                    {scanning ? (
                                        <><Loader2 className="w-4 h-4 bsm-spin" />Scanning…</>
                                    ) : (
                                        <><ScanLine className="w-4 h-4" />Scan Bills</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══════ STEP 2: Review ═══════ */}
                    {step === "review" && (
                        <div>
                            {/* Total banner */}
                            <div className="bsm-summary-total">
                                <span className="bsm-summary-label">Total Scanned</span>
                                <span className="bsm-summary-amount">{formatCurrency(overallTotal)}</span>
                            </div>

                            {/* Stats */}
                            <div className="bsm-stats-row">
                                <div className="bsm-stat-chip">
                                    <span className="bsm-stat-num">{groups.length}</span>
                                    <span className="bsm-stat-lbl">Categories</span>
                                </div>
                                <div className="bsm-stat-chip">
                                    <span className="bsm-stat-num">{results.length}</span>
                                    <span className="bsm-stat-lbl">Bills</span>
                                </div>
                                {response && response.failed > 0 && (
                                    <div className="bsm-stat-chip">
                                        <span className="bsm-stat-num" style={{ color: "#ef4444" }}>{response.failed}</span>
                                        <span className="bsm-stat-lbl">Failed</span>
                                    </div>
                                )}
                            </div>

                            {/* Category breakdown */}
                            <div className="bsm-cat-list">
                                {groups.map((g) => {
                                    const CategoryIcon = catIcons[g.category as keyof typeof catIcons] || Package;
                                    return (
                                        <div key={g.category} className="bsm-cat-card">
                                            <div
                                                className="bsm-cat-header"
                                                onClick={() => setExpandedCat(expandedCat === g.category ? null : g.category)}
                                            >
                                                <span className="bsm-cat-icon">
                                                    <CategoryIcon className="w-3.5 h-3.5" strokeWidth={2} />
                                                </span>
                                                <span className="bsm-cat-name">{g.category}</span>
                                                <span className="bsm-cat-count">{g.bills.length}</span>
                                                <span className="bsm-cat-amount">{formatCurrency(g.total)}</span>
                                                {expandedCat === g.category
                                                    ? <ChevronUp className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
                                                    : <ChevronDown className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
                                                }
                                            </div>
                                            {expandedCat === g.category && (
                                                <div className="bsm-cat-items">
                                                    {g.bills.map((b) => (
                                                        <div key={b.file_hash} className="bsm-bill-row">
                                                            <span className="bsm-bill-merchant">
                                                                {b.data.merchant || b.filename}
                                                                {b.data.date && <span style={{ opacity: 0.5, marginLeft: 6, fontSize: "0.72rem" }}>{b.data.date}</span>}
                                                            </span>
                                                            <span className="bsm-bill-total">{formatCurrency(b.data.total)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bsm-actions">
                                <button onClick={() => { resetAll(); }} className="bsm-btn bsm-btn-secondary">
                                    <ArrowLeft className="w-3.5 h-3.5" />Re-scan
                                </button>
                                <button onClick={() => setStep("split")} className="bsm-btn bsm-btn-primary">
                                    Split This Bill<ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══════ STEP 3: Split ═══════ */}
                    {step === "split" && (
                        <div>
                            {/* Description */}
                            <div className="bsm-group">
                                <label className="bsm-label">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Dinner at restaurant"
                                    className="bsm-input"
                                    maxLength={100}
                                />
                            </div>

                            {/* Amount */}
                            <div className="bsm-group">
                                <label className="bsm-label">Total Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    className="bsm-input"
                                    style={{ fontFamily: "monospace" }}
                                />
                            </div>

                            {/* Split type toggle */}
                            <div className="bsm-group">
                                <label className="bsm-label">Split Type</label>
                                <div className="bsm-split-toggle">
                                    {(["EQUAL", "EXACT"] as const).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setSplitType(t)}
                                            className={`bsm-split-btn${splitType === t ? " active" : ""}`}
                                        >
                                            {t === "EQUAL" ? "Equal Split" : "Custom Split"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Equal split — member picker */}
                            {splitType === "EQUAL" && (
                                <div className="bsm-group">
                                    <div className="bsm-member-header">
                                        <label className="bsm-label" style={{ margin: 0 }}>Split between</label>
                                        <div className="bsm-select-btns">
                                            <button type="button" onClick={selectAll} className="bsm-select-all">All</button>
                                            <span className="bsm-sep">/</span>
                                            <button type="button" onClick={deselectAll} className="bsm-select-none">None</button>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 8 }}>
                                        <div className="bsm-member-list">
                                            {members.map((m) => {
                                                const selected = selectedIds.includes(m.userId);
                                                return (
                                                    <div
                                                        key={`eq-${m.userId}`}
                                                        onClick={() => toggleMember(m.userId)}
                                                        className={`bsm-member-row${selected ? " selected" : ""}`}
                                                    >
                                                        <div className={`bsm-checkbox${selected ? " checked" : ""}`}>
                                                            {selected && <Check className="w-3 h-3" style={{ color: "#fff" }} strokeWidth={3} />}
                                                        </div>
                                                        <span className="bsm-member-name">{m.fullName}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {perPerson && (
                                            <div className="bsm-per-person">
                                                <span className="bsm-per-label">Per person ({selectedIds.length})</span>
                                                <span className="bsm-per-amount">₹{perPerson}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Exact split */}
                            {splitType === "EXACT" && (
                                <div className="bsm-group">
                                    <label className="bsm-label">Amounts per member</label>
                                    <div className="bsm-exact-list">
                                        {members.map((m) => (
                                            <div key={`exact-${m.userId}`} className="bsm-exact-row">
                                                <span className="bsm-exact-name">{m.fullName}</span>
                                                <input
                                                    type="number"
                                                    value={exactSplits[m.userId] || ""}
                                                    onChange={(e) => updateExactAmount(m.userId, e.target.value)}
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                    className="bsm-exact-input"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {amount && (
                                        <div className={`bsm-balance${isBalanced ? " balanced" : ""}`}>
                                            <span className="bsm-balance-total">
                                                {exactTotal.toFixed(2)} / {parseFloat(amount).toFixed(2)}
                                            </span>
                                            <span className={`bsm-balance-status${isBalanced ? " balanced" : ""}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                {isBalanced
                                                    ? <><Check className="w-3.5 h-3.5" />Balanced</>
                                                    : `₹${(parseFloat(amount) - exactTotal).toFixed(2)} remaining`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {splitError && <div className="bsm-error">{splitError}</div>}

                            <div className="bsm-actions">
                                <button onClick={() => setStep("review")} className="bsm-btn bsm-btn-secondary">
                                    <ArrowLeft className="w-3.5 h-3.5" />Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !description.trim() || !amount}
                                    className="bsm-btn bsm-btn-green"
                                >
                                    {submitting ? (
                                        <><Loader2 className="w-4 h-4 bsm-spin" />Creating…</>
                                    ) : (
                                        <><Receipt className="w-4 h-4" />Split Expense</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
