import type { SVGProps } from "react";

/** Small stroke icons for UI controls. Decorative: label the control, not the icon. */
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ExpandIcon = () => (
  <Icon><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></Icon>
);
export const CloseIcon = () => (
  <Icon><path d="M18 6 6 18M6 6l12 12" /></Icon>
);
export const ZoomInIcon = () => (
  <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8v6M8 11h6" /></Icon>
);
export const ZoomOutIcon = () => (
  <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M8 11h6" /></Icon>
);
export const EnterFullscreenIcon = () => (
  <Icon><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></Icon>
);
export const ExitFullscreenIcon = () => (
  <Icon><path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" /></Icon>
);
export const GridIcon = () => (
  <Icon><rect x="3" y="3" width="7.5" height="9" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="9" rx="1.5" /><path d="M3 16h7.5M3 20h5M13.5 16H21M13.5 20h5" /></Icon>
);
export const CompactIcon = () => (
  <Icon><rect x="3" y="3" width="5" height="5" rx="1" /><rect x="9.5" y="3" width="5" height="5" rx="1" /><rect x="16" y="3" width="5" height="5" rx="1" /><rect x="3" y="10" width="5" height="5" rx="1" /><rect x="9.5" y="10" width="5" height="5" rx="1" /><rect x="16" y="10" width="5" height="5" rx="1" /><rect x="3" y="17" width="5" height="4" rx="1" /><rect x="9.5" y="17" width="5" height="4" rx="1" /><rect x="16" y="17" width="5" height="4" rx="1" /></Icon>
);
export const ListIcon = () => (
  <Icon><circle cx="5" cy="6" r="1.6" /><circle cx="5" cy="12" r="1.6" /><circle cx="5" cy="18" r="1.6" /><path d="M9.5 6H21M9.5 12H21M9.5 18H21" /></Icon>
);
export const FitIcon = () => (
  <Icon><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Icon>
);
export const ChevronLeftIcon = () => (
  <Icon><path d="m15 18-6-6 6-6" /></Icon>
);
export const ChevronRightIcon = () => (
  <Icon><path d="m9 18 6-6-6-6" /></Icon>
);
export const ChevronDownIcon = () => (
  <Icon><path d="m6 9 6 6 6-6" /></Icon>
);
export const SearchIcon = () => (
  <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
);
export const LayersIcon = () => (
  <Icon><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></Icon>
);
export const PinIcon = () => (
  <Icon><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11Z" /><circle cx="12" cy="10" r="2.2" /></Icon>
);
export const ImageIcon = () => (
  <Icon><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 17-5-5-8 8" /></Icon>
);
