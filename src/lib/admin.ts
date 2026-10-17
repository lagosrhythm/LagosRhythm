// Single source of truth for who counts as a Lagos Rhythm admin.
// Override with a comma-separated ADMIN_EMAILS (server) / NEXT_PUBLIC_ADMIN_EMAILS (client) env var.
const DEFAULT_ADMIN_EMAILS = ["chiscookeke11@gmail.com", "damola-o@lagosrhythm.com"]

const configured = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export const ADMIN_EMAILS = configured.length > 0 ? configured : DEFAULT_ADMIN_EMAILS

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.trim().toLowerCase())
}
