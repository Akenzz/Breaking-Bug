"use client";

import { useEffect, useState } from "react";

export function SettlementCoreVisual() {
    const [progress, setProgress] = useState(0);

    // Simulate the progress bar animation
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-[600px] flex items-center justify-center perspective-[2000px] pointer-events-none select-none">
            {/* Main Isometric Container */}
            <div className="relative w-[500px] h-[500px] transform rotate-x-[20deg] rotate-y-[-20deg] rotate-z-[0deg] transition-all duration-700 ease-out preserve-3d">

                {/* 1. Backdrop Glow */}
                <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-[#C6FF00] opacity-10 blur-[100px] animate-pulse" />

                {/* 2. Middle Layer: Glass Sheet with Scanner */}
                <div className="absolute inset-0 z-10 flex items-center justify-center transform translate-z-0">
                    <div className="w-[400px] h-[500px] bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
                        {/* Grid Pattern on Glass */}
                        <div className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                        />

                        {/* Central Scanner Ring */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-[#C6FF00]/30 rounded-full flex items-center justify-center">
                            <div className="w-32 h-32 border-2 border-[#C6FF00] rounded-full border-t-transparent animate-spin duration-[3s]" />
                            <div className="absolute w-24 h-24 bg-[#C6FF00]/10 rounded-full blur-md" />
                            {/* Icon */}
                            <div className="text-[#C6FF00]">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" opacity="0.2" />
                                    <path d="M2 12C2 6.47715 6.47715 2 12 2V12L19.0711 19.0711C17.1187 21.0234 14.4208 22.0007 11.9992 22.0007C6.4764 22.0007 2 17.5236 2 12Z" />
                                </svg>
                            </div>
                        </div>

                        {/* Scanning Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#C6FF00]/50 shadow-[0_0_20px_#C6FF00] animate-[scan_4s_ease-in-out_infinite]" />
                    </div>
                </div>

                {/* 3. Top Right Floating Card: Optimization Stats */}
                <div className="absolute -right-12 -top-12 z-20 w-[320px] bg-[#0A0A0A] border border-[#C6FF00]/20 rounded-xl p-6 shadow-2xl transform translate-z-[50px] hover:-translate-y-2 transition-transform duration-500">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#C6FF00]/10 flex items-center justify-center text-[#C6FF00]">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" /></svg>
                            </div>
                            <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">Optimization</span>
                        </div>
                        <span className="text-[#C6FF00] font-mono text-sm font-bold">+24.8%</span>
                    </div>

                    {/* Graph Visual */}
                    <div className="h-24 w-full relative mb-6">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <path d="M0 35 Q 20 30, 40 25 T 100 5" fill="none" stroke="#C6FF00" strokeWidth="2" strokeLinecap="round" />
                            <path d="M0 35 Q 20 30, 40 25 T 100 5 L 100 40 L 0 40 Z" fill="url(#grad)" opacity="0.2" />
                            <defs>
                                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#C6FF00" />
                                    <stop offset="100%" stopColor="#C6FF00" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* Moving Point */}
                            <circle r="3" fill="#C6FF00">
                                <animateMotion path="M0 35 Q 20 30, 40 25 T 100 5" dur="3s" repeatCount="indefinite" />
                            </circle>
                        </svg>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/5 pt-4">
                        <div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Efficiency Rating</div>
                            <div className="text-white font-bold">AAA <span className="text-gray-600 text-xs font-normal">/ Tier 1</span></div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Est. Savings</div>
                            <div className="text-[#C6FF00] font-bold">$42.5k</div>
                        </div>
                    </div>
                </div>

                {/* 4. Bottom Left Floating Card: Settlement Core */}
                <div className="absolute -left-16 -bottom-16 z-30 w-[340px] bg-[#0F0F0F] border border-white/10 rounded-2xl p-5 shadow-2xl transform translate-z-[80px] hover:translate-y-1 transition-transform duration-500">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-[#C6FF00] rounded-full border-r-transparent animate-spin" />
                            <div className="w-2 h-2 bg-[#C6FF00] rounded-full" />
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Settlement Core</div>
                            <div className="text-white font-semibold text-sm">Processing Batch #8921</div>
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Resolving discrepancies...</span>
                            <span className="text-[#C6FF00] font-mono">{progress}%</span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#C6FF00] transition-all duration-75"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {['USD', 'EUR', 'GBP'].map(curr => (
                            <span key={curr} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[10px] text-gray-400">
                                {curr}
                            </span>
                        ))}
                        <span className="px-2 py-1 text-[10px] text-gray-500">+4 more</span>
                    </div>
                </div>

            </div>

            {/* CSS for custom animations that might not be in Tailwind config */}
            <style jsx>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .translate-z-0 { transform: translateZ(0px); }
                .translate-z-50 { transform: translateZ(50px); }
                .translate-z-80 { transform: translateZ(80px); }
            `}</style>
        </div>
    );
}
