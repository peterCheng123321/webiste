/** PeterOS is a multi-window desktop — unusable on small screens. */
export const PETEROS_MIN_WIDTH = 900

export const PETEROS_DESKTOP_MQ = `(min-width: ${PETEROS_MIN_WIDTH}px)`

export function isPeterOSDesktopViewport(
  width = typeof window !== "undefined" ? window.innerWidth : PETEROS_MIN_WIDTH,
) {
  return width >= PETEROS_MIN_WIDTH
}
