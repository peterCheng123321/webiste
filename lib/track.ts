import { track as vercelTrack } from "@vercel/analytics"

/**
 * Named events for portfolio traffic analysis.
 * View page views in Vercel → Analytics; custom events under Web Analytics → Events.
 */
export type TrackEvent =
  | "cta_resume"
  | "cta_email"
  | "cta_github"
  | "cta_linkedin"
  | "cta_peteros_open"
  | "cta_full_desktop"
  | "cta_contact_submit"
  | "outbound_link"
  | "peteros_app_open"
  | "blog_list_view"
  | "blog_view"
  | "blog_scroll"
  | "blog_complete"
  | "blog_outbound"

export function track(
  event: TrackEvent,
  props?: Record<string, string | number | boolean | null>,
) {
  try {
    vercelTrack(event, props)
  } catch {
    // Analytics must never break the page.
  }
}
