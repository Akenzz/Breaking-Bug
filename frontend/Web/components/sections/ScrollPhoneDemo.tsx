"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    ShieldCheck,
    ScanLine,
    Scale,
    Brain,
    BarChart3,
    ShieldAlert,
    TrendingUp,
    BellRing,
    CreditCard,
    Link2,
    PieChart,
} from "lucide-react";
import { SectionShell } from "@/components/ui/SectionShell";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { FadeIn } from "@/components/ui/FadeIn";

const FEATURES = [
    {
        icon: ShieldCheck,
        title: "Secure & Controlled Access",
        description:
            "Your financial data stays protected with secure authentication and controlled permissions. Access is structured so every group member only sees what they should.",
    },
    {
        icon: ScanLine,
        title: "Smart Bill Recognition",
        description:
            "Upload receipts or invoices — SmartPay automatically reads, cleans, and structures the data. Totals, dates, merchants, and categories are detected instantly.",
        details: ["No manual entry", "No messy records"],
    },
    {
        icon: Scale,
        title: "Intelligent Expense Splitting",
        description:
            "Split expenses equally, by percentage, or custom amounts. SmartPay calculates balances in real time and keeps everything accurate.",
    },
    {
        icon: Brain,
        title: "Optimized Settlement Engine",
        description:
            "SmartPay doesn't just track debts — it reduces them intelligently.",
        details: [
            "Minimizes unnecessary transactions",
            "Simplifies circular debts",
            "Suggests optimized payment flows",
        ],
    },
    {
        icon: BarChart3,
        title: "Adaptive Split Recommendations",
        description:
            "SmartPay considers past contributions, payment history, and outstanding balances then suggests fair and efficient distribution automatically.",
        details: ["Your group stays balanced over time"],
    },
    {
        icon: ShieldAlert,
        title: "AI-Powered Recipient Risk Alert System",
        description:
            "Before completing a payment, the system evaluates the recipient's trust score using community reports, transaction behavior, and network risk analysis. If the account appears suspicious or has been flagged, the payer receives a real-time fraud warning.",
    },
    {
        icon: TrendingUp,
        title: "Financial Forecasting & Insights",
        description:
            "Understand your spending trends before they escalate. SmartPay turns expenses into intelligence.",
        details: [
            "Monthly trend prediction",
            "Overspending alerts",
            "Budget risk warnings",
            "Contribution imbalance insights",
        ],
    },
    {
        icon: BellRing,
        title: "Intelligent Reminder Scheduling",
        description:
            "Reminders are not random. SmartPay schedules follow-ups intelligently, prioritizes high-risk users, and adjusts timing based on behavior.",
        details: ["Less awkwardness", "More accountability"],
    },
    {
        icon: CreditCard,
        title: "Seamless & Secure Settlements",
        description:
            "Settle balances directly through secure UPI integration. Payments are confirmed automatically and reconciled instantly. No manual tracking required.",
    },
    {
        icon: Link2,
        title: "Verifiable Settlement Records",
        description:
            "Every completed settlement is securely verified and recorded. This creates tamper-resistant proof in case of disputes. SmartPay verifies records without replacing traditional bank payments.",
    },
    {
        icon: PieChart,
        title: "Transparency & Fairness Tracking",
        description:
            "SmartPay analyzes contribution patterns and generates a fairness score for each group. Clear visibility. No hidden imbalance.",
    },
] as const;

const TOTAL_SCREENS = 10;
const SCROLL_HEIGHT = 400; // 400vh

