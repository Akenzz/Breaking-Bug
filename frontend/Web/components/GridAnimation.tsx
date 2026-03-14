"use client";

export function GridAnimation() {
    return (
        <svg
            viewBox="0 0 500 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
        >
            {/* Background shape */}
            <rect width="500" height="400" fill="#0A0A0A" />

            {/* Abstract geometric shapes */}
            <circle cx="350" cy="120" r="80" stroke="#1F1F1F" strokeWidth="1" opacity="0.4" />
            <circle cx="350" cy="120" r="120" stroke="#1F1F1F" strokeWidth="1" opacity="0.2" />

            <rect
                x="200"
                y="250"
                width="150"
                height="100"
                stroke="#2E2E2E"
                strokeWidth="1"
                opacity="0.3"
            />

            <line
                x1="100"
                y1="100"
                x2="250"
                y2="200"
                stroke="#3A3A3A"
                strokeWidth="1"
                opacity="0.5"
            />

            <line
                x1="250"
                y1="100"
                x2="400"
                y2="200"
                stroke="#3A3A3A"
                strokeWidth="1"
                opacity="0.5"
            />

            {/* Accent dots */}
            <circle cx="180" cy="150" r="4" fill="#C6FF00" opacity="0.8" />
            <circle cx="320" cy="280" r="4" fill="#C6FF00" opacity="0.8" />
            <circle cx="420" cy="180" r="3" fill="#FFFFFF" opacity="0.6" />
        </svg>
    );
}
