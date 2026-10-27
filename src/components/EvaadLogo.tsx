import React, { useId } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface EvaadLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: string;
}

/**
 * Evaad Brand Emblem:
 * - A straight, two-headed horizontal arrow at the base with the signature
 *   e-vad poll bar gradient (#0284c7 -> #0ea5e9 -> #6366f1 -> #e11d48 -> #9f1239)
 *   flowing seamlessly from the left arrow (FOR) to the right arrow (AGAINST),
 *   joined in the middle.
 * - A bold semicircular arch rising above the straight arrow like an upper eyelid.
 * - Inside the semicircle, resting on top of the arrow shaft, is the circular
 *   teal/cyan Truth Eye iris and dark pupil — opening your eye to both sides.
 */
export const EvaadLogo: React.FC<EvaadLogoProps> = ({
  className = '',
  size = 28,
  showText = true,
  textSize = 'text-lg sm:text-xl',
}) => {
  const { isDark } = useTheme();
  const uid = useId().replace(/:/g, '');
  const strokeColor = isDark ? '#0f172a' : '#2c353d';
  const outerRimStroke = isDark ? '#334155' : '#2c353d';

  const poleGradId = `evaadPoleArrow_${uid}`;
  const irisGradId = `evaadIrisGrad_${uid}`;

  return (
    <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
      <svg
        width={Math.round(size * 1.45)}
        height={size}
        viewBox="0 0 88 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
        aria-label="evaad logo"
      >
        <defs>
          {/* Seamless Poll-Bar Gradient across the Two-Headed Arrow */}
          <linearGradient id={poleGradId} x1="5" y1="40" x2="83" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="32%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="68%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          {/* Center Eye Iris Gradient (Teal/Cyan) */}
          <radialGradient id={irisGradId} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="65%" stopColor="#45b1a8" />
            <stop offset="100%" stopColor="#0d9488" />
          </radialGradient>
        </defs>

        {/* 1. UPPER SEMICIRCULAR ARCH (Eyelid Band resting on the arrow shaft) */}
        <path
          d="M 18 35 A 26 26 0 0 1 70 35 L 62.5 35 A 18.5 18.5 0 0 0 25.5 35 Z"
          fill={isDark ? '#f1f5f9' : '#f5f2dc'}
          stroke={outerRimStroke}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* 2. CENTRAL EYE IRIS & PUPIL (Inside the semicircle, resting on the arrow) */}
        <circle
          cx="44"
          cy="25"
          r="11.5"
          fill={`url(#${irisGradId})`}
          stroke={outerRimStroke}
          strokeWidth="2.4"
        />
        {/* Dark Center Pupil */}
        <circle
          cx="44"
          cy="25"
          r="4.5"
          fill="#263238"
        />
        {/* Subtle Eye Catchlight */}
        <circle
          cx="46.2"
          cy="22.8"
          r="1.4"
          fill="#ffffff"
          opacity="0.9"
        />

        {/* 3. STRAIGHT TWO-HEADED HORIZONTAL ARROW WITH SEAMLESS POLL GRADIENT */}
        <path
          d="M 5 40 L 22 26.5 L 22 35 L 66 35 L 66 26.5 L 83 40 L 66 53.5 L 66 45 L 22 45 L 22 53.5 Z"
          fill={`url(#${poleGradId})`}
          stroke={strokeColor}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* Center Join Line where the 2 opposing arrows meet */}
        <line
          x1="44"
          y1="35"
          x2="44"
          y2="45"
          stroke={outerRimStroke}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>

      {/* Brand Wordmark */}
      {showText && (
        <span
          className={`font-black tracking-tight flex items-center leading-none ${
            isDark ? 'text-white' : 'text-slate-900'
          } ${textSize}`}
        >
          evaad
        </span>
      )}
    </div>
  );
};
