export default function ResearchIllustration({ className }) {
    // Node definitions — { x, y, r, label?, color }
    const nodes = [
        { id: 'n1', x: 400, y: 200, r: 18, label: 'Paper', color: '#FF6A00' },
        { id: 'n2', x: 260, y: 140, r: 14, label: 'Método', color: '#C2410C' },
        { id: 'n3', x: 560, y: 155, r: 16, label: 'Aplicação', color: '#FF6A00' },
        { id: 'n4', x: 320, y: 310, r: 12, color: '#C2410C' },
        { id: 'n5', x: 510, y: 320, r: 13, label: 'Dados', color: '#FF8A1C' },
        { id: 'n6', x: 180, y: 260, r: 10, color: '#FF6A00' },
        { id: 'n7', x: 640, y: 270, r: 11, color: '#C2410C' },
        { id: 'n8', x: 140, y: 160, r: 8, color: '#FF8A1C' },
        { id: 'n9', x: 680, y: 165, r: 7, color: '#FF8A1C' },
        { id: 'n10', x: 400, y: 90, r: 9, color: '#C2410C' },
        { id: 'n11', x: 450, y: 370, r: 8, color: '#FF6A00' },
        { id: 'n12', x: 240, y: 370, r: 7, color: '#FF8A1C' },
        { id: 'n13', x: 100, y: 340, r: 6, color: '#C2410C' },
        { id: 'n14', x: 700, y: 350, r: 6, color: '#FF6A00' },
        { id: 'n15', x: 340, y: 80, r: 6, color: '#FF8A1C' },
    ];

    // Connections — [fromIdx, toIdx, highlighted?]
    const connections = [
        [0, 1, true],   // Paper → Método
        [0, 2, true],   // Paper → Aplicação
        [0, 3, false],
        [0, 4, true],   // Paper → Dados
        [0, 9, false],  // Paper → top node
        [1, 5, false],
        [1, 7, false],
        [1, 3, false],
        [2, 6, false],
        [2, 8, false],
        [3, 5, false],
        [3, 11, false],
        [4, 6, false],
        [4, 10, false],
        [4, 2, true],   // Dados → Aplicação
        [5, 12, false],
        [6, 13, false],
        [9, 14, false],
        [10, 11, false],
        [1, 14, false],
    ];

    return (
        <svg
            className={className}
            viewBox="0 0 800 450"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
        >
            <style>{`
                @keyframes resNodePulse {
                    0%, 100% { transform: scale(1); opacity: 0.85; }
                    50% { transform: scale(1.15); opacity: 1; }
                }
                @keyframes resRingPulse {
                    0%, 100% { r: 22px; stroke-opacity: 0.25; }
                    50% { r: 28px; stroke-opacity: 0.45; }
                }
                @keyframes resRingPulse2 {
                    0%, 100% { r: 20px; stroke-opacity: 0.2; }
                    50% { r: 26px; stroke-opacity: 0.4; }
                }
                @keyframes resEdgeHighlight {
                    0%, 100% { stroke-opacity: 0.15; }
                    50% { stroke-opacity: 0.45; }
                }
                @keyframes resEdgeHighlight2 {
                    0%, 100% { stroke-opacity: 0.12; }
                    50% { stroke-opacity: 0.35; }
                }
                @keyframes resLabelFade {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 0.9; }
                }
                @keyframes resDotFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .res-node-pulse-1 {
                    transform-origin: center;
                    animation: resNodePulse 4s ease-in-out infinite;
                }
                .res-node-pulse-2 {
                    transform-origin: center;
                    animation: resNodePulse 4s ease-in-out 1s infinite;
                }
                .res-node-pulse-3 {
                    transform-origin: center;
                    animation: resNodePulse 4s ease-in-out 2s infinite;
                }
                .res-ring-1 { animation: resRingPulse 5s ease-in-out infinite; }
                .res-ring-2 { animation: resRingPulse2 5s ease-in-out 1.5s infinite; }
                .res-ring-3 { animation: resRingPulse2 5s ease-in-out 3s infinite; }
                .res-edge-hl { animation: resEdgeHighlight 4s ease-in-out infinite; }
                .res-edge-hl-2 { animation: resEdgeHighlight 4s ease-in-out 1.2s infinite; }
                .res-edge-hl-3 { animation: resEdgeHighlight2 4s ease-in-out 2.5s infinite; }
                .res-label { animation: resLabelFade 5s ease-in-out infinite; }
                .res-label-2 { animation: resLabelFade 5s ease-in-out 1.5s infinite; }
                .res-label-3 { animation: resLabelFade 5s ease-in-out 3s infinite; }
                .res-float-1 { animation: resDotFloat 6s ease-in-out infinite; }
                .res-float-2 { animation: resDotFloat 6s ease-in-out 2s infinite; }
            `}</style>

            {/* Background */}
            <rect width="800" height="450" fill="#FFF8EA" />

            {/* Subtle dot grid */}
            <g opacity="0.06">
                {Array.from({ length: 15 }, (_, col) =>
                    Array.from({ length: 9 }, (_, row) => (
                        <circle
                            key={`dot-${col}-${row}`}
                            cx={50 + col * 50}
                            cy={25 + row * 50}
                            r="1"
                            fill="#181818"
                        />
                    ))
                )}
            </g>

            {/* Connection lines */}
            {connections.map(([fromIdx, toIdx, highlighted], i) => {
                const from = nodes[fromIdx];
                const to = nodes[toIdx];
                const hlClass = highlighted
                    ? i % 3 === 0 ? 'res-edge-hl' : i % 3 === 1 ? 'res-edge-hl-2' : 'res-edge-hl-3'
                    : '';
                return (
                    <line
                        key={`edge-${i}`}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke={highlighted ? '#FF6A00' : '#C2410C'}
                        strokeOpacity={highlighted ? 0.25 : 0.1}
                        strokeWidth={highlighted ? 1.5 : 0.8}
                        className={hlClass}
                    />
                );
            })}

            {/* Outer rings for key nodes */}
            {/* Paper node (n1) */}
            <circle cx={400} cy={200} r="28" stroke="#FF6A00" strokeWidth="1" strokeOpacity="0.2" className="res-ring-1" />
            <circle cx={400} cy={200} r="36" stroke="#FF6A00" strokeWidth="0.5" strokeOpacity="0.08" />

            {/* Aplicação node (n3) */}
            <circle cx={560} cy={155} r="24" stroke="#FF6A00" strokeWidth="0.8" strokeOpacity="0.18" className="res-ring-2" />

            {/* Método node (n2) */}
            <circle cx={260} cy={140} r="22" stroke="#C2410C" strokeWidth="0.8" strokeOpacity="0.15" className="res-ring-3" />

            {/* Node circles */}
            {nodes.map((node, i) => {
                const pulseClass = i === 0 ? 'res-node-pulse-1' : i === 2 ? 'res-node-pulse-2' : i === 4 ? 'res-node-pulse-3' : '';
                return (
                    <g key={node.id} className={pulseClass}>
                        <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.r}
                            fill={node.color}
                            fillOpacity={0.85}
                        />
                        {/* Inner highlight */}
                        <circle
                            cx={node.x - node.r * 0.25}
                            cy={node.y - node.r * 0.3}
                            r={node.r * 0.35}
                            fill="white"
                            fillOpacity={0.2}
                        />
                    </g>
                );
            })}

            {/* Labels for key nodes */}
            <g className="res-label">
                <rect x="416" y="186" width="54" height="20" rx="4" fill="#181818" fillOpacity="0.06" />
                <text x="422" y="200" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fontWeight="500" fill="#C2410C" fillOpacity="0.9" letterSpacing="0.5">
                    Paper
                </text>
            </g>

            <g className="res-label-2">
                <rect x="206" y="118" width="62" height="20" rx="4" fill="#181818" fillOpacity="0.06" />
                <text x="212" y="132" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fontWeight="500" fill="#C2410C" fillOpacity="0.9" letterSpacing="0.5">
                    Método
                </text>
            </g>

            <g className="res-label-3">
                <rect x="574" y="140" width="78" height="20" rx="4" fill="#181818" fillOpacity="0.06" />
                <text x="580" y="154" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fontWeight="500" fill="#FF6A00" fillOpacity="0.9" letterSpacing="0.5">
                    Aplicação
                </text>
            </g>

            <g className="res-label-2">
                <rect x="520" y="306" width="52" height="20" rx="4" fill="#181818" fillOpacity="0.06" />
                <text x="526" y="320" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fontWeight="500" fill="#FF8A1C" fillOpacity="0.9" letterSpacing="0.5">
                    Dados
                </text>
            </g>

            {/* Decorative floating particles */}
            <g className="res-float-1" opacity="0.25">
                <circle cx="120" cy="80" r="2" fill="#C2410C" />
                <circle cx="680" cy="400" r="2" fill="#FF6A00" />
                <circle cx="60" cy="400" r="1.5" fill="#FF8A1C" />
            </g>
            <g className="res-float-2" opacity="0.2">
                <circle cx="740" cy="80" r="1.5" fill="#C2410C" />
                <circle cx="400" cy="420" r="2" fill="#FF6A00" />
                <circle cx="200" cy="50" r="1.5" fill="#FF8A1C" />
            </g>

            {/* Corner brackets — research style */}
            <g opacity="0.1">
                <line x1="25" y1="25" x2="25" y2="50" stroke="#C2410C" strokeWidth="1" />
                <line x1="25" y1="25" x2="50" y2="25" stroke="#C2410C" strokeWidth="1" />
            </g>
            <g opacity="0.1">
                <line x1="775" y1="25" x2="775" y2="50" stroke="#C2410C" strokeWidth="1" />
                <line x1="775" y1="25" x2="750" y2="25" stroke="#C2410C" strokeWidth="1" />
            </g>
            <g opacity="0.1">
                <line x1="25" y1="425" x2="25" y2="400" stroke="#C2410C" strokeWidth="1" />
                <line x1="25" y1="425" x2="50" y2="425" stroke="#C2410C" strokeWidth="1" />
            </g>
            <g opacity="0.1">
                <line x1="775" y1="425" x2="775" y2="400" stroke="#C2410C" strokeWidth="1" />
                <line x1="775" y1="425" x2="750" y2="425" stroke="#C2410C" strokeWidth="1" />
            </g>

            {/* Bottom status bar */}
            <rect x="30" y="435" width="740" height="0.5" fill="#C2410C" fillOpacity="0.1" />
            <text x="36" y="446" fontFamily="'IBM Plex Mono', monospace" fontSize="8" fill="#C2410C" fillOpacity="0.25" letterSpacing="1">
                BLINK RESEARCH — GRAFO DE CONHECIMENTO
            </text>

            {/* Soft vignette */}
            <defs>
                <radialGradient id="researchVignette" cx="50%" cy="50%" r="65%">
                    <stop offset="0%" stopColor="#FFF8EA" stopOpacity="0" />
                    <stop offset="100%" stopColor="#FFF8EA" stopOpacity="0.45" />
                </radialGradient>
            </defs>
            <rect width="800" height="450" fill="url(#researchVignette)" />
        </svg>
    );
}
