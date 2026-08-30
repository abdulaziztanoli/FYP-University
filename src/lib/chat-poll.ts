/**
 * Pure polling math shared by client hooks and server code.
 *
 * Deliberately free of mongoose/model imports — `@/lib/chat` pulls in the ODM,
 * so anything a client component needs has to live here instead or the whole
 * driver ends up in the browser bundle.
 */

export type ChatRole = "company" | "student";

/** Adaptive-poll tiers, so client and server agree on the cadence. */
export const POLL_INTERVALS = {
  active: 2000,
  recent: 4000,
  warm: 8000,
  idle: 15000,
} as const;

/**
 * How fast to poll given how long ago the thread last saw traffic.
 * Pure, so it is testable and reusable by both the message stream and the inbox.
 */
export function pollIntervalFor(lastActivityAt: number | null | undefined) {
  if (!lastActivityAt) return POLL_INTERVALS.idle;
  const age = Date.now() - lastActivityAt;
  if (age < 15_000) return POLL_INTERVALS.active;
  if (age < 60_000) return POLL_INTERVALS.recent;
  if (age < 5 * 60_000) return POLL_INTERVALS.warm;
  return POLL_INTERVALS.idle;
}

/** Which denormalized counter belongs to the person *receiving* a message. */
export function unreadFieldFor(role: ChatRole) {
  return role === "company" ? "unreadForCompany" : "unreadForStudent";
}
