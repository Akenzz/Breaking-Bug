"use client";

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
import { InlineTextReveal } from "@/components/ui/inline-text-reveal";

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
            "Upload receipts or invoices SmartPay automatically reads, cleans, and structures the data. Totals, dates, merchants, and categories are detected instantly.",
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
            "SmartPay doesn't just track debts it reduces them intelligently.",
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

export function FeaturesSection() {
    return (
        <SectionShell id="features-list" className="py-12 md:py-16 lg:hidden">
            <FadeIn>
                <div className="flex flex-col gap-3 mb-8 max-w-2xl">
                    <p className="text-sm font-medium tracking-widest uppercase text-sp-text-tertiary">
                        Core Capabilities
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-sp-text leading-tight">
                        <InlineTextReveal>Built for precision. </InlineTextReveal>
                        <InlineTextReveal className="text-sp-text-secondary" startDelay={0.45}>Engineered for trust.</InlineTextReveal>
                    </h2>
                    <p className="text-base text-sp-text-secondary leading-relaxed">
                        Every feature is designed around security, optimization, and
                        auditability not just convenience.
                    </p>
                </div>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEATURES.map((feature, idx) => (
                    <FadeIn key={feature.title} delay={idx * 0.04}>
                        <FeatureCard
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            details={"details" in feature ? [...feature.details] : undefined}
                        />
                    </FadeIn>
                ))}
            </div>
        </SectionShell>
    );
}
