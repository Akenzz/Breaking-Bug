"use client";

import { AlertTriangle, ShieldCheck, Info } from "lucide-react";
import type { AnalysisData } from "@/lib/api";

interface Props {
    anomalies: AnalysisData["anomalies"];
    skipped: boolean;
    skipReason?: string;
}

function SectionHeader({ count }: { count?: number }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-sm font-semibold text-sp-text">Anomaly Detection</h3>
                <p className="text-xs text-sp-text-tertiary mt-0.5">Unusual transaction patterns</p>
            </div>
            {count !== undefined && count > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {count} flagged
                </span>
            )}
        </div>
    );
}

export default function AnomalySection({ anomalies, skipped, skipReason }: Props) {
    /* Skipped */
    if (skipped) {
        return (
            <div className="bg-sp-surface border border-sp-border rounded-2xl p-6 flex flex-col gap-4">
                <SectionHeader />
                <div className="flex items-start gap-3 bg-[#2072CE]/5 border border-[#2072CE]/20 rounded-xl p-4">
                    <div className="w-8 h-8 rounded-xl bg-[#2072CE]/10 flex items-center justify-center flex-shrink-0">
                        <Info className="w-4 h-4 text-[#2072CE]" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-semibold text-[#2072CE]">Detection Skipped</p>
                        <p className="text-sm text-sp-text-secondary">
                            {skipReason ?? "Anomaly detection was skipped for this analysis."}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /* No anomalies */
    if (!anomalies || anomalies.length === 0) {
        return (
            <div className="bg-sp-surface border border-sp-border rounded-2xl p-6 flex flex-col gap-4">
                <SectionHeader />
                <div className="flex items-center gap-3 bg-[#2CA94F]/5 border border-[#2CA94F]/20 rounded-xl p-4">
                    <div className="w-8 h-8 rounded-xl bg-[#2CA94F]/10 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-4 h-4 text-[#2CA94F]" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-semibold text-[#2CA94F]">All Clear</p>
                        <p className="text-sm text-sp-text-secondary">No anomalies detected — your spending looks normal.</p>
                    </div>
                </div>
            </div>
        );
    }

    /* Has anomalies */
    return (
        <div className="bg-sp-surface border border-sp-border rounded-2xl p-6 flex flex-col gap-5">
            <SectionHeader count={anomalies.length} />

            <div className="flex flex-col gap-3">
                {anomalies.map((anomaly: any, i: number) => (
                    <div
                        key={i}
                        className="flex items-start gap-3 border border-amber-500/20 bg-amber-500/5 rounded-xl p-4"
                    >
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                            {anomaly.description && (
                                <p className="text-sm font-semibold text-sp-text">{anomaly.description}</p>
                            )}
                            {anomaly.amount !== undefined && (
                                <p className="text-xs text-sp-text-secondary">
                                    Amount:{" "}
                                    <span className="font-bold text-amber-500">
                                        ₹{Number(anomaly.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                    </span>
                                </p>
                            )}
                            {anomaly.reason && (
                                <p className="text-xs text-sp-text-tertiary italic">{anomaly.reason}</p>
                            )}
                            {/* Render any remaining string fields */}
                            {Object.entries(anomaly)
                                .filter(([k]) => !["description", "amount", "reason"].includes(k))
                                .map(([k, v]) => (
                                    <p key={k} className="text-xs text-sp-text-tertiary">
                                        <span className="font-medium text-sp-text-secondary capitalize">{k}: </span>
                                        {String(v)}
                                    </p>
                                ))
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
