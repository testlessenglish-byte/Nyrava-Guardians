import React from "react";

export type ShieldLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface NyravaShieldSvgProps {
  level: ShieldLevel;
  className?: string;
  size?: number;
  showAura?: boolean;
}

/**
 * Production-Quality Standalone Vector SVG Renderer for 7 Nyrava Shield Levels.
 * Rendered on a 512x512 canvas with 15% safe padding, 1:1 aspect ratio, transparent background,
 * metallic gold trim, deep blue core, centered "N", and structurally evolving armor/wings/crystals.
 */
export const NyravaShieldSvg: React.FC<NyravaShieldSvgProps> = ({
  level,
  className = "w-full h-full object-contain",
  size = 512,
  showAura = true,
}) => {
  const svgId = React.useId();

  // Unique Gradient IDs per component instance to prevent SVG ID collisions
  const goldGradId = `goldGrad_${svgId}`;
  const darkGoldGradId = `darkGoldGrad_${svgId}`;
  const blueCoreId = `blueCore_${svgId}`;
  const cyanGemId = `cyanGem_${svgId}`;
  const purpleGemId = `purpleGem_${svgId}`;
  const glowFilterId = `glowFilter_${svgId}`;

  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
      aria-label={`Nyrava Shield Level ${level}`}
      role="img"
    >
      <defs>
        {/* Metallic Gold Gradient */}
        <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE885" />
          <stop offset="35%" stopColor="#F5B82E" />
          <stop offset="70%" stopColor="#C98A10" />
          <stop offset="100%" stopColor="#FFF2A3" />
        </linearGradient>

        {/* Dark Gold Shadow Gradient */}
        <linearGradient id={darkGoldGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B3770D" />
          <stop offset="100%" stopColor="#5E3A00" />
        </linearGradient>

        {/* Deep Blue Energy Core Gradient */}
        <radialGradient id={blueCoreId} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1E5BFF" />
          <stop offset="40%" stopColor="#0B2B8A" />
          <stop offset="85%" stopColor="#05123D" />
          <stop offset="100%" stopColor="#020921" />
        </radialGradient>

        {/* Cyan Crystal Gem Gradient */}
        <linearGradient id={cyanGemId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7DF9FF" />
          <stop offset="50%" stopColor="#00BFFF" />
          <stop offset="100%" stopColor="#005F87" />
        </linearGradient>

        {/* Purple Crystal Gem Gradient */}
        <linearGradient id={purpleGemId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0B0FF" />
          <stop offset="50%" stopColor="#9932CC" />
          <stop offset="100%" stopColor="#4B0082" />
        </linearGradient>

        {/* High-Glow Filter */}
        <filter id={glowFilterId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* BACKGROUND AURA / PARTICLES (Level 7 & showAura) */}
      {level === 7 && showAura && (
        <g filter={`url(#${glowFilterId})`} opacity="0.6">
          <circle cx="256" cy="256" r="210" fill="#00BFFF" opacity="0.15" />
          <polygon points="256,20 280,80 340,30 310,95 390,60 340,120 420,110" fill="url(#goldGradId)" opacity="0.4" />
          {/* Floating Energy Particles */}
          <circle cx="120" cy="140" r="4" fill="#7DF9FF" />
          <circle cx="390" cy="130" r="5" fill="#E0B0FF" />
          <circle cx="90" cy="320" r="4" fill="#F5B82E" />
          <circle cx="420" cy="310" r="5" fill="#7DF9FF" />
          <circle cx="256" cy="460" r="6" fill="#F5B82E" />
        </g>
      )}

      {/* LEVEL 7 — LEGENDARY HALO FRAME & WINGS */}
      {level === 7 && (
        <g>
          {/* Golden Outer Wing Span */}
          <path
            d="M 256,45 C 160,20 70,80 40,180 C 20,250 40,340 100,410 L 140,370 C 90,320 80,240 100,190 C 130,120 200,80 256,85 C 312,80 382,120 412,190 C 432,240 422,320 372,370 L 412,410 C 472,340 492,250 472,180 C 442,80 352,20 256,45 Z"
            fill={`url(#${goldGradId})`}
            stroke="#FFF2A3"
            strokeWidth="3"
          />
          {/* Inner Wing Feathers Left */}
          <path d="M 100,190 L 50,230 L 110,260 L 60,300 L 130,320" fill={`url(#${darkGoldGradId})`} />
          {/* Inner Wing Feathers Right */}
          <path d="M 412,190 L 462,230 L 402,260 L 452,300 L 382,320" fill={`url(#${darkGoldGradId})`} />
        </g>
      )}

      {/* LEVEL 5 & 6 — WINGS & FLANKING ARMOR */}
      {(level === 5 || level === 6) && (
        <g>
          {/* Flanking Gold Wings */}
          <path
            d="M 256,70 C 180,50 100,100 70,190 C 50,250 80,330 130,380 L 160,340 C 120,300 100,240 115,195 C 135,135 190,95 256,100 C 322,95 377,135 397,195 C 412,240 392,300 352,340 L 382,380 C 432,330 462,250 442,190 C 412,100 332,50 256,70 Z"
            fill={`url(#${goldGradId})`}
          />
        </g>
      )}

      {/* LEVEL 4 — REINFORCED ANGULAR SHOULDER ARMOR */}
      {level >= 4 && (
        <g>
          {/* Upper Left Shoulder Plate */}
          <polygon points="120,130 180,90 190,140 135,170" fill={`url(#${darkGoldGradId})`} stroke={`url(#${goldGradId})`} strokeWidth="4" />
          {/* Upper Right Shoulder Plate */}
          <polygon points="392,130 332,90 322,140 377,170" fill={`url(#${darkGoldGradId})`} stroke={`url(#${goldGradId})`} strokeWidth="4" />
        </g>
      )}

      {/* MAIN SHIELD BASE CONTAINER (Levels 1 - 7) */}
      <g>
        {/* Outer Shield Outline */}
        <path
          d="M 256,90 L 380,140 C 380,270 340,370 256,440 C 172,370 132,270 132,140 Z"
          fill={`url(#${darkGoldGradId})`}
          stroke={`url(#${goldGradId})`}
          strokeWidth={level >= 3 ? "14" : "10"}
          strokeLinejoin="round"
        />

        {/* Level 2+ Riveted Outer Border */}
        {level >= 2 && (
          <path
            d="M 256,106 L 364,150 C 364,260 328,350 256,416 C 184,350 148,260 148,150 Z"
            fill="none"
            stroke={`url(#${goldGradId})`}
            strokeWidth="6"
            strokeDasharray={level >= 2 ? "12, 8" : "none"}
          />
        )}

        {/* Blue Energy Core Interior */}
        <path
          d="M 256,115 L 354,155 C 354,252 320,338 256,398 C 192,338 158,252 158,155 Z"
          fill={`url(#${blueCoreId})`}
          stroke="#00BFFF"
          strokeWidth={level >= 3 ? "4" : "2"}
        />

        {/* Inner Glowing Lattice / Rings (Level 3+) */}
        {level >= 3 && (
          <circle cx="256" cy="245" r="75" fill="none" stroke="#00BFFF" strokeWidth="2" opacity="0.5" strokeDasharray="6,4" />
        )}
        {level >= 5 && (
          <circle cx="256" cy="245" r="95" fill="none" stroke="#7DF9FF" strokeWidth="2" opacity="0.6" strokeDasharray="10,6" />
        )}

        {/* CENTER NYRAVA "N" EMBLEM */}
        <g transform="translate(256, 245) scale(1.15) translate(-256, -245)">
          {/* Shadow "N" */}
          <path
            d="M 215,185 L 238,185 L 275,270 L 275,185 L 297,185 L 297,305 L 274,305 L 237,220 L 237,305 L 215,305 Z"
            fill="#020921"
            opacity="0.7"
            transform="translate(3, 4)"
          />
          {/* Golden "N" Emblem */}
          <path
            d="M 215,185 L 238,185 L 275,270 L 275,185 L 297,185 L 297,305 L 274,305 L 237,220 L 237,305 L 215,305 Z"
            fill={`url(#${goldGradId})`}
            stroke="#FFF2A3"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>

        {/* LEVEL 3 & 4 — TOP CYAN CRYSTAL GEM */}
        {(level === 3 || level === 4) && (
          <polygon points="256,70 272,95 256,120 240,95" fill={`url(#${cyanGemId})`} stroke="#FFF" strokeWidth="2" />
        )}

        {/* LEVEL 5, 6 & 7 — TOP & ACCENT PURPLE CRYSTAL GEMS */}
        {level >= 5 && (
          <g>
            {/* Top Crown Purple Gem */}
            <polygon points="256,50 276,80 256,110 236,80" fill={`url(#${purpleGemId})`} stroke="#FFF2A3" strokeWidth="2.5" filter={`url(#${glowFilterId})`} />
          </g>
        )}
        {(level === 6 || level === 7) && (
          <g>
            {/* Bottom Point Purple Gem */}
            <polygon points="256,415 270,435 256,455 242,435" fill={`url(#${purpleGemId})`} stroke="#FFF2A3" strokeWidth="2" />
          </g>
        )}
      </g>
    </svg>
  );
};
