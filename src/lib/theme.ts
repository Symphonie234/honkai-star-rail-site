import type { CSSProperties } from "react";

/**
 * Sets `--c` to a theme color token (an element slug like "fire", or a world color
 * like "cyan") so children can style against `var(--c)`.
 */
export const colorVar = (token: string) => ({ "--c": `var(--color-${token})` }) as CSSProperties;
