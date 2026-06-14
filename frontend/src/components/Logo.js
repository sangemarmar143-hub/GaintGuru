"use client";

export default function Logo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GanitGuru logo"
    >
      {/* Saffron circle background */}
      <circle cx="20" cy="20" r="20" fill="#ff6f00" />
      {/* π symbol */}
      <text
        x="7"
        y="27"
        fontFamily="Georgia, serif"
        fontSize="22"
        fontWeight="bold"
        fill="white"
      >
        π
      </text>
      {/* Small AI spark dot */}
      <circle cx="33" cy="10" r="5" fill="#ffd5a8" />
      <text x="30" y="14" fontFamily="Inter, sans-serif" fontSize="7" fontWeight="bold" fill="#7d3200">
        AI
      </text>
    </svg>
  );
}
