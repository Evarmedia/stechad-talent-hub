
import React from "react";

const STECHADLogo: React.FC<{ className?: string; size?: number }> = ({ className = "", size = 48 }) => (
  <svg
    width={size}
    height={size * 0.8}
    viewBox="0 0 210 160"
    fill="none"
    className={className}
    aria-label="STECHAD"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Abstract logo: stylized S, deep red & dark gray */}
    <rect width="210" height="160" rx="24" fill="#8B0000" />
    <path
      d="M65 110Q110 140 145 80Q155 60 120 45Q90 35 90 60Q90 75 117 85"
      stroke="#fff"
      strokeWidth="10"
      fill="none"
      strokeLinecap="round"
    />
    <text
      x="50%"
      y="78%"
      textAnchor="middle"
      alignmentBaseline="central"
      fontSize="2.1rem"
      fill="#fff"
      fontFamily="'Inter', 'Roboto', sans-serif"
      letterSpacing="0.2em"
      fontWeight="600"
    >
      STECHAD
    </text>
  </svg>
);

export default STECHADLogo;
