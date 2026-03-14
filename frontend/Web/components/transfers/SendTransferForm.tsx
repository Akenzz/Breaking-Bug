"use client";

import { useState } from "react";
import { initiateTransferAction, claimTransferAction } from "@/lib/actions";
import { useRouter, useSearchParams } from "next/navigation";
  
import { ArrowUpRight, IndianRupee, FileText, Hash, ExternalLink, CheckCircle2, Loader2, XCircle } from "lucide-react";

interface Props {
    defaultUserId?: string | null;
    defaultAmount?: string | null;
}

export default function SendTransferForm({ defaultUserId, defaultAmount }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [toUserId, setToUserId] = useState(defaultUserId || "");
    const [amount, setAmount] = useState(defaultAmount || "");
    const [note, setNote] = useState(defaultUserId ? "Settlement payment" : "");
    const [upiLink, setUpiLink] = useState<string | null>(null);
    const [transferId, setTransferId] = useState<number | null>(null);
    const [initiating, setInitiating] = useState(false);
    const [initiated, setInitiated] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [claimResult, setClaimResult] = useState<{ success: boolean; message: string } | null>(null);

    async function handleInitiate() {
        setInitiating(true);
        const res = await initiateTransferAction({
            toUserId: Number(toUserId),
            amount: Number(amount),
            note,
        });
        setInitiating(false);
        if (res.success && res.data) {
            setUpiLink(res.data.upiLink);
            setTransferId(res.data.transferId);
            setInitiated(true);
        } else {
            alert(res.message);
        }
    }

    async function handleClaim() {
        if (!transferId) return;

        setClaiming(true);

        const res = await claimTransferAction(transferId);

        setClaiming(false);

        setClaimResult({
            success: res.success,
            message: res.message
        });

        const returnTo = searchParams.get("returnTo") || "/dashboard";

        setTimeout(() => router.push(returnTo), 1500);
    }

    return (
        <div className="flex flex-col gap-5">

            {/* Receiver User ID */}
            <div className="flex flex-col gap-2">
                <label className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Receiver User ID
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none">
                        <Hash className="w-4 h-4" strokeWidth={1.8} />
                    </span>
                    <input
                        type="number"
                        placeholder="e.g. 1042"
                        value={toUserId}
                        onChange={(e) => setToUserId(e.target.value)}
                        disabled={!!defaultUserId}
                        className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-medium
                            border-[1.5px] outline-none transition-all duration-150
                            bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300
                            focus:bg-white focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            dark:bg-white/[0.04] dark:border-white/[0.07] dark:text-slate-100 dark:placeholder:text-slate-600
                            dark:focus:bg-white/[0.06] dark:focus:border-emerald-500 dark:focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]"
                    />
                </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-2">
                <label className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Amount
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none">
                        <IndianRupee className="w-4 h-4" strokeWidth={1.8} />
                    </span>
                    <input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={!!defaultAmount}
                        className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-mono font-semibold
                            border-[1.5px] outline-none transition-all duration-150
                            bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300
                            focus:bg-white focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            dark:bg-white/[0.04] dark:border-white/[0.07] dark:text-slate-100 dark:placeholder:text-slate-600
                            dark:focus:bg-white/[0.06] dark:focus:border-emerald-500 dark:focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]"
                    />
                </div>
            </div>

            {/* Note */}
            <div className="flex flex-col gap-2">
                <label className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Note
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none">
                        <FileText className="w-4 h-4" strokeWidth={1.8} />
                    </span>
                    <input
                        type="text"
                        placeholder="What's this for?"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl text-sm font-medium
                            border-[1.5px] outline-none transition-all duration-150
                            bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300
                            focus:bg-white focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]
                            dark:bg-white/[0.04] dark:border-white/[0.07] dark:text-slate-100 dark:placeholder:text-slate-600
                            dark:focus:bg-white/[0.06] dark:focus:border-emerald-500 dark:focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]"
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 dark:bg-white/[0.05]" />

            {/* Initiate button */}
            <button
                onClick={handleInitiate}
                disabled={initiating || initiated || !toUserId || !amount}
                className="relative w-full flex items-center justify-center gap-2 py-3.5 px-6
                    rounded-[13px] text-sm font-semibold text-white overflow-hidden
                    transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
                    active:scale-[0.97]"
                style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    boxShadow: "0 3px 12px rgba(16,185,129,0.28)",
                }}
            >
                {initiating
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
                }
                {initiating ? "Initiating…" : "Initiate Transfer"}
            </button>

            {/* UPI section — shown after initiation */}
            {upiLink && (
                <div className="flex flex-col gap-3 mt-1 p-4 rounded-2xl border
                    bg-emerald-50/60 border-emerald-200/60
                    dark:bg-emerald-500/[0.06] dark:border-emerald-500/[0.15]"
                >
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        Transfer Ready
                    </p>

                    <a
                        href={upiLink}
                        className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl
                            text-sm font-semibold border-[1.5px] transition-all duration-150
                            border-emerald-500/40 text-emerald-700 bg-white hover:bg-emerald-50
                            dark:border-emerald-500/25 dark:text-emerald-400 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                    >
                        <ExternalLink className="w-4 h-4" strokeWidth={2} />
                        Open UPI Payment
                    </a>

                    {claimResult ? (
                        <div className={`flex items-center gap-3 p-3.5 rounded-xl border
                            ${claimResult.success
                                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/[0.08] dark:border-emerald-500/20"
                                : "bg-red-50 border-red-200 dark:bg-red-500/[0.08] dark:border-red-500/20"
                            }`}
                        >
                            {claimResult.success
                                ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                                : <XCircle className="w-5 h-5 text-red-500 shrink-0" strokeWidth={2} />
                            }
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${claimResult.success ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                    {claimResult.message}
                                </p>
                                {claimResult.success && (
                                    <p className="text-xs text-emerald-600/70 dark:text-emerald-500 mt-0.5">
                                        Redirecting to settlements…
                                    </p>
                                )}
                            </div>
                            {claimResult.success && (
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500 shrink-0" strokeWidth={2} />
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleClaim}
                            disabled={claiming}
                            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl
                                text-sm font-semibold text-white transition-all duration-150
                                disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
                            style={{
                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                boxShadow: "0 2px 8px rgba(16,185,129,0.22)",
                            }}
                        >
                            {claiming
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                            }
                            {claiming ? "Confirming…" : "I Have Sent Payment"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}