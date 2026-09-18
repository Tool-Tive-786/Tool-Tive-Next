import type { SVGProps } from 'react';

interface SiteIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: string;
}

export default function SiteIcon({ name, className = '', ...props }: SiteIconProps) {
  const key = name.toLowerCase();
  let paths;

  if (key.includes('arrow-right')) {
    paths = <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>;
  } else if (key.includes('envelope')) {
    paths = <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>;
  } else if (key.includes('comment')) {
    paths = <path d="M21 12a8 8 0 0 1-8 8H6l-3 2 1-5a8.5 8.5 0 1 1 17-5Z" />;
  } else if (key.includes('home')) {
    paths = <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>;
  } else if (key.includes('search')) {
    paths = <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>;
  } else if (key.includes('book')) {
    paths = <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22Z" /></>;
  } else if (key.includes('shield') || key.includes('lock')) {
    paths = <><path d="M12 3 4.5 6v5.5c0 4.6 3 7.7 7.5 9.5 4.5-1.8 7.5-4.9 7.5-9.5V6Z" /><path d="m8.8 12 2 2 4.5-4.5" /></>;
  } else if (key.includes('globe')) {
    paths = <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21M12 3C9.7 5.5 8.5 8.5 8.5 12S9.7 18.5 12 21" /></>;
  } else if (key.includes('image') || key.includes('compress')) {
    paths = <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m4 17 5-5 3.5 3.5 2.5-2.5 5 5" /></>;
  } else if (key.includes('calculator') || key.includes('percent')) {
    paths = <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" /></>;
  } else if (key.includes('tag')) {
    paths = <><path d="M4 4h7l9 9-7 7-9-9Z" /><circle cx="8.5" cy="8.5" r="1.2" /></>;
  } else if (key.includes('robot')) {
    paths = <><rect x="4" y="8" width="16" height="11" rx="2" /><path d="M12 8V4H9M8 13h.01M16 13h.01M8 16h8" /></>;
  } else if (key.includes('gift')) {
    paths = <><rect x="3" y="9" width="18" height="12" rx="2" /><path d="M12 9v12M3 13h18M12 9H7.5a2.5 2.5 0 1 1 2-4c1.4 1.1 2.5 4 2.5 4Zm0 0h4.5a2.5 2.5 0 1 0-2-4c-1.4 1.1-2.5 4-2.5 4Z" /></>;
  } else if (key.includes('list') || key.includes('layer')) {
    paths = <><path d="M9 6h11M9 12h11M9 18h11" /><path d="m4 6 1 1 2-2M4 12h3M4 18h3" /></>;
  } else if (key.includes('trend') || key.includes('rocket')) {
    paths = <><path d="m4 16 6-6 4 4 6-7" /><path d="M15 7h5v5" /></>;
  } else if (key.includes('paper-plane')) {
    paths = <><path d="m3 11 18-8-8 18-2-7Z" /><path d="m11 14 4-4" /></>;
  } else if (key.includes('bolt')) {
    paths = <path d="m13 2-8 12h7l-1 8 8-12h-7Z" />;
  } else if (key.includes('th-large')) {
    paths = <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>;
  } else if (key.includes('check') || key.includes('certificate') || key.includes('save')) {
    paths = <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>;
  } else {
    paths = <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" /><path d="M14 3v6h6M8 13h8M8 17h6" /></>;
  }

  return (
    <svg
      className={`site-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths}
    </svg>
  );
}
