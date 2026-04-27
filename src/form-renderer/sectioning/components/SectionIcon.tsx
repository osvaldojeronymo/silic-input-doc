import type { IconName } from '../types';

interface SectionIconProps {
  name: IconName;
}

export function SectionIcon({ name }: SectionIconProps) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true
  };

  switch (name) {
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      );
    case 'currency':
      return (
        <svg {...common}>
          <path d="M12 2v20M17 6.5a4 4 0 0 0-4-2.5c-2.2 0-4 1.4-4 3.2 0 2 1.8 2.8 4 3.3s4 1.3 4 3.4c0 1.8-1.8 3.1-4 3.1a4.8 4.8 0 0 1-4.3-2.3" />
        </svg>
      );
    case 'document-check':
      return (
        <svg {...common}>
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
          <path d="M14 2v5h5M9 14l2 2 4-4" />
        </svg>
      );
    case 'user-switch':
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="3" />
          <path d="M3 19c1.4-2.7 3.1-4 5-4s3.6 1.3 5 4M14 8h7M18 5l3 3-3 3" />
        </svg>
      );
    case 'paperclip':
    default:
      return (
        <svg {...common}>
          <path d="M7 13.5 14.8 5.7a3.5 3.5 0 1 1 5 5l-9.2 9.2a5 5 0 1 1-7.1-7.1l8.8-8.8" />
        </svg>
      );
  }
}
