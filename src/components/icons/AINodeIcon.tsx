'use client';

import React from 'react';

type Variant = 'cluster' | 'vault' | 'upload' | 'link' | 'shield' | 'report';

export default function AINodeIcon({
  variant = 'cluster',
  size = 20,
  className = '',
  glow = false,
}: {
  variant?: Variant;
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className,
    style: glow ? ({ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.35))' } as any) : undefined,
  };

  const stroke = 'currentColor';

  if (variant === 'vault') {
    return (
      <svg {...common}>
        <path d="M5.5 9.5c0-2.2 3-4 6.5-4s6.5 1.8 6.5 4-3 4-6.5 4-6.5-1.8-6.5-4z" stroke={stroke} strokeWidth="1.6" />
        <path d="M5.5 9.5v5c0 2.2 3 4 6.5 4s6.5-1.8 6.5-4v-5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="8.2" cy="9.2" r="1.1" fill={stroke} opacity="0.85" />
        <circle cx="15.8" cy="9.2" r="1.1" fill={stroke} opacity="0.85" />
      </svg>
    );
  }

  if (variant === 'upload') {
    return (
      <svg {...common}>
        <path d="M12 16V7" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8.5 10.5 12 7l3.5 3.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 17.5c0 1.4 1.1 2.5 2.5 2.5h7c1.4 0 2.5-1.1 2.5-2.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="7.5" cy="6.5" r="1.2" fill={stroke} opacity="0.9" />
        <circle cx="16.5" cy="6.5" r="1.2" fill={stroke} opacity="0.9" />
      </svg>
    );
  }

  if (variant === 'link') {
    return (
      <svg {...common}>
        <circle cx="7" cy="12" r="2" stroke={stroke} strokeWidth="1.6" />
        <circle cx="17" cy="12" r="2" stroke={stroke} strokeWidth="1.6" />
        <path d="M9 12h6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="6.5" r="1.2" fill={stroke} opacity="0.9" />
        <path d="M12 7.7v2.1" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
      </svg>
    );
  }

  if (variant === 'shield') {
    return (
      <svg {...common}>
        <path
          d="M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3z"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="10.5" r="1.1" fill={stroke} opacity="0.9" />
        <circle cx="15" cy="10.5" r="1.1" fill={stroke} opacity="0.9" />
        <path d="M10.2 13.2 12 15l1.8-1.8" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      </svg>
    );
  }

  if (variant === 'report') {
    return (
      <svg {...common}>
        <path d="M7 3h7l3 3v15H7V3z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 3v3h3" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9.5 12.5l2-2 1.6 1.6 2.4-2.4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="17" r="1.1" fill={stroke} opacity="0.9" />
        <circle cx="12" cy="17" r="1.1" fill={stroke} opacity="0.7" />
        <circle cx="15" cy="17" r="1.1" fill={stroke} opacity="0.5" />
      </svg>
    );
  }

  // cluster (default)
  return (
    <svg {...common}>
      <circle cx="7" cy="12" r="1.4" fill={stroke} opacity="0.9" />
      <circle cx="12" cy="7" r="1.4" fill={stroke} opacity="0.9" />
      <circle cx="17" cy="12" r="1.4" fill={stroke} opacity="0.9" />
      <circle cx="12" cy="17" r="1.4" fill={stroke} opacity="0.7" />
      <path d="M8.2 11.4 10.8 8.2M13.2 8.2l2.6 3.2M8.6 12.8 11 15.4M13 15.4l2.4-2.6" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}
