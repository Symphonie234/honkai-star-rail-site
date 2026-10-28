import type { CSSProperties } from "react";

export const colorVar = (token: string) => ({ "--c": `var(--color-${token})` }) as CSSProperties;
