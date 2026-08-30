import "server-only";
import mongoose from "mongoose";
import Application from "@/models/Application";
import Conversation from "@/models/Conversation";
import type { ChatRole } from "@/lib/chat-poll";

/**
 * Server-only chat helpers. The polling constants and `unreadFieldFor` live in
 * `@/lib/chat-poll` because client hooks need them and this module imports
 * mongoose — see the `server-only` guard above.
 */
export type { ChatRole };
export { POLL_INTERVALS, pollIntervalFor, unreadFieldFor } from "@/lib/chat-poll";

export function isValidId(id: string | null | undefined): id is string {
  return !!id && mongoose.Types.ObjectId.isValid(id);
}

/**
 * Chat is unlocked by an application, not by browsing. Both directions check the
 * same fact: this student applied to a job owned by this company.
 */
export async function applicationLinks(companyId: string, studentId: string) {
  return Application.exists({ company: companyId, student: studentId });
}

/**
 * Find-or-create the thread for a pair, refusing when no application links them.
 * Returns null when the pair is not allowed to talk.
 */
export async function ensureConversation(
  companyId: string,
  studentId: string
): Promise<mongoose.HydratedDocument<Record<string, unknown>> | null> {
  if (!(await applicationLinks(companyId, studentId))) return null;

  // Upsert keeps this safe when both sides open the thread at once — the unique
  // (company, student) index makes a duplicate impossible.
  return Conversation.findOneAndUpdate(
    { company: companyId, student: studentId },
    { $setOnInsert: { company: companyId, student: studentId, lastMessageAt: new Date() } },
    { new: true, upsert: true }
  );
}

/**
 * Load a thread only if the caller is one of its two participants. Returns null
 * for a missing id, a bad id, or someone else's conversation — the caller maps
 * all three to the same 404 so thread ids can't be probed.
 */
export async function getMemberConversation(
  conversationId: string,
  userId: string,
  role: ChatRole
) {
  if (!isValidId(conversationId)) return null;
  const filter =
    role === "company"
      ? { _id: conversationId, company: userId }
      : { _id: conversationId, student: userId };
  return Conversation.findOne(filter);
}

type PeerLike = {
  _id?: unknown;
  name?: string;
  email?: string;
  studentProfile?: { profilePicture?: string; university?: string; degree?: string };
  companyProfile?: { logo?: string; companyName?: string; industry?: string };
};

/** Trimmed peer shape — the inbox is polled constantly, so keep payloads small. */
export function serializePeer(peer: PeerLike | null | undefined, role: ChatRole) {
  if (!peer) return null;
  return {
    _id: String(peer._id ?? ""),
    name: peer.name ?? "",
    email: peer.email ?? "",
    avatar:
      role === "company"
        ? (peer.companyProfile?.logo ?? "")
        : (peer.studentProfile?.profilePicture ?? ""),
    subtitle:
      role === "company"
        ? (peer.companyProfile?.industry ?? "")
        : [peer.studentProfile?.degree, peer.studentProfile?.university]
            .filter(Boolean)
            .join(" · "),
  };
}

export const PEER_SELECT = "name email studentProfile companyProfile role";
