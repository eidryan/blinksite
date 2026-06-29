export default function RadarIllustration({ className }) {
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
                @keyframes radarSweepRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes blipPulse {
                    0%, 100% { opacity: 0.7; r: 4; }
                    50% { opacity: 1; r: 6; }
                }
                @keyframes blipPulseLarge {
                    0%, 100% { opacity: 0.5; r: 6; }
                    50% { opacity: 1; r: 9; }
                }
                @keyframes ringPulse {
                    0%, 100% { stroke-opacity: 0.25; }
                    50% { stroke-opacity: 0.5; }
                }
                @keyframes ringPulseOuter {
                    0%, 100% { stroke-opacity: 0.08; }
                    50% { stroke-opacity: 0.2; }
                }
                @keyframes labelFade {
                    0%, 100% { opacity: 0.55; }
                    50% { opacity: 0.85; }
                }
                @keyframes scanLine {
                    0% { opacity: 0.06; }
                    50% { opacity: 0.14; }
                    100% { opacity: 0.06; }
                }
                .radar-sweep-group {
                    transform-origin: 400px 225px;
                    animation: radarSweepRotate 8s linear infinite;
                }
                .blip-1 { animation: blipPulse 3s ease-in-out 0s infinite; }
                .blip-2 { animation: blipPulse 3s ease-in-out 0.6s infinite; }
                .blip-3 { animation: blipPulseLarge 4s ease-in-out 1.2s infinite; }
                .blip-4 { animation: blipPulse 3.5s ease-in-out 1.8s infinite; }
                .blip-5 { animation: blipPulse 3s ease-in-out 2.4s infinite; }
                .ring-pulse-1 { animation: ringPulse 5s ease-in-out 0s infinite; }
                .ring-pulse-2 { animation: ringPulse 5s ease-in-out 1s infinite; }
                .ring-pulse-3 { animation: ringPulseOuter 6s ease-in-out 2s infinite; }
                .radar-label { animation: labelFade 4s ease-in-out infinite; }
                .radar-label-2 { animation: labelFade 4s ease-in-out 1.5s infinite; }
                .radar-label-3 { animation: labelFade 4s ease-in-out 3s infinite; }
                .scan-line-anim { animation: scanLine 4s ease-in-out infinite; }
            `}</style>

            {/* Background */}
            <rect width="800" height="450" fill="#181818" />

            {/* Subtle grid lines */}
            <g opacity="0.06" className="scan-line-anim">
                {[100, 200, 300, 400, 500, 600, 700].map((x) => (
                    <line key={`vg-${x}`} x1={x} y1="0" x2={x} y2="450" stroke="#FF6A00" strokeWidth="0.5" />
                ))}
                {[56, 112, 168, 225, 281, 337, 393].map((y) => (
                    <line key={`hg-${y}`} x1="0" y1={y} x2="800" y2={y} stroke="#FF6A00" strokeWidth="0.5" />
                ))}
            </g>

            {/* Finer cross-hair lines through center */}
            <line x1="400" y1="30" x2="400" y2="420" stroke="#FF6A00" strokeOpacity="0.08" strokeWidth="0.5" strokeDasharray="4 8" />
            <line x1="80" y1="225" x2="720" y2="225" stroke="#FF6A00" strokeOpacity="0.08" strokeWidth="0.5" strokeDasharray="4 8" />

            {/* Concentric radar circles */}
            <circle cx="400" cy="225" r="50" stroke="#FF6A00" strokeOpacity="0.12" strokeWidth="0.5" strokeDasharray="3 6" />
            <circle cx="400" cy="225" r="90" stroke="#FF6A00" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="5 5" className="ring-pulse-1" />
            <circle cx="400" cy="225" r="140" stroke="#FF8A1C" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="6 4" className="ring-pulse-2" />
            <circle cx="400" cy="225" r="195" stroke="#FF6A00" strokeOpacity="0.12" strokeWidth="1.5" className="ring-pulse-2" />
            <circle cx="400" cy="225" r="260" stroke="#FF6A00" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="8 6" className="ring-pulse-3" />
            <circle cx="400" cy="225" r="340" stroke="#FF6A00" strokeOpacity="0.05" strokeWidth="0.5" />

            {/* Center dot */}
            <circle cx="400" cy="225" r="3" fill="#FF6A00" fillOpacity="0.6" />
            <circle cx="400" cy="225" r="7" stroke="#FF6A00" strokeWidth="0.5" strokeOpacity="0.3" />

            {/* Rotating sweep */}
            <defs>
                <linearGradient id="radarSweepGradFull" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                    <stop offset="0%" stopColor="#FF6A00" stopOpacity="0" />
                    <stop offset="100%" stopColor="#FF8A1C" stopOpacity="0.25" />
                </linearGradient>
                <clipPath id="radarClip">
                    <circle cx="400" cy="225" r="260" />
                </clipPath>
            </defs>
            <g className="radar-sweep-group" clipPath="url(#radarClip)">
                <path
                    d="M 400 225 L 660 225 A 260 260 0 0 0 583.6 41.3 Z"
                    fill="url(#radarSweepGradFull)"
                />
                {/* Sweep leading edge */}
                <line x1="400" y1="225" x2="660" y2="225" stroke="#FF8A1C" strokeWidth="1.5" strokeOpacity="0.5" />
            </g>

            {/* Data blips at various positions */}
            {/* Blip 1 — inner */}
            <circle cx="435" cy="185" r="4" fill="#FF8A1C" className="blip-1" />
            <circle cx="435" cy="185" r="10" stroke="#FF8A1C" strokeWidth="0.8" strokeOpacity="0.35" className="blip-1" />

            {/* Blip 2 — mid left */}
            <circle cx="310" cy="280" r="5" fill="#FF6A00" className="blip-2" />
            <circle cx="310" cy="280" r="13" stroke="#FF6A00" strokeWidth="0.7" strokeOpacity="0.3" className="blip-2" />

            {/* Blip 3 — larger, top-right, important */}
            <circle cx="530" cy="145" r="7" fill="#FFA52E" className="blip-3" />
            <circle cx="530" cy="145" r="16" stroke="#FFA52E" strokeWidth="1" strokeOpacity="0.4" className="blip-3" />
            <circle cx="530" cy="145" r="24" stroke="#FFA52E" strokeWidth="0.5" strokeOpacity="0.15" className="blip-3" />

            {/* Blip 4 — bottom-right */}
            <circle cx="560" cy="300" r="4" fill="#FF6A00" className="blip-4" />
            <circle cx="560" cy="300" r="11" stroke="#FF6A00" strokeWidth="0.6" strokeOpacity="0.25" className="blip-4" />

            {/* Blip 5 — near center */}
            <circle cx="380" cy="210" r="3" fill="#FF8A1C" className="blip-5" />

            {/* Blip 6 — far left static */}
            <circle cx="230" cy="175" r="4" fill="#FF6A00" fillOpacity="0.5" />
            <circle cx="230" cy="175" r="9" stroke="#FF6A00" strokeWidth="0.5" strokeOpacity="0.2" />

            {/* Blip 7 — bottom-left static */}
            <circle cx="280" cy="340" r="3" fill="#FFA52E" fillOpacity="0.4" />

            {/* Floating labels */}
            <g className="radar-label">
                <rect x="470" y="122" width="112" height="22" rx="4" fill="#FF6A00" fillOpacity="0.12" />
                <text x="476" y="137" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fill="#FF8A1C" fillOpacity="0.9" letterSpacing="0.5">
                    Sinal detectado
                </text>
            </g>

            <g className="radar-label-2">
                <rect x="236" y="260" width="76" height="22" rx="4" fill="#FF6A00" fillOpacity="0.1" />
                <text x="242" y="275" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fill="#FF6A00" fillOpacity="0.8" letterSpacing="0.5">
                    Tendência
                </text>
            </g>

            <g className="radar-label-3">
                <rect x="510" y="280" width="86" height="22" rx="4" fill="#FFA52E" fillOpacity="0.1" />
                <text x="516" y="295" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fill="#FFA52E" fillOpacity="0.7" letterSpacing="0.5">
                    Emergente
                </text>
            </g>

            {/* Top-left HUD corner bracket */}
            <g opacity="0.15">
                <line x1="30" y1="30" x2="30" y2="55" stroke="#FF6A00" strokeWidth="1" />
                <line x1="30" y1="30" x2="55" y2="30" stroke="#FF6A00" strokeWidth="1" />
            </g>
            {/* Top-right */}
            <g opacity="0.15">
                <line x1="770" y1="30" x2="770" y2="55" stroke="#FF6A00" strokeWidth="1" />
                <line x1="770" y1="30" x2="745" y2="30" stroke="#FF6A00" strokeWidth="1" />
            </g>
            {/* Bottom-left */}
            <g opacity="0.15">
                <line x1="30" y1="420" x2="30" y2="395" stroke="#FF6A00" strokeWidth="1" />
                <line x1="30" y1="420" x2="55" y2="420" stroke="#FF6A00" strokeWidth="1" />
            </g>
            {/* Bottom-right */}
            <g opacity="0.15">
                <line x1="770" y1="420" x2="770" y2="395" stroke="#FF6A00" strokeWidth="1" />
                <line x1="770" y1="420" x2="745" y2="420" stroke="#FF6A00" strokeWidth="1" />
            </g>

            {/* Bottom status bar */}
            <rect x="30" y="430" width="740" height="1" fill="#FF6A00" fillOpacity="0.08" />
            <text x="36" y="444" fontFamily="'IBM Plex Mono', monospace" fontSize="8" fill="#FF6A00" fillOpacity="0.3" letterSpacing="1">
                BLINK RADAR — MONITORAMENTO ATIVO
            </text>
            <circle cx="750" cy="441" r="3" fill="#FF6A00" fillOpacity="0.35" className="blip-1" />

            {/* Vignette overlay */}
            <defs>
                <radialGradient id="radarVignette" cx="50%" cy="50%" r="65%">
                    <stop offset="0%" stopColor="#181818" stopOpacity="0" />
                    <stop offset="100%" stopColor="#181818" stopOpacity="0.6" />
                </radialGradient>
            </defs>
            <rect width="800" height="450" fill="url(#radarVignette)" />
        </svg>
    );
}