// Phone screen components
function IntroScreen({ opacity }: { opacity: number }) {
    return (
        <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center transition-opacity duration-150" style={{ opacity }}>
            {/* Logo and branding */}
            <div className="text-center">
                <div className="mb-6">
                    <div className="w-24 h-24 mx-auto bg-[#141414] border border-[#D0FF00]/20 rounded-3xl flex items-center justify-center shadow-2xl shadow-[#D0FF00]/10">
                        <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none">
                            {/* S letter in gradient */}
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="url(#logoGradient)" />
                            <path d="M15.5 9.5c0-1.1-.9-2-2-2h-3c-1.1 0-2 .9-2 2v1c0 .55.45 1 1 1h4c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1h-3c-1.1 0-2 .9-2 2v.5h7v-.5c0-1.38-1.12-2.5-2.5-2.5h-2.5v-1h3c1.38 0 2.5-1.12 2.5-2.5v-1z" fill="url(#logoGradient)" />
                            <defs>
                                <linearGradient id="logoGradient" x1="0" y1="0" x2="24" y2="24">
                                    <stop offset="0%" stopColor="#D0FF00" />
                                    <stop offset="100%" stopColor="#a3e635" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
                <h1 className="text-white text-3xl font-bold mb-2">SmartPay</h1>
                <p className="text-white/80 text-sm">Intelligent Expense Management</p>
                <div className="mt-6 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-[#D0FF00]/60 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-[#D0FF00]/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#D0FF00]/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
}

function DashboardScreen({ opacity }: { opacity: number }) {
    return (
        <div className="absolute inset-0 p-4 bg-black transition-opacity duration-300" style={{ opacity }}>
            {/* Quick Actions Section */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 mb-3">
                <h3 className="text-white/40 text-[10px] font-semibold tracking-wider mb-3">QUICK ACTIONS</h3>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: "₹", label: "Pay", color: "from-green-400 to-emerald-500" },
                        { icon: "⚡", label: "Split", color: "from-blue-400 to-cyan-500" },
                        { icon: "👥", label: "Groups", color: "from-green-400 to-teal-500" },
                        { icon: "🤝", label: "Settle Up", color: "from-blue-400 to-indigo-500" },
                        { icon: "📄", label: "Upload Bill", color: "from-green-400 to-emerald-500" },
                        { icon: "👤+", label: "Friends", color: "from-blue-400 to-sky-500" },
                        { icon: "↔", label: "Transactions", color: "from-green-400 to-emerald-500", colSpan: true },
                    ].map((action, i) => (
                        <div
                            key={i}
                            className={`${action.colSpan ? 'col-span-1' : ''} flex flex-col items-center gap-1.5`}
                        >
                            <div className={`w-12 h-12 bg-gradient-to-br ${action.color} bg-white rounded-2xl flex items-center justify-center text-base`}>
                                {action.icon}
                            </div>
                            <span className="text-white/80 text-[9px] font-medium">{action.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Money Flow Chart */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
                <h3 className="text-white text-sm font-bold mb-3 text-center">Money Flow - Last 7 Days</h3>

                {/* Legend */}
                <div className="flex justify-center gap-4 mb-3 text-[9px]">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                        <span className="text-white/60">Money Received</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-white/60">Money Spent</span>
                    </div>
                </div>

                {/* Chart */}
                <div className="relative h-28">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[8px] text-white/40 pr-1">
                        <span>₹70k</span>
                        <span>₹60k</span>
                        <span>₹50k</span>
                        <span>₹40k</span>
                        <span>₹30k</span>
                    </div>

                    {/* Chart area */}
                    <div className="absolute left-8 right-0 top-0 bottom-0">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {/* Grid lines */}
                            <line x1="0" y1="0" x2="100" y2="0" stroke="white" strokeOpacity="0.05" />
                            <line x1="0" y1="25" x2="100" y2="25" stroke="white" strokeOpacity="0.05" />
                            <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeOpacity="0.05" />
                            <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeOpacity="0.05" />
                            <line x1="0" y1="100" x2="100" y2="100" stroke="white" strokeOpacity="0.05" />

                            {/* Money Received - Pink line */}
                            <polyline
                                points="0,70 16,35 33,45 50,5 66,20 83,30 100,55"
                                fill="none"
                                stroke="#ec4899"
                                strokeWidth="1.5"
                            />
                            {/* Pink dots */}
                            <circle cx="0" cy="70" r="2.5" fill="#ec4899" />
                            <circle cx="16" cy="35" r="2.5" fill="#ec4899" />
                            <circle cx="33" cy="45" r="2.5" fill="#ec4899" />
                            <circle cx="50" cy="5" r="2.5" fill="#ec4899" />
                            <circle cx="66" cy="20" r="2.5" fill="#ec4899" />
                            <circle cx="83" cy="30" r="2.5" fill="#ec4899" />
                            <circle cx="100" cy="55" r="2.5" fill="#ec4899" />

                            {/* Money Spent - Blue line */}
                            <polyline
                                points="0,90 16,85 33,65 50,55 66,75 83,85 100,90"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="1.5"
                            />
                            {/* Blue dots */}
                            <circle cx="0" cy="90" r="2.5" fill="#3b82f6" />
                            <circle cx="16" cy="85" r="2.5" fill="#3b82f6" />
                            <circle cx="33" cy="65" r="2.5" fill="#3b82f6" />
                            <circle cx="50" cy="55" r="2.5" fill="#3b82f6" />
                            <circle cx="66" cy="75" r="2.5" fill="#3b82f6" />
                            <circle cx="83" cy="85" r="2.5" fill="#3b82f6" />
                            <circle cx="100" cy="90" r="2.5" fill="#3b82f6" />
                        </svg>
                    </div>
                </div>

                {/* X-axis - Days (optional, can be hidden due to space) */}
                <div className="flex justify-between text-[8px] text-white/30 mt-1 px-8">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <span key={day}>{day[0]}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AddExpenseScreen({ opacity }: { opacity: number }) {
    return (
        <div className="absolute inset-0 p-4 bg-black transition-opacity duration-300" style={{ opacity }}>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 mb-3">
                <div className="flex justify-between items-center mb-4 text-sm">
                    <button className="text-blue-400">Cancel</button>
                    <h2 className="text-white font-semibold">Add Expense</h2>
                    <button className="text-blue-400 font-semibold">Save</button>
                </div>
                <div className="text-center mb-4">
                    <p className="text-white/40 text-xs mb-1">Amount</p>
                    <h1 className="text-white text-5xl font-bold">₹2,040</h1>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { emoji: "🍔", color: "from-orange-500 to-red-500" },
                        { emoji: "🚗", color: "from-blue-500 to-cyan-500" },
                        { emoji: "🛍️", color: "from-pink-500 to-purple-500" },
                        { emoji: "💡", color: "from-yellow-500 to-orange-500" },
                        { emoji: "🏥", color: "from-green-500 to-emerald-500" },
                        { emoji: "📦", color: "from-gray-500 to-slate-500" },
                    ].map((cat, i) => (
                        <div key={i} className={`bg-gradient-to-br ${cat.color} ${i === 0 ? 'ring-2 ring-white' : ''} rounded-xl p-3 text-center`}>
                            <div className="text-2xl">{cat.emoji}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SplitBillScreen({ opacity }: { opacity: number }) {
    return (
        <div className="absolute inset-0 p-4 bg-black transition-opacity duration-300" style={{ opacity }}>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 mb-3">
                <h2 className="text-white text-sm font-bold mb-1">Split Bill</h2>
                <p className="text-white/60 text-xs mb-4">Divide with friends</p>
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-4 mb-4">
                    <p className="text-white/80 text-xs mb-1">Total Amount</p>
                    <h1 className="text-white text-4xl font-bold mb-2">₹10,000</h1>
                    <p className="text-white/80 text-xs">Split between 4 people</p>
                </div>
            </div>
            <div className="space-y-2">
                {[
                    { name: "You", amount: "₹2,500" },
                    { name: "Sarah", amount: "₹2,500" },
                    { name: "Mike", amount: "₹2,500" },
                    { name: "Emma", amount: "₹2,500" },
                ].map((person, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {person.name[0]}
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-sm font-medium">{person.name}</p>
                        </div>
                        <p className="text-white text-sm font-bold">{person.amount}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}


function AnalyticsScreen({ opacity }: { opacity: number }) {
    return (
        <div className="absolute inset-0 p-4 bg-black transition-opacity duration-300" style={{ opacity }}>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 mb-3">
                <h2 className="text-white text-sm font-bold mb-3">Analytics</h2>

                {/* Line chart for spending trends */}
                <div className="bg-white/5 rounded-xl p-3 mb-3">
                    <p className="text-white/60 text-[10px] font-semibold mb-2">SPENDING TREND - LAST 7 DAYS</p>
                    <div className="relative h-24">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[8px] text-white/40 pr-1">
                            <span>₹50k</span>
                            <span>₹40k</span>
                            <span>₹30k</span>
                            <span>₹20k</span>
                            <span>₹10k</span>
                        </div>

                        {/* Chart area */}
                        <div className="absolute left-8 right-0 top-0 bottom-0">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {/* Grid lines */}
                                {[0, 25, 50, 75, 100].map(y => (
                                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="white" strokeOpacity="0.05" />
                                ))}

                                {/* Gradient fill under line */}
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Area fill */}
                                <path
                                    d="M0,60 L14,45 L28,55 L42,25 L57,35 L71,40 L85,30 L100,50 L100,100 L0,100 Z"
                                    fill="url(#chartGradient)"
                                />

                                {/* Line */}
                                <polyline
                                    points="0,60 14,45 28,55 42,25 57,35 71,40 85,30 100,50"
                                    fill="none"
                                    stroke="#a78bfa"
                                    strokeWidth="2"
                                />

                                {/* Data points */}
                                {[
                                    { x: 0, y: 60 }, { x: 14, y: 45 }, { x: 28, y: 55 }, { x: 42, y: 25 },
                                    { x: 57, y: 35 }, { x: 71, y: 40 }, { x: 85, y: 30 }, { x: 100, y: 50 }
                                ].map((point, i) => (
                                    <circle key={i} cx={point.x} cy={point.y} r="2.5" fill="#a78bfa" />
                                ))}
                            </svg>
                        </div>
                    </div>

                    {/* X-axis - Days */}
                    <div className="flex justify-between text-[8px] text-white/30 mt-1 px-8">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <span key={day}>{day[0]}</span>
                        ))}
                    </div>
                </div>

                {/* Category breakdown */}
                <div className="space-y-2">
                    <p className="text-white/60 text-[10px] font-semibold mb-2">TOP CATEGORIES</p>
                    {[
                        { name: "Food & Dining", amount: "₹35,400", percent: 35, color: "bg-orange-500" },
                        { name: "Transportation", amount: "₹23,300", percent: 23, color: "bg-blue-500" },
                        { name: "Shopping", amount: "₹16,250", percent: 16, color: "bg-pink-500" },
                    ].map((cat, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-white">{cat.name}</span>
                                <span className="text-white font-semibold">{cat.amount}</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${cat.color} rounded-full`}
                                    style={{ width: `${cat.percent}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SuccessScreen({ opacity }: { opacity: number }) {
    return (
        <div className="absolute inset-0 p-4 bg-black flex flex-col items-center justify-center transition-opacity duration-300" style={{ opacity }}>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 w-full">
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-green-500/30">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2 text-center">Payment Successful!</h2>
                    <p className="text-white/60 text-center text-xs mb-4">Expense recorded</p>
                </div>
                <div className="w-full bg-white/5 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-white/60">Amount</span>
                        <span className="text-white font-bold text-lg">₹2,040</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-white/60">Category</span>
                        <span className="text-white">Food & Dining</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TransactionsScreen({ opacity }: { opacity: number }) {
    return (
        <div className="absolute inset-0 p-4 bg-black transition-opacity duration-300" style={{ opacity }}>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 mb-3">
                <h2 className="text-white text-sm font-bold mb-3">Recent Transactions</h2>
                <div className="space-y-2">
                    {[
                        { icon: "🍕", name: "Pizza Hut", time: "2 hours ago", amount: "-₹850", color: "bg-orange-500" },
                        { icon: "🚕", name: "Uber Ride", time: "5 hours ago", amount: "-₹245", color: "bg-blue-500" },
                        { icon: "💰", name: "Salary Received", time: "Yesterday", amount: "+₹45,000", color: "bg-green-500" },
                        { icon: "🛒", name: "Grocery Store", time: "2 days ago", amount: "-₹1,250", color: "bg-purple-500" },
                        { icon: "⚡", name: "Electricity Bill", time: "3 days ago", amount: "-₹1,800", color: "bg-yellow-500" },
                    ].map((tx, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                            <div className={`w-10 h-10 ${tx.color} rounded-full flex items-center justify-center text-lg`}>
                                {tx.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium truncate">{tx.name}</p>
                                <p className="text-white/40 text-[10px]">{tx.time}</p>
                            </div>
                            <p className={`text-xs font-bold ${tx.amount.startsWith("+") ? "text-green-400" : "text-white"}`}>
                                {tx.amount}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function UploadBillScreen({ opacity }: { opacity: number }) {
    return (
        <div className="absolute inset-0 p-4 bg-black transition-opacity duration-300" style={{ opacity }}>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 mb-3">
                <h2 className="text-white text-sm font-bold mb-1">Upload Bills</h2>
                <p className="text-white/60 text-xs mb-4">AI-powered expense organizer</p>

                {/* Upload area */}
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 mb-4">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-3">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <p className="text-white text-xs font-semibold mb-1">Tap to browse or select files</p>
                        <p className="text-white/40 text-[10px]">JPEG, PNG, BMP or WebP up to 10MB each</p>
                    </div>
                </div>

                {/* Recent uploads */}
                <div className="space-y-2">
                    <p className="text-white/60 text-[10px] font-semibold mb-2">RECENT UPLOADS</p>
                    {[
                        { name: "restaurant_bill.jpg", size: "2.4 MB", status: "Processed" },
                        { name: "fuel_receipt.png", size: "1.8 MB", status: "Processing" },
                    ].map((file, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-xs">📄</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-[10px] font-medium truncate">{file.name}</p>
                                <p className="text-white/40 text-[9px]">{file.size}</p>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full ${i === 0 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                                {file.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function GroupsScreen({ opacity }: { opacity: number }) {
    return (
        <div className="absolute inset-0 p-4 bg-black transition-opacity duration-300" style={{ opacity }}>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 mb-3">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-sm font-bold">Groups</h2>
                    <button className="text-blue-400 text-xs font-semibold">+ Create</button>
                </div>

                <div className="space-y-2">
                    {[
                        { name: "Weekend Trip", members: 5, amount: "₹12,450", status: "You owe ₹2,100", color: "from-blue-500 to-cyan-500" },
                        { name: "Apartment Rent", members: 3, amount: "₹45,000", status: "Settled", color: "from-green-500 to-emerald-500" },
                        { name: "Office Lunch", members: 8, amount: "₹3,200", status: "You are owed ₹400", color: "from-purple-500 to-pink-500" },
                        { name: "Movie Night", members: 4, amount: "₹1,800", status: "Settled", color: "from-orange-500 to-red-500" },
                    ].map((group, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-12 h-12 bg-gradient-to-br ${group.color} rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                                    👥
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-semibold truncate">{group.name}</p>
                                    <p className="text-white/40 text-[10px]">{group.members} members • {group.amount}</p>
                                </div>
                            </div>
                            <div className={`text-[10px] px-2 py-1 rounded-md ${group.status.includes("owe") ? "bg-red-500/20 text-red-400" : group.status.includes("owed") ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"}`}>
                                {group.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SettleUpScreen({ opacity }: { opacity: number }) {
    return (
        <div className="absolute inset-0 p-4 bg-black transition-opacity duration-300" style={{ opacity }}>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 mb-3">
                <h2 className="text-white text-sm font-bold mb-1">Settle Up</h2>
                <p className="text-white/60 text-xs mb-4">Optimized payment flow</p>

                {/* Total summary */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-4 mb-4">
                    <p className="text-white/80 text-xs mb-1">Total to Settle</p>
                    <h1 className="text-white text-3xl font-bold mb-2">₹2,500</h1>
                    <p className="text-white/80 text-xs">2 pending settlements</p>
                </div>

                {/* Settlements list */}
                <div className="space-y-2">
                    <p className="text-white/60 text-[10px] font-semibold mb-2">SUGGESTED PAYMENTS</p>
                    {[
                        { person: "Rahul", amount: "₹1,500", reason: "Weekend Trip" },
                        { person: "Priya", amount: "₹1,000", reason: "Office Lunch" },
                    ].map((settlement, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-3">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {settlement.person[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-xs font-semibold">Pay {settlement.person}</p>
                                    <p className="text-white/40 text-[10px]">{settlement.reason}</p>
                                </div>
                                <p className="text-white text-sm font-bold">{settlement.amount}</p>
                            </div>
                            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold py-2 rounded-lg">
                                Pay via UPI
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ScrollPhoneDemo() {
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const sectionRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | undefined>(undefined);

    // Handle scroll with RAF for performance
    const handleScroll = useCallback(() => {
        if (!sectionRef.current) return;

        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
            const section = sectionRef.current;
            if (!section) return;

            const rect = section.getBoundingClientRect();
            const sectionHeight = section.offsetHeight;
            const windowHeight = window.innerHeight;

            // Calculate scroll progress within the section (0 to 1)
            const scrollStart = -rect.top;
            const scrollEnd = sectionHeight - windowHeight;
            const progress = Math.max(0, Math.min(1, scrollStart / scrollEnd));

            setScrollProgress(progress);

            // Map progress to feature index (all 11 features)
            const featureIndex = Math.floor(progress * FEATURES.length);
            const clampedIndex = Math.max(0, Math.min(FEATURES.length - 1, featureIndex));
            setCurrentFeatureIndex(clampedIndex);
        });
    }, []);

    // Set up scroll listener
    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Initial call

        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [handleScroll]);

    // Direct mapping to feature index for instant transitions
    const currentScreenIndex = Math.min(currentFeatureIndex, TOTAL_SCREENS - 1);

    // Phone screens with instant binary transitions
    const screens = [
        <IntroScreen key={0} opacity={currentScreenIndex === 0 ? 1 : 0} />,
        <DashboardScreen key={1} opacity={currentScreenIndex === 1 ? 1 : 0} />,
        <AddExpenseScreen key={2} opacity={currentScreenIndex === 2 ? 1 : 0} />,
        <SplitBillScreen key={3} opacity={currentScreenIndex === 3 ? 1 : 0} />,
        <AnalyticsScreen key={4} opacity={currentScreenIndex === 4 ? 1 : 0} />,
        <SuccessScreen key={5} opacity={currentScreenIndex === 5 ? 1 : 0} />,
        <TransactionsScreen key={6} opacity={currentScreenIndex === 6 ? 1 : 0} />,
        <UploadBillScreen key={7} opacity={currentScreenIndex === 7 ? 1 : 0} />,
        <GroupsScreen key={8} opacity={currentScreenIndex === 8 ? 1 : 0} />,
        <SettleUpScreen key={9} opacity={currentScreenIndex === 9 ? 1 : 0} />,
    ];

    return (
        <section
            ref={sectionRef}
            className="hidden lg:block relative w-full bg-sp-bg"
            style={{ minHeight: "250vh" }}
            id="features"
        >
            <SectionShell className="py-16 md:py-24">
                {/* Header */}
                <FadeIn>
                    <div className="mb-12 max-w-2xl">
                        <p className="text-sm font-medium tracking-widest uppercase text-sp-text-tertiary mb-3">
                            Core Capabilities
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-sp-text leading-tight mb-3">
                            Built for precision.{" "}
                            <span className="text-sp-text-secondary">Engineered for trust.</span>
                        </h2>
                        <p className="text-base text-sp-text-secondary leading-relaxed">
                            Every feature is designed around security, optimization, and auditability.
                        </p>
                    </div>
                </FadeIn>

                {/* Two-column sticky layout — flex so sticky works correctly */}
                <div className="flex gap-12 items-start">

                    {/* Left side - Feature cards (scrollable) */}
                    <div className="flex-1 space-y-6">
                        {FEATURES.map((feature, index) => (
                            <div
                                key={feature.title}
                                onClick={() => setCurrentFeatureIndex(index)}
                                className={`cursor-pointer transition-all duration-300 ${currentFeatureIndex === index
                                    ? "scale-100 opacity-100"
                                    : "scale-95 opacity-50 hover:opacity-75"
                                    }`}
                            >
                                <FeatureCard
                                    icon={feature.icon}
                                    title={feature.title}
                                    description={feature.description}
                                    details={"details" in feature ? [...feature.details] : undefined}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Right side - Sticky phone mockup */}
                    <div className="flex-1 sticky top-24 flex items-center justify-center h-[700px]">
                        <div className="relative">
                            {/* Enhanced radial glow */}
                            <div
                                className="absolute inset-0 -m-32 flex items-center justify-center pointer-events-none opacity-60"
                                style={{
                                    background: "radial-gradient(circle at center, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.15) 40%, transparent 70%)"
                                }}
                            />

                            <div className="relative z-10">
                                {/* Phone frame */}
                                <div className="relative w-[320px] h-[640px] rounded-[2.5rem] bg-gradient-to-br from-slate-800 via-slate-900 to-black p-[3px] shadow-[0_0_60px_rgba(99,102,241,0.3),0_20px_50px_rgba(0,0,0,0.5)]">
                                    <div className="relative w-full h-full rounded-[2.3rem] bg-gradient-to-br from-slate-700/20 via-transparent to-transparent p-[8px]">
                                        <div className="relative w-full h-full rounded-[2rem] bg-black overflow-hidden shadow-inner">
                                            {screens}
                                            {/* Notch */}
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-black rounded-b-[1.2rem] z-50 flex items-center justify-center shadow-lg">
                                                <div className="w-14 h-1 bg-slate-700/60 rounded-full mb-2"></div>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rounded-full border border-slate-700">
                                                    <div className="w-0.5 h-0.5 bg-indigo-400/30 rounded-full m-auto mt-0.5"></div>
                                                </div>
                                            </div>
                                            {/* Screen reflection */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none z-40"></div>
                                        </div>
                                    </div>
                                    {/* Side buttons */}
                                    <div className="absolute -left-[2px] top-24 w-0.5 h-8 bg-slate-700 rounded-l-sm"></div>
                                    <div className="absolute -left-[2px] top-36 w-0.5 h-12 bg-slate-700 rounded-l-sm"></div>
                                    <div className="absolute -left-[2px] top-52 w-0.5 h-12 bg-slate-700 rounded-l-sm"></div>
                                    <div className="absolute -right-[2px] top-32 w-0.5 h-16 bg-slate-700 rounded-r-sm"></div>
                                </div>
                                {/* Progress dots */}
                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                                    {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-2 rounded-full transition-all duration-300 ${currentScreenIndex === i
                                                ? "w-8 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50"
                                                : "w-2 bg-slate-600/50"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionShell >
        </section >
    );
}
