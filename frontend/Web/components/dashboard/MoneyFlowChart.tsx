"use client";

import { useRef } from "react";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { DashboardChartData } from "@/lib/api";
import { Loader2 } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface Props {
    chartData: DashboardChartData | null;
    loading: boolean;
}

export default function MoneyFlowChart({ chartData, loading }: Props) {
    const chartRef = useRef<ChartJS<"line">>(null);

    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    const tickColor = isDark ? "#9CA3AF" : "#888888";
    const tooltipBg = isDark ? "#383E49" : "#ffffff";
    const tooltipTitle = isDark ? "#FFFFFF" : "#111111";
    const tooltipBody = isDark ? "#D1D5DB" : "#555555";
    const tooltipBorder = isDark ? "#4A5362" : "#e0e0e0";
    const pointBorder = isDark ? "#2F343D" : "#F5F5F5";

    const hasData = chartData && chartData.labels?.length > 0;

    const totalIncome = chartData?.income?.reduce((a, b) => a + b, 0) ?? 0;
    const totalExpense = chartData?.expense?.reduce((a, b) => a + b, 0) ?? 0;

    const data = hasData
        ? {
              labels: chartData.labels,
              datasets: [
                  {
                      label: "Income",
                      data: chartData.income,
                      borderColor: "#2CA94F",
                      backgroundColor: "rgba(44,169,79,0.08)",
                      fill: true,
                      tension: 0.4,
                      pointRadius: 3,
                      pointHoverRadius: 7,
                      pointHoverBorderWidth: 3,
                      pointBackgroundColor: "#2CA94F",
                      pointBorderColor: pointBorder,
                      pointBorderWidth: 2,
                      borderWidth: 2,
                  },
                  {
                      label: "Expense",
                      data: chartData.expense,
                      borderColor: "#ef4444",
                      backgroundColor: "rgba(239,68,68,0.08)",
                      fill: true,
                      tension: 0.4,
                      pointRadius: 3,
                      pointHoverRadius: 7,
                      pointHoverBorderWidth: 3,
                      pointBackgroundColor: "#ef4444",
                      pointBorderColor: pointBorder,
                      pointBorderWidth: 2,
                      borderWidth: 2,
                  },
              ],
          }
        : { labels: [], datasets: [] };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index" as const, intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: tooltipBg,
                titleColor: tooltipTitle,
                bodyColor: tooltipBody,
                borderColor: tooltipBorder,
                borderWidth: 1,
                cornerRadius: 10,
                padding: 12,
                callbacks: {
                    label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => {
                        const v = ctx.parsed.y;
                        return v !== null ? `${ctx.dataset.label}: ${formatCurrency(v)}` : "";
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: tickColor, font: { size: 11 } },
                border: { display: false },
            },
            y: {
                position: "left" as const,
                min: 0,
                grid: { display: false, drawTicks: false },
                ticks: {
                    color: tickColor,
                    font: { size: 11 },
                    padding: 8,
                    callback: (v: number | string) => {
                        const num = typeof v === "number" ? v : parseFloat(v as string);
                        return num >= 1000 ? `${(num / 1000).toFixed(0)}k` : `${num}`;
                    },
                },
                border: { display: false },
            },
        },
    };

    return (
        <div className="bg-sp-surface rounded-2xl border border-sp-border p-6
            transition-all duration-250 ease-in-out
            hover:border-sp-border-hover hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
                <div>
                    <h2 className="text-sp-text font-semibold text-base">Money Flow</h2>
                    <p className="text-sp-text-tertiary text-xs mt-0.5">Last 7 days income vs expense</p>
                </div>

                {hasData && (
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sp-text-muted text-[10px] uppercase tracking-wider">Income</p>
                            <p className="text-[#2CA94F] text-sm font-semibold">{formatCurrency(totalIncome)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sp-text-muted text-[10px] uppercase tracking-wider">Expense</p>
                            <p className="text-red-400 text-sm font-semibold">{formatCurrency(totalExpense)}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            {hasData && (
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2CA94F]" />
                        <span className="text-sp-text-muted text-xs">Income</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                        <span className="text-sp-text-muted text-xs">Expense</span>
                    </div>
                </div>
            )}

            <div className="h-56 relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-sp-text-muted animate-spin" />
                    </div>
                ) : hasData ? (
                    <Line ref={chartRef} data={data} options={options} />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-sp-text-muted text-sm">No chart data available</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}
