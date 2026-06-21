"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * MascotPlaceholder per CLAUDE.md:
 * - Simple original placeholder mascot components only
 * - AI hedgehog / robot-hog doodle
 * - Small and marginal, like sketchbook decoration
 * - Rendered as inline SVG, flat color illustration
 * - Do not import external mascot images
 */
function MascotPlaceholder({
  className,
  size = "md",
  mood = "neutral",
  ...props
}: React.ComponentProps<"svg"> & {
  size?: "sm" | "md" | "lg";
  mood?: "neutral" | "happy" | "thinking" | "working";
}) {
  const dimensions = {
    sm: { width: 48, height: 48 },
    md: { width: 80, height: 80 },
    lg: { width: 120, height: 120 },
  };

  const { width, height } = dimensions[size];

  return (
    <svg
      data-slot="mascot"
      width={width}
      height={height}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label={`Hedgehog mascot (${mood})`}
      role="img"
      {...props}
    >
      {/* Body — round hedgehog shape */}
      <ellipse cx="40" cy="46" rx="22" ry="18" fill="#e5e7e0" stroke="#23251d" strokeWidth="1.5" />

      {/* Spines / quills */}
      <path d="M22 36 L18 24 L26 32Z" fill="#bfc1b7" stroke="#23251d" strokeWidth="1" strokeLinejoin="round" />
      <path d="M28 30 L26 17 L34 27Z" fill="#bfc1b7" stroke="#23251d" strokeWidth="1" strokeLinejoin="round" />
      <path d="M35 27 L36 14 L42 25Z" fill="#bfc1b7" stroke="#23251d" strokeWidth="1" strokeLinejoin="round" />
      <path d="M43 27 L46 15 L50 26Z" fill="#bfc1b7" stroke="#23251d" strokeWidth="1" strokeLinejoin="round" />
      <path d="M50 30 L55 18 L56 32Z" fill="#bfc1b7" stroke="#23251d" strokeWidth="1" strokeLinejoin="round" />
      <path d="M56 36 L62 26 L60 38Z" fill="#bfc1b7" stroke="#23251d" strokeWidth="1" strokeLinejoin="round" />

      {/* Face area — lighter belly */}
      <ellipse cx="40" cy="48" rx="14" ry="11" fill="#fcfcfa" stroke="#23251d" strokeWidth="1" />

      {/* Eyes */}
      {mood === "happy" ? (
        <>
          <path d="M34 44 Q36 42 38 44" stroke="#23251d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M42 44 Q44 42 46 44" stroke="#23251d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      ) : mood === "thinking" ? (
        <>
          <circle cx="36" cy="44" r="2" fill="#23251d" />
          <circle cx="44" cy="44" r="2" fill="#23251d" />
          <circle cx="36" cy="43" r="0.7" fill="#fcfcfa" />
          <circle cx="44" cy="43" r="0.7" fill="#fcfcfa" />
          {/* Thinking dots */}
          <circle cx="56" cy="32" r="1.5" fill="#bfc1b7" />
          <circle cx="60" cy="27" r="2" fill="#bfc1b7" />
          <circle cx="65" cy="21" r="2.5" fill="#bfc1b7" />
        </>
      ) : (
        <>
          <circle cx="36" cy="44" r="2" fill="#23251d" />
          <circle cx="44" cy="44" r="2" fill="#23251d" />
          <circle cx="36" cy="43" r="0.7" fill="#fcfcfa" />
          <circle cx="44" cy="43" r="0.7" fill="#fcfcfa" />
        </>
      )}

      {/* Nose */}
      <ellipse cx="40" cy="48" rx="1.5" ry="1" fill="#23251d" />

      {/* Mouth */}
      {mood === "happy" ? (
        <path d="M37 51 Q40 54 43 51" stroke="#23251d" strokeWidth="1" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M38 51 L42 51" stroke="#23251d" strokeWidth="1" strokeLinecap="round" />
      )}

      {/* Robot antenna — the "robot-hog" touch */}
      <line x1="40" y1="14" x2="40" y2="8" stroke="#23251d" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="40" cy="6" r="2.5" fill="#f7a501" stroke="#23251d" strokeWidth="1" />

      {/* Feet */}
      <ellipse cx="33" cy="62" rx="5" ry="2.5" fill="#e5e7e0" stroke="#23251d" strokeWidth="1" />
      <ellipse cx="47" cy="62" rx="5" ry="2.5" fill="#e5e7e0" stroke="#23251d" strokeWidth="1" />

      {/* Working variant: tiny laptop */}
      {mood === "working" && (
        <g transform="translate(28, 54)">
          <rect x="0" y="0" width="24" height="14" rx="1.5" fill="#23251d" stroke="#23251d" strokeWidth="1" />
          <rect x="1.5" y="1.5" width="21" height="9" rx="0.5" fill="#33342d" />
          {/* Screen glow lines */}
          <line x1="4" y1="4" x2="14" y2="4" stroke="#f7a501" strokeWidth="0.8" opacity="0.7" />
          <line x1="4" y1="6.5" x2="18" y2="6.5" stroke="#6c6e63" strokeWidth="0.8" opacity="0.5" />
          <line x1="4" y1="8.5" x2="11" y2="8.5" stroke="#2c8c66" strokeWidth="0.8" opacity="0.5" />
          {/* Keyboard base */}
          <rect x="-2" y="13" width="28" height="3" rx="0.5" fill="#4d4f46" stroke="#23251d" strokeWidth="0.5" />
        </g>
      )}
    </svg>
  );
}

export { MascotPlaceholder };
