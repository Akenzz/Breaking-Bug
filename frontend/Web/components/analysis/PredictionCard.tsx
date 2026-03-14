"use client";

import { TrendingUp, TrendingDown, Minus, Cpu } from "lucide-react";
import type { AnalysisData } from "@/lib/api";

interface Props {
    prediction: AnalysisData["prediction"];
}

function TrendBadge({ trend }: { trend: string }) {
    const t = trend.toLowerCase();
    if (t.includes("up") || t.includes("increas")) {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-500">
                <TrendingUp className="w-3 h-3" /> {trend}
            </span>
        );
    }
    if (t.includes("down") || t.includes("decreas")) {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2CA94F]/10 text-[#2CA94F]">
                <TrendingDown className="w-3 h-3" /> {trend}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sp-border text-sp-text-secondary">
            <Minus className="w-3 h-3" /> {trend}
        </span>
    );
}

export default function PredictionCard({ prediction }: Props) {
    const confidence = Math.max(0, Math.min(1, prediction.model_confidence_r2 ?? 0));
    const confPct = (confidence * 100).toFixed(1);
    const confColor = confidence >= 0.7 ? "#2CA94F" : confidence >= 0.4 ? "#F59E0B" : "#EF4444";
    const confLabel = confidence >= 0.7 ? "High confidence" : confidence >= 0.4 ? "Medium confidence" : "Low confidence";

    return (
        <div className="bg-sp-surface border border-sp-border rounded-2xl p-6 flex flex-col gap-5
            transition-all duration-250 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:border-sp-border-hover">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h3 className="text-sm font-semibold text-sp-text">Spending Prediction</h3>
                    <p className="text-xs text-sp-text-tertiary mt-0.5">AI-estimated next transaction amount</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-sp-text-tertiary bg-sp-surface-2 border border-sp-border rounded-lg px-2.5 py-1">
                    <Cpu className="w-3.5 h-3.5" />
                    {prediction.method}
                </div>
            </div>

            {/* Predicted amount — blue tint panel */}
            <div className="bg-[#2072CE]/5 border border-[#2072CE]/25 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2072CE]/70">Predicted Next</p>
                    <p className="text-3xl font-bold tabular-nums text-[#2072CE]">
                        ₹{prediction.predicted_next_amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div>
                    <TrendBadge trend={prediction.trend} />
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-sp-surface-2 border border-sp-border rounded-xl p-3 flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sp-text-tertiary">Recent Avg</p>
                    <p className="text-sm font-bold tabular-nums text-sp-text">
                        ₹{prediction.recent_average.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                </div>
                <div className="bg-sp-surface-2 border border-sp-border rounded-xl p-3 flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sp-text-tertiary">Data Points</p>
                    <p className="text-sm font-bold tabular-nums text-sp-text">{prediction.data_points_used}</p>
                </div>
                <div className="bg-sp-surface-2 border border-sp-border rounded-xl p-3 flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sp-text-tertiary">Confidence</p>
                    <p className="text-sm font-bold tabular-nums" style={{ color: confColor }}>{confPct}%</p>
                </div>
            </div>

            {/* Confidence bar */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-sp-text-tertiary">Model Confidence (R²)</span>
                    <span className="text-xs font-semibold tabular-nums" style={{ color: confColor }}>{confLabel}</span>
                </div>
                <div className="h-2 rounded-full bg-sp-border overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                            width: `${confPct}%`,
                            background: `linear-gradient(90deg, ${confColor}aa, ${confColor})`,
                            boxShadow: `0 0 8px ${confColor}55`
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
