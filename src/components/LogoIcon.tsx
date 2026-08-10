import React from 'react';

export default function LogoIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      fill="none"
    >
      <g fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M 48 24 L 28 14 L 8 24 L 8 36 L 28 26 L 48 36 Z" />
        <path d="M 48 40 L 28 30 L 8 40 L 8 52 L 32 40 L 32 76 L 48 84 Z" />
        <path d="M 52 24 L 72 14 L 92 24 L 92 36 L 72 26 L 52 36 Z" />
        <path d="M 52 40 L 72 30 L 92 40 L 92 52 L 68 40 L 68 76 L 52 84 Z" />
      </g>
    </svg>
  );
}
