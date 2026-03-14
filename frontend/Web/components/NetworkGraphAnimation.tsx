"use client";

export function NetworkGraphAnimation() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Matte black background */}
            <div className="absolute inset-0 bg-black" />

            {/* Network Graph SVG */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 600 400"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* Glow filter */}
                    <filter id="networkGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Green glow for optimized path */}
                    <filter id="greenGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Phase 1: Messy connections - fade out */}
                <g opacity="1">
                    <animate attributeName="opacity" values="1;1;0;0" dur="16s" repeatCount="indefinite" />

                    {/* Multiple messy intersecting lines */}
                    <line x1="100" y1="100" x2="500" y2="300" stroke="white" strokeWidth="0.5" opacity="0.3" />
                    <line x1="150" y1="80" x2="450" y2="320" stroke="white" strokeWidth="0.5" opacity="0.25" />
                    <line x1="200" y1="150" x2="400" y2="250" stroke="white" strokeWidth="0.5" opacity="0.3" />
                    <line x1="120" y1="200" x2="480" y2="180" stroke="white" strokeWidth="0.5" opacity="0.2" />
                    <line x1="180" y1="120" x2="520" y2="280" stroke="white" strokeWidth="0.5" opacity="0.25" />
                    <line x1="250" y1="180" x2="350" y2="220" stroke="white" strokeWidth="0.5" opacity="0.3" />
                    <line x1="140" y1="160" x2="460" y2="240" stroke="white" strokeWidth="0.5" opacity="0.2" />
                    <line x1="300" y1="140" x2="380" y2="280" stroke="white" strokeWidth="0.5" opacity="0.25" />
                    <line x1="160" y1="190" x2="440" y2="200" stroke="white" strokeWidth="0.5" opacity="0.3" />
                    <line x1="220" y1="100" x2="500" y2="260" stroke="white" strokeWidth="0.5" opacity="0.2" />
                    <line x1="130" y1="250" x2="470" y2="150" stroke="white" strokeWidth="0.5" opacity="0.25" />
                    <line x1="270" y1="120" x2="420" y2="290" stroke="white" strokeWidth="0.5" opacity="0.3" />

                    {/* Messy nodes */}
                    <circle cx="100" cy="100" r="3" fill="white" opacity="0.4" />
                    <circle cx="150" cy="80" r="3" fill="white" opacity="0.4" />
                    <circle cx="200" cy="150" r="3" fill="white" opacity="0.4" />
                    <circle cx="250" cy="180" r="3" fill="white" opacity="0.4" />
                    <circle cx="300" cy="140" r="3" fill="white" opacity="0.4" />
                    <circle cx="180" cy="120" r="3" fill="white" opacity="0.4" />
                    <circle cx="220" cy="100" r="3" fill="white" opacity="0.4" />
                    <circle cx="270" cy="120" r="3" fill="white" opacity="0.4" />
                    <circle cx="400" cy="250" r="3" fill="white" opacity="0.4" />
                    <circle cx="450" cy="320" r="3" fill="white" opacity="0.4" />
                    <circle cx="500" cy="300" r="3" fill="white" opacity="0.4" />
                    <circle cx="480" cy="180" r="3" fill="white" opacity="0.4" />
                    <circle cx="520" cy="280" r="3" fill="white" opacity="0.4" />
                </g>

                {/* Phase 2: Clean structured connections - fade in */}
                <g opacity="0">
                    <animate attributeName="opacity" values="0;0;1;1" dur="16s" repeatCount="indefinite" />

                    {/* Clean horizontal node arrangement */}
                    {/* Row 1 */}
                    <line x1="150" y1="120" x2="250" y2="120" stroke="white" strokeWidth="0.8" opacity="0.5" filter="url(#networkGlow)" />
                    <line x1="250" y1="120" x2="350" y2="120" stroke="white" strokeWidth="0.8" opacity="0.5" filter="url(#networkGlow)" />
                    <line x1="350" y1="120" x2="450" y2="120" stroke="white" strokeWidth="0.8" opacity="0.5" filter="url(#networkGlow)" />

                    {/* Row 2 */}
                    <line x1="150" y1="200" x2="250" y2="200" stroke="white" strokeWidth="0.8" opacity="0.5" filter="url(#networkGlow)" />
                    <line x1="250" y1="200" x2="350" y2="200" stroke="white" strokeWidth="0.8" opacity="0.5" filter="url(#networkGlow)" />
                    <line x1="350" y1="200" x2="450" y2="200" stroke="white" strokeWidth="0.8" opacity="0.5" filter="url(#networkGlow)" />

                    {/* Row 3 */}
                    <line x1="150" y1="280" x2="250" y2="280" stroke="white" strokeWidth="0.8" opacity="0.5" filter="url(#networkGlow)" />
                    <line x1="250" y1="280" x2="350" y2="280" stroke="white" strokeWidth="0.8" opacity="0.5" filter="url(#networkGlow)" />
                    <line x1="350" y1="280" x2="450" y2="280" stroke="white" strokeWidth="0.8" opacity="0.5" filter="url(#networkGlow)" />

                    {/* Vertical connections */}
                    <line x1="200" y1="120" x2="200" y2="200" stroke="white" strokeWidth="0.8" opacity="0.4" filter="url(#networkGlow)" />
                    <line x1="300" y1="120" x2="300" y2="200" stroke="white" strokeWidth="0.8" opacity="0.4" filter="url(#networkGlow)" />
                    <line x1="400" y1="120" x2="400" y2="200" stroke="white" strokeWidth="0.8" opacity="0.4" filter="url(#networkGlow)" />
                    <line x1="200" y1="200" x2="200" y2="280" stroke="white" strokeWidth="0.8" opacity="0.4" filter="url(#networkGlow)" />
                    <line x1="300" y1="200" x2="300" y2="280" stroke="white" strokeWidth="0.8" opacity="0.4" filter="url(#networkGlow)" />
                    <line x1="400" y1="200" x2="400" y2="280" stroke="white" strokeWidth="0.8" opacity="0.4" filter="url(#networkGlow)" />

                    {/* OPTIMIZED NEON GREEN PATH - highlighted route */}
                    <line x1="150" y1="120" x2="250" y2="120" stroke="#C6FF00" strokeWidth="2" opacity="0" filter="url(#greenGlow)">
                        <animate attributeName="opacity" values="0;0;0;0.9;0.9" dur="16s" repeatCount="indefinite" />
                    </line>
                    <line x1="250" y1="120" x2="250" y2="200" stroke="#C6FF00" strokeWidth="2" opacity="0" filter="url(#greenGlow)">
                        <animate attributeName="opacity" values="0;0;0;0.9;0.9" dur="16s" repeatCount="indefinite" />
                    </line>
                    <line x1="250" y1="200" x2="350" y2="200" stroke="#C6FF00" strokeWidth="2" opacity="0" filter="url(#greenGlow)">
                        <animate attributeName="opacity" values="0;0;0;0.9;0.9" dur="16s" repeatCount="indefinite" />
                    </line>
                    <line x1="350" y1="200" x2="350" y2="280" stroke="#C6FF00" strokeWidth="2" opacity="0" filter="url(#greenGlow)">
                        <animate attributeName="opacity" values="0;0;0;0.9;0.9" dur="16s" repeatCount="indefinite" />
                    </line>
                    <line x1="350" y1="280" x2="450" y2="280" stroke="#C6FF00" strokeWidth="2" opacity="0" filter="url(#greenGlow)">
                        <animate attributeName="opacity" values="0;0;0;0.9;0.9" dur="16s" repeatCount="indefinite" />
                    </line>

                    {/* Optimized path nodes - brighter */}
                    <circle cx="150" cy="120" r="4" fill="#C6FF00" opacity="0" filter="url(#greenGlow)">
                        <animate attributeName="opacity" values="0;0;0;0.9;0.9" dur="16s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="250" cy="120" r="4" fill="#C6FF00" opacity="0" filter="url(#greenGlow)">
                        <animate attributeName="opacity" values="0;0;0;0.9;0.9" dur="16s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="250" cy="200" r="4" fill="#C6FF00" opacity="0" filter="url(#greenGlow)">
                        <animate attributeName="opacity" values="0;0;0;0.9;0.9" dur="16s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="350" cy="200" r="4" fill="#C6FF00" opacity="0" filter="url(#greenGlow)">
                        <animate attributeName="opacity" values="0;0;0;0.9;0.9" dur="16s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="350" cy="280" r="4" fill="#C6FF00" opacity="0" filter="url(#greenGlow)">
                        <animate attributeName="opacity" values="0;0;0;0.9;0.9" dur="16s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="450" cy="280" r="4" fill="#C6FF00" opacity="0" filter="url(#greenGlow)">
                        <animate attributeName="opacity" values="0;0;0;0.9;0.9" dur="16s" repeatCount="indefinite" />
                    </circle>

                    {/* Other clean nodes */}
                    <circle cx="150" cy="200" r="3" fill="white" opacity="0.6" filter="url(#networkGlow)" />
                    <circle cx="150" cy="280" r="3" fill="white" opacity="0.6" filter="url(#networkGlow)" />
                    <circle cx="350" cy="120" r="3" fill="white" opacity="0.6" filter="url(#networkGlow)" />
                    <circle cx="450" cy="120" r="3" fill="white" opacity="0.6" filter="url(#networkGlow)" />
                    <circle cx="450" cy="200" r="3" fill="white" opacity="0.6" filter="url(#networkGlow)" />
                </g>
            </svg>
        </div>
    );
}
