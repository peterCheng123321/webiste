/**
 * Deloitte start — copy flips automatically on/after this calendar day
 * in Asia/Shanghai (no redeploy required if the page revalidates).
 */
export const DELOITTE_START_DATE = "2026-08-14"

/** YYYY-MM-DD in Asia/Shanghai for a given instant. */
export function shanghaiDateString(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

export function hasStartedAtDeloitte(now: Date = new Date()): boolean {
  return shanghaiDateString(now) >= DELOITTE_START_DATE
}

export function deloitteStatusLabel(now: Date = new Date()): "Incoming" | "Now" {
  return hasStartedAtDeloitte(now) ? "Now" : "Incoming"
}

export function deloitteStatusMeta(now: Date = new Date()): string {
  return hasStartedAtDeloitte(now) ? " · now" : " · incoming"
}

export function deloitteRoleLine(now: Date = new Date()): string {
  return hasStartedAtDeloitte(now)
    ? "Analyst · Technology Transformation"
    : "Incoming Analyst · Technology Transformation"
}

export function deloitteHeroPrefix(now: Date = new Date()): string {
  return hasStartedAtDeloitte(now) ? "Peter is at " : "Peter is joining "
}

export function deloitteBio(now: Date = new Date()): string {
  if (hasStartedAtDeloitte(now)) {
    return "Analyst 1 at Deloitte (Technology Transformation) in Shanghai — previously building backends and applied ML at WashU and Undergraduation.com. My work sits between reliable engineering and research: server optimization, sensor pipelines, and computer-vision segmentation for health."
  }
  return "Incoming Analyst 1 at Deloitte (Technology Transformation), full-time — previously building backends and applied ML at WashU and Undergraduation.com. My work sits between reliable engineering and research: server optimization, sensor pipelines, and computer-vision segmentation for health."
}

export function deloitteExperienceLead(now: Date = new Date()): string {
  return hasStartedAtDeloitte(now)
    ? "Full-time Analyst 1 on the Technology Transformation practice in Shanghai."
    : "Incoming full-time Analyst 1 on the Technology Transformation practice."
}

export function deloitteBootLabel(now: Date = new Date()): string {
  return hasStartedAtDeloitte(now) ? "Active" : "Next boot"
}

export function deloittePhaseLabel(now: Date = new Date()): string {
  return hasStartedAtDeloitte(now) ? "ACTIVE / LIVE" : "QUEUED / NEXT BOOT"
}

export function deloitteStationMeta(now: Date = new Date()): string {
  return hasStartedAtDeloitte(now) ? "Analyst 1 · live" : "Analyst 1 · next"
}

export function deloitteStationDetail(now: Date = new Date()): string {
  return hasStartedAtDeloitte(now)
    ? "Technology Transformation in Shanghai is the current system environment."
    : "Technology Transformation in Shanghai is the next system environment."
}

export function deloitteProcessState(now: Date = new Date()): "live" | "queued" {
  return hasStartedAtDeloitte(now) ? "live" : "queued"
}

export function deloitteMetadataDescription(now: Date = new Date()): string {
  if (hasStartedAtDeloitte(now)) {
    return "Zhongquan Cheng — Analyst 1 at Deloitte Technology Transformation in Shanghai. M.S. Computer Science at WashU. Backend engineering, applied ML, and PeterOS."
  }
  return "Zhongquan Cheng — Incoming Analyst 1 at Deloitte Technology Transformation in Shanghai. M.S. Computer Science at WashU. Backend engineering, applied ML, and PeterOS."
}
