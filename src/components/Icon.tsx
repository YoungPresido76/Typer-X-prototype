import type { ReactElement } from 'react';
import type { IconName } from '../types/game';

interface IconProps {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}

const FILLED: ReadonlySet<IconName> = new Set<IconName>(['flame', 'bolt', 'more', 'grid', 'shift', 'send']);

function glyph(name: IconName): ReactElement {
  switch (name) {
    case 'back':
      return <path d="M15 5l-7 7 7 7" />;
    case 'chevron':
      return <path d="M9 5l7 7-7 7" />;
    case 'send':
      return <path d="M3.4 20.3 21 12 3.4 3.7l.1 6.4 10.9 1.9-10.9 1.9z" />;
    case 'paperclip':
      return <path d="M21 11.5l-8.6 8.6a5 5 0 0 1-7.1-7.1l9-9a3.3 3.3 0 0 1 4.7 4.7l-9 9a1.7 1.7 0 0 1-2.4-2.4l8.3-8.3" />;
    case 'phone':
      return <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />;
    case 'video':
      return (
        <>
          <rect x="2" y="6" width="13" height="12" rx="2" />
          <path d="M15 10l6-3v10l-6-3" />
        </>
      );
    case 'more':
      return (
        <>
          <circle cx="12" cy="5" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="12" cy="19" r="1.7" />
        </>
      );
    case 'smile':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14a4.5 4.5 0 0 0 8 0" />
          <path d="M9 9.5h.01M15 9.5h.01" />
        </>
      );
    case 'clipboard':
      return (
        <>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <rect x="9" y="2" width="6" height="4" rx="1" />
        </>
      );
    case 'mic':
      return (
        <>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </>
      );
    case 'translate':
      return (
        <>
          <path d="M4 5h9M8.5 3v2M6 5c.5 3.5 3 6 6 7.5M12 5c-.5 3.5-3 6-7 8" />
          <path d="M12 21l4.5-10L21 21M13.8 17h5.4" />
        </>
      );
    case 'grid':
      return (
        <>
          <circle cx="5.5" cy="5.5" r="1.7" />
          <circle cx="12" cy="5.5" r="1.7" />
          <circle cx="18.5" cy="5.5" r="1.7" />
          <circle cx="5.5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="18.5" cy="12" r="1.7" />
          <circle cx="5.5" cy="18.5" r="1.7" />
          <circle cx="12" cy="18.5" r="1.7" />
          <circle cx="18.5" cy="18.5" r="1.7" />
        </>
      );
    case 'keyboard':
      return (
        <>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7.5 14h9" />
        </>
      );
    case 'shirt':
      return <path d="M8 3l-5 3 2 4 3-1v11h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z" />;
    case 'briefcase':
      return (
        <>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
        </>
      );
    case 'chart':
      return <path d="M6 20V11M12 20V4M18 20v-6" />;
    case 'gear':
      return (
        <>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
          <circle cx="12" cy="12" r="6.6" />
        </>
      );
    case 'home':
      return <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />;
    case 'star':
      return <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" />;
    case 'menu':
      return <path d="M4 6h16M4 12h16M4 18h16" />;
    case 'flame':
      return <path d="M12 2c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .2 1.5 1 2 2 2 0-3-1-5 1-8z" />;
    case 'bolt':
      return <path d="M13 2L4 14h7l-1 8 9-12h-7z" />;
    case 'trophy':
      return (
        <>
          <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
          <path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 21h8M10 18h4" />
        </>
      );
    case 'doc':
      return <path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" />;
    case 'target':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.2" />
        </>
      );
    case 'lock':
      return (
        <>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </>
      );
    case 'check':
      return <path d="M5 12.5l4.5 4.5L19 7" />;
    case 'palette':
      return (
        <>
          <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-.7-1.6-.7-2.6c0-1 .8-1.6 1.8-1.6H18a3 3 0 0 0 3-3c0-5-4-8.8-9-8.8z" />
          <path d="M7.5 11h.01M10 7.5h.01M14.5 7.5h.01" />
        </>
      );
    case 'sparkles':
      return <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />;
    case 'image':
      return (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="M21 16l-5-5-8 9" />
        </>
      );
    case 'volume':
      return <path d="M4 9v6h4l5 4V5L8 9H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />;
    case 'mute':
      return <path d="M4 9v6h4l5 4V5L8 9H4zM17 9l5 6M22 9l-5 6" />;
    case 'diamond':
      return <path d="M12 3l8 6-8 12L4 9z" />;
    case 'shift':
      return <path d="M12 4l8 9h-5v7H9v-7H4z" />;
    case 'backspace':
      return <path d="M9 5h12v14H9L3 12zM13 9l4 6M17 9l-4 6" />;
    case 'enter':
      return <path d="M20 5v7H6M10 8l-4 4 4 4" />;
    case 'square':
      return <rect x="4" y="4" width="16" height="16" rx="3" />;
    case 'crown':
      return <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" />;
    case 'close':
      return <path d="M6 6l12 12M18 6L6 18" />;
    case 'reset':
      return <path d="M4 4v6h6M5 14a8 8 0 1 0 2-7" />;
    case 'arrowUp':
      return <path d="M12 19V5M6 11l6-6 6 6" />;
    case 'arrowDown':
      return <path d="M12 5v14M6 13l6 6 6-6" />;
    default:
      return <circle cx="12" cy="12" r="3" />;
  }
}

export function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.8 }: IconProps): ReactElement {
  const filled = FILLED.has(name);
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {glyph(name)}
    </svg>
  );
}
