import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Conversation from "@/models/Conversation";
import { getCurrentUser } from "@/lib/auth";
import { conversationCreateSchema } from "@/lib/validators";
import { badRequest, forbidden, unauthorized } from "@/lib/http";
import {
  ensureConversation,
  isValidId,
  PEER_SELECT,
  serializePeer,
  type ChatRole,
} from "@/lib/chat";

type ConversationRow = {
  _id: unknown;
  company: unknown;
  student: unknown;
  lastMessageBody?: string;
  lastMessageSender?: unknown;
  lastMessageAt?: Date;
  unreadForCompany?: number;
  unreadForStudent?: number;
};

/** Shape one row from the viewer's perspective — peer, unread, preview. */
function serializeRow(row: ConversationRow, viewerRole: ChatRole) {
  const peerRole: ChatRole = viewerRole === "company" ? "student" : "company";
  const peerDoc = viewerRole === "company" ? row.student : row.company;
  return {
    _id: String(row._id),
    peer: serializePeer(peerDoc as never, peerRole),
    lastMessageBody: row.lastMessageBody ?? "",
    lastMessageSender: row.lastMessageSender
      ? String(row.lastMessageSender)
      : null,
    lastMessageAt: row.lastMessageAt ?? null,
    unread:
      viewerRole === "company"
        ? (row.unreadForCompany ?? 0)
        : (row.unreadForStudent ?? 0),
  };
}

/** Inbox for the signed-in user. Polled, so it stays a single indexed query. */
export async function GET() {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "company" && user.role !== "student") return forbidden();

  const role = user.role as ChatRole;
  const filter = role === "company" ? { company: user._id } : { student: user._id };

  const rows = await Conversation.find(filter)
    .sort({ lastMessageAt: -1 })
    .limit(100)
    .populate(role === "company" ? "student" : "company", PEER_SELECT)
    .lean();

  const conversations = (rows as unknown as ConversationRow[]).map((r) =>
    serializeRow(r, role)
  );

  return NextResponse.json({
    conversations,
    totalUnread: conversations.reduce((sum, c) => sum + c.unread, 0),
    // Lets the client pick its next poll interval without extra math.
    latestActivityAt: conversations[0]?.lastMessageAt ?? null,
  });
}

/** Open (or reuse) a thread with a peer. Requires an application linking them. */
export async function POST(request: Request) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "company" && user.role !== "student") return forbidden();

  const parsed = conversationCreateSchema.safeParse(await request.json());
  if (!parsed.success) return badRequest("Validation failed");

  const { peerId } = parsed.data;
  if (!isValidId(peerId)) return badRequest("Invalid peer");

  const role = user.role as ChatRole;
  const viewerId = String(user._id);

  const peer = await User.findById(peerId).select("role status isApproved").lean();
  if (!peer) return badRequest("Peer not found");
  if (peer.status !== "active" || !peer.isApproved) {
    return badRequest("That account is not active");
  }

  // A company always talks to a student and vice versa.
  const expectedPeerRole = role === "company" ? "student" : "company";
  if (peer.role !== expectedPeerRole) return forbidden();

  const companyId = role === "company" ? viewerId : peerId;
  const studentId = role === "company" ? peerId : viewerId;

  const conversation = await ensureConversation(companyId, studentId);
  if (!conversation) {
    return forbidden();
  }

  return NextResponse.json({ conversationId: String(conversation._id) });
}
