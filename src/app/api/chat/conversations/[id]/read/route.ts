import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/auth";
import { forbidden, notFound, unauthorized } from "@/lib/http";
import { getMemberConversation, unreadFieldFor, type ChatRole } from "@/lib/chat";

/**
 * Clear the viewer's unread counter for a thread.
 *
 * Separate from the GET so polling stays a pure read — otherwise every
 * background poll of a hidden thread would silently mark it read.
 */
export async function POST(
  _request: NextRequest,
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

  const now = new Date();

  await Promise.all([
    Conversation.updateOne(
      { _id: conversation._id },
      { $set: { [unreadFieldFor(role)]: 0 } }
    ),
    // Stamp the peer's messages so a future "seen" indicator has real data.
    Message.updateMany(
      { conversation: conversation._id, sender: { $ne: user._id }, readAt: null },
      { $set: { readAt: now } }
    ),
  ]);

  return NextResponse.json({ ok: true });
}
