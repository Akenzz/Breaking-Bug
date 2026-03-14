"use client";

export function TransactionOptimizationAnimation() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Matte black background */}
            <div className="absolute inset-0 bg-black" />

            {/* SVG Animation */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 600 500"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* Glow filter for green highlights */}
                    <filter id="greenGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Phase 1: Multiple messy transactions - fade out */}
                <g opacity="1">
                    <animate attributeName="opacity" values="1;1;0;0" dur="12s" repeatCount="indefinite" />

                    {/* User A */}
                    <g transform="translate(100, 250)">
                        <rect x="-30" y="-15" width="60" height="30" fill="none" stroke="white" strokeWidth="1" rx="4" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">User A</text>
                    </g>

                    {/* User B */}
                    <g transform="translate(250, 150)">
                        <rect x="-30" y="-15" width="60" height="30" fill="none" stroke="white" strokeWidth="1" rx="4" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">User B</text>
                    </g>

                    {/* User C */}
                    <g transform="translate(400, 200)">
                        <rect x="-30" y="-15" width="60" height="30" fill="none" stroke="white" strokeWidth="1" rx="4" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">User C</text>
                    </g>

                    {/* User D */}
                    <g transform="translate(250, 350)">
                        <rect x="-30" y="-15" width="60" height="30" fill="none" stroke="white" strokeWidth="1" rx="4" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">User D</text>
                    </g>

                    {/* User E */}
                    <g transform="translate(500, 300)">
                        <rect x="-30" y="-15" width="60" height="30" fill="none" stroke="white" strokeWidth="1" rx="4" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">User E</text>
                    </g>

                    {/* Multiple transaction arrows */}
                    {/* A -> B: ₹200 */}
                    <g opacity="0.6">
                        <line x1="130" y1="240" x2="220" y2="160" stroke="white" strokeWidth="1" markerEnd="url(#arrowhead)" />
                        <text x="175" y="195" fill="white" fontSize="9" fontFamily="monospace">₹200</text>
                    </g>

                    {/* B -> C: ₹150 */}
                    <g opacity="0.6">
                        <line x1="280" y1="155" x2="370" y2="195" stroke="white" strokeWidth="1" markerEnd="url(#arrowhead)" />
                        <text x="325" y="165" fill="white" fontSize="9" fontFamily="monospace">₹150</text>
                    </g>

                    {/* C -> D: ₹300 */}
                    <g opacity="0.6">
                        <line x1="385" y1="220" x2="270" y2="335" stroke="white" strokeWidth="1" markerEnd="url(#arrowhead)" />
                        <text x="340" y="280" fill="white" fontSize="9" fontFamily="monospace">₹300</text>
                    </g>

                    {/* D -> E: ₹100 */}
                    <g opacity="0.6">
                        <line x1="280" y1="350" x2="470" y2="305" stroke="white" strokeWidth="1" markerEnd="url(#arrowhead)" />
                        <text x="375" y="340" fill="white" fontSize="9" fontFamily="monospace">₹100</text>
                    </g>

                    {/* A -> D: ₹250 */}
                    <g opacity="0.6">
                        <line x1="120" y1="270" x2="230" y2="340" stroke="white" strokeWidth="1" markerEnd="url(#arrowhead)" />
                        <text x="165" y="315" fill="white" fontSize="9" fontFamily="monospace">₹250</text>
                    </g>

                    {/* B -> E: ₹180 */}
                    <g opacity="0.6">
                        <line x1="275" y1="165" x2="475" y2="290" stroke="white" strokeWidth="1" markerEnd="url(#arrowhead)" />
                        <text x="385" y="220" fill="white" fontSize="9" fontFamily="monospace">₹180</text>
                    </g>

                    {/* Arrow marker */}
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                            <polygon points="0 0, 10 3, 0 6" fill="white" />
                        </marker>
                    </defs>
                </g>

                {/* Phase 2: Optimized transactions - fade in */}
                <g opacity="0">
                    <animate attributeName="opacity" values="0;0;1;1" dur="12s" repeatCount="indefinite" />

                    {/* Same users but repositioned for clarity */}
                    {/* User A */}
                    <g transform="translate(150, 200)">
                        <rect x="-30" y="-15" width="60" height="30" fill="none" stroke="#C6FF00" strokeWidth="1.5" rx="4" filter="url(#greenGlow)" />
                        <text x="0" y="5" textAnchor="middle" fill="#C6FF00" fontSize="10" fontFamily="monospace" fontWeight="600">User A</text>
                    </g>

                    {/* User C */}
                    <g transform="translate(450, 200)">
                        <rect x="-30" y="-15" width="60" height="30" fill="none" stroke="#C6FF00" strokeWidth="1.5" rx="4" filter="url(#greenGlow)" />
                        <text x="0" y="5" textAnchor="middle" fill="#C6FF00" fontSize="10" fontFamily="monospace" fontWeight="600">User C</text>
                    </g>

                    {/* User E */}
                    <g transform="translate(300, 350)">
                        <rect x="-30" y="-15" width="60" height="30" fill="none" stroke="white" strokeWidth="1" rx="4" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">User E</text>
                    </g>

                    {/* OPTIMIZED NEON GREEN ARROWS */}
                    {/* A -> C: ₹450 (optimized) */}
                    <g>
                        <line x1="180" y1="200" x2="420" y2="200" stroke="#C6FF00" strokeWidth="2.5" markerEnd="url(#greenArrowhead)" filter="url(#greenGlow)">
                            <animate attributeName="stroke-dasharray" values="0,400;400,0" dur="2s" begin="8s" fill="freeze" repeatCount="indefinite" />
                        </line>
                        <rect x="280" y="175" width="40" height="18" fill="black" stroke="#C6FF00" strokeWidth="1" rx="3" />
                        <text x="300" y="187" textAnchor="middle" fill="#C6FF00" fontSize="11" fontFamily="monospace" fontWeight="700">₹450</text>
                    </g>

                    {/* C -> E: ₹300 (optimized) */}
                    <g>
                        <line x1="440" y1="220" x2="320" y2="340" stroke="#C6FF00" strokeWidth="2.5" markerEnd="url(#greenArrowhead)" filter="url(#greenGlow)">
                            <animate attributeName="stroke-dasharray" values="0,400;400,0" dur="2s" begin="8s" fill="freeze" repeatCount="indefinite" />
                        </line>
                        <rect x="360" y="270" width="40" height="18" fill="black" stroke="#C6FF00" strokeWidth="1" rx="3" />
                        <text x="380" y="282" textAnchor="middle" fill="#C6FF00" fontSize="11" fontFamily="monospace" fontWeight="700">₹300</text>
                    </g>

                    {/* Green arrow marker */}
                    <defs>
                        <marker id="greenArrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                            <polygon points="0 0, 10 3, 0 6" fill="#C6FF00" />
                        </marker>
                    </defs>

                    {/* Optimization label */}
                    <g transform="translate(300, 100)">
                        <text x="0" y="0" textAnchor="middle" fill="white" fontSize="12" fontFamily="monospace" opacity="0.7">
                            6 transactions → 2 optimized transfers
                        </text>
                    </g>
                </g>
            </svg>
        </div>
    );
}
