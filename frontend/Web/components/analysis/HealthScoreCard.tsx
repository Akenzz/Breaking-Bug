"use client";

interface Props {
    score: number;
    grade: string;
}

const GRADE_CONFIG: Record<string, { color: string; bg: string; glow: string; label: string; sublabel: string }> = {
    A: { color: "#2CA94F", bg: "rgba(44,169,79,0.12)",  glow: "rgba(44,169,79,0.22)",   label: "Excellent", sublabel: "Keep it up!" },
    B: { color: "#2072CE", bg: "rgba(32,114,206,0.12)", glow: "rgba(32,114,206,0.22)",  label: "Good",      sublabel: "On the right track" },
    C: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", glow: "rgba(245,158,11,0.22)",  label: "Fair",      sublabel: "Room to improve" },
    D: { color: "#F97316", bg: "rgba(249,115,22,0.12)", glow: "rgba(249,115,22,0.22)",  label: "Poor",      sublabel: "Needs attention" },
    F: { color: "#EF4444", bg: "rgba(239,68,68,0.12)",  glow: "rgba(239,68,68,0.22)",   label: "Critical",  sublabel: "Take action now" },
};

export default function HealthScoreCard({ score, grade }: Props) {
    const cfg = GRADE_CONFIG[grade] ?? GRADE_CONFIG["C"];

    const R = 52;
    const CIRCUMFERENCE = 2 * Math.PI * R;
    const filled = (Math.min(Math.max(score, 0), 100) / 100) * CIRCUMFERENCE;

    return (
        <div className="bg-sp-surface border border-sp-border rounded-2xl p-6 flex flex-col items-center gap-5
            transition-all duration-250 hover:-translate-y-0.5 hover:border-sp-border-hover"
        >
            {/* Ring with glow */}
            <div
                className="relative w-40 h-40 flex items-center justify-center rounded-full"
                style={{ boxShadow: `0 0 32px 2px ${cfg.glow}` }}
            >
                <svg width="160" height="160" viewBox="0 0 160 160" className="absolute inset-0 -rotate-90" aria-hidden="true">
                    <circle cx="80" cy="80" r={R} fill="none" stroke="currentColor"
                        strokeWidth="12" className="text-sp-border" />
                    <circle
                        cx="80" cy="80" r={R}
                        fill="none"
                        stroke={cfg.color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
                        style={{
                            transition: "stroke-dasharray 1.1s cubic-bezier(0.4,0,0.2,1)",
                            filter: `drop-shadow(0 0 6px ${cfg.color}88)`,
                        }}
                    />
                </svg>
                {/* Inner */}
                <div
                    className="relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center"
                    style={{ background: `radial-gradient(circle at 40% 35%, ${cfg.bg}, transparent 70%)` }}
                >
                    <span className="text-4xl font-bold tabular-nums leading-none" style={{ color: cfg.color }}>{score}</span>
                    <span className="text-[10px] text-sp-text-tertiary font-semibold tracking-widest uppercase mt-0.5">/ 100</span>
                </div>
            </div>

            {/* Grade + label */}
            <div className="flex flex-col items-center gap-1.5 w-full">
                <span
                    className="text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase"
                    style={{ color: cfg.color, background: cfg.bg }}
                >
                    Grade {grade} &mdash; {cfg.label}
                </span>
                <p className="text-xs text-sp-text-tertiary">{cfg.sublabel}</p>
            </div>
        </div>
    );
}
