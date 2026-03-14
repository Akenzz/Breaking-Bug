"use client";

import { useEffect, useState } from "react";

export function HeroDemoSection() {
    const [progress, setProgress] = useState(45);
    const [chartVal, setChartVal] = useState(24.8);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const t = setInterval(() => {
            setProgress((p) => {
                const next = p + 0.05;
                return next > 100 ? 0 : next;
            });
            setChartVal((v) => parseFloat((v + (Math.random() - 0.48) * 0.05).toFixed(1)));
        }, 80);
        return () => clearInterval(t);
    }, []);

    const pct = mounted ? Math.round(progress) : 45;
    const val = mounted ? chartVal : 24.8;

    return (
        <section className="relative w-full overflow-hidden bg-black py-24 md:py-36">
            {/* ── Glowing green orb backdrop ── */}
            <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                    width: 600,
                    height: 600,
                    background: "radial-gradient(circle, rgba(163,230,53,0.18) 0%, rgba(101,163,13,0.09) 40%, transparent 70%)",
                    filter: "blur(40px)",
                }}
            />

            {/* ── Large ghost text ── */}
            <div
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-8 select-none font-black leading-none tracking-tighter text-white/[0.06]"
                style={{ fontSize: "clamp(6rem, 18vw, 16rem)" }}
            >
                AI.
            </div>

            {/* ── Floating cards container ── */}
            <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center gap-8 px-6 md:flex-row md:items-end md:gap-12">

                {/* ──── Optimization card ──── */}
                <div
                    className="relative w-full max-w-sm md:max-w-[360px]"
                    style={{ transform: "perspective(800px) rotateX(14deg) rotateY(-18deg) translateY(-32px)" }}
                >
                    {/* Thin green glow behind card */}
                    <div
                        className="absolute inset-0 rounded-2xl"
                        style={{ boxShadow: "0 0 60px rgba(163,230,53,0.25)", filter: "blur(8px)" }}
                    />
                    <div className="relative rounded-2xl border border-white/10 bg-[#0d0d0d] p-5"
                        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>

                        {/* header row */}
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#a3e635]/10">
                                    <svg className="h-4 w-4 text-[#a3e635]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-bold tracking-widest text-white/60 uppercase">Optimization</span>
                            </div>
                            <span className="text-sm font-bold text-[#a3e635]">+{val.toFixed(1)}%</span>
                        </div>

                        {/* Chart */}
                        <div className="relative mb-5 h-28 w-full">
                            <svg className="h-full w-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#a3e635" stopOpacity="0.12" />
                                        <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M0,80 C40,70 80,55 130,42 C180,30 220,22 300,8 L300,100 L0,100 Z"
                                    fill="url(#chartFill)"
                                />
                                <path
                                    d="M0,80 C40,70 80,55 130,42 C180,30 220,22 300,8"
                                    fill="none"
                                    stroke="#a3e635"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                                <circle cx="130" cy="42" r="5" fill="#a3e635" />
                                <circle cx="130" cy="42" r="9" fill="#a3e635" fillOpacity="0.2" />
                            </svg>
                        </div>

                        {/* Footer row */}
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="mb-1 text-[10px] font-semibold tracking-widest text-white/30 uppercase">Efficiency Rating</p>
                                <p className="text-xl font-black text-white">
                                    AAA <span className="text-sm font-medium text-white/40">/ Tier 1</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="mb-1 text-[10px] font-semibold tracking-widest text-white/30 uppercase">Est. Savings</p>
                                <p className="text-xl font-black text-[#a3e635]">$42.5k</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ──── Settlement Core card ──── */}
                <div
                    className="relative w-full max-w-sm md:max-w-[340px]"
                    style={{ transform: "perspective(800px) rotateX(-10deg) rotateY(12deg) translateY(32px)" }}
                >
                    <div className="relative rounded-2xl border border-white/10 bg-[#0d0d0d] p-5"
                        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>

                        {/* Header */}
                        <div className="mb-4 flex items-center gap-3">
                            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#a3e635]/30">
                                <div
                                    className="absolute inset-0.5 rounded-full border-2 border-transparent border-t-[#a3e635]"
                                    style={{ animation: "spin 1.4s linear infinite" }}
                                />
                                <div className="h-2 w-2 rounded-full bg-[#a3e635]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Settlement Core</p>
                                <p className="text-sm font-bold text-white">Processing Batch #8921</p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                            <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-[11px] text-white/40 italic">Resolving discrepancies...</span>
                                <span className="text-sm font-bold text-[#a3e635]">{pct}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-[#a3e635] transition-all duration-75"
                                    style={{ width: `${pct}%`, boxShadow: "0 0 8px rgba(163,230,53,0.6)" }}
                                />
                            </div>
                        </div>

                        {/* Currency pills */}
                        <div className="flex items-center gap-2">
                            {["USD", "EUR", "GBP"].map((c) => (
                                <span
                                    key={c}
                                    className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/60"
                                >
                                    {c}
                                </span>
                            ))}
                            <span className="text-[10px] text-white/30">+4 more</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </section>
    );
}
