import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/auth";
import { messageCreateSchema } from "@/lib/validators";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/http";
import {
  getMemberConversation,
  isValidId,
  PEER_SELECT,
  serializePeer,
  unreadFieldFor,
  type ChatRole,
} from "@/lib/chat";

const INITIAL_PAGE = 40;
const DELTA_LIMIT = 100;

type MessageRow = {
  _id: unknown;
  sender: unknown;
  body: string;
  createdAt: Date;
};

function serializeMessage(m: MessageRow) {
  return {
    _id: String(m._id),
    sender: String(m.sender),
    body: m.body,
    createdAt: m.createdAt,
  };
}

/**
 * The polling endpoint.
 *
 * With `?after=<messageId>` it returns only what the caller has not seen, which
 * is almost always an empty array — the steady-state response is a few dozen
 * bytes. Without it, it returns the tail of the thread as the initial page.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "company" && user.role !== "student") return forbidden();

  const role = user.role as ChatRole;
  const { id } = await params;

  const conversation = await getMemberConversation(id, String(user._id), role);
  if (!conversation) return notFound("Conversation not found");

  const after = request.nextUrl.searchParams.get("after");
  const wantsPeer = request.nextUrl.searchParams.get("peer") === "1";

  let messages: MessageRow[];
  let hasMore = false;

  if (after) {
    if (!isValidId(after)) return badRequest("Invalid cursor");
    messages = (await Message.find({
      conversation: conversation._id,
      _id: { $gt: after },
    })
      .sort({ _id: 1 })
      .limit(DELTA_LIMIT)
      .lean()) as unknown as MessageRow[];
  } else {
    // Newest-first slice, then flipped — reading the tail never scans the head.
    const tail = (await Message.find({ conversation: conversation._id })
      .sort({ _id: -1 })
      .limit(INITIAL_PAGE + 1)
      .lean()) as unknown as MessageRow[];
    hasMore = tail.length > INITIAL_PAGE;
    messages = tail.slice(0, INITIAL_PAGE).reverse();
  }

  const serialized = messages.map(serializeMessage);

  const body: Record<string, unknown> = {
    messages: serialized,
    cursor: serialized.at(-1)?._id ?? after ?? null,
    hasMore,
    unread: role === "company"
      ? (conversation.unreadForCompany ?? 0)
      : (conversation.unreadForStudent ?? 0),
    lastMessageAt: conversation.lastMessageAt ?? null,
  };

  // Peer details only on the first load; the poll doesn't re-send them.
  if (wantsPeer) {
    const peerRole: ChatRole = role === "company" ? "student" : "company";
    const populated = await conversation.populate(
      role === "company" ? "student" : "company",
      PEER_SELECT
    );
    const peerDoc = role === "company" ? populated.student : populated.company;
    body.peer = serializePeer(peerDoc as never, peerRole);
  }

  return NextResponse.json(body);
}

/** Send a message. Updates the thread's denormalized preview + unread counter. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "company" && user.role !== "student") return forbidden();

  const role = user.role as ChatRole;
  const { id } = await params;

  const conversation = await getMemberConversation(id, String(user._id), role);
  if (!conversation) return notFound("Conversation not found");

  const parsed = messageCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return badRequest(
      parsed.error.issues[0]?.message ?? "Validation failed",
      parsed.error.flatten()
    );
  }

  const { body, clientId } = parsed.data;
  const now = new Date();

  const message = await Message.create({
    conversation: conversation._id,
    sender: user._id,
    body,
    createdAt: now,
  });

  // The recipient's counter goes up; the sender's stays where it is.
  const recipientRole: ChatRole = role === "company" ? "student" : "company";
  await Conversation.updateOne(
    { _id: conversation._id },
    {
      $set: {
        lastMessageBody: body.slice(0, 200),
        lastMessageSender: user._id,
        lastMessageAt: now,
      },
      $inc: { [unreadFieldFor(recipientRole)]: 1 },
    }
  );

  return NextResponse.json({
    message: {
      ...serializeMessage(message as unknown as MessageRow),
      clientId: clientId ?? null,
    },
  });
}
