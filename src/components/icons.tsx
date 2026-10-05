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
export const FitIcon = () => (
  <Icon><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Icon>
);
