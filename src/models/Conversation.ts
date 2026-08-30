import mongoose, { Schema, type InferSchemaType } from "mongoose";

/**
 * One thread per (company, student) pair. Created lazily the first time either
 * side opens a chat, and only when an Application already links the two.
 *
 * `lastMessage*` and the unread counters are denormalized on purpose: the
 * conversation list is polled far more often than messages are sent, so it must
 * never fan out into a per-thread message query.
 */
const conversationSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessageBody: { type: String, default: "" },
    lastMessageSender: { type: Schema.Types.ObjectId, ref: "User" },
    lastMessageAt: { type: Date, default: Date.now },
    unreadForCompany: { type: Number, default: 0, min: 0 },
    unreadForStudent: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

conversationSchema.index({ company: 1, student: 1 }, { unique: true });
// Drives each side's inbox, already in display order.
conversationSchema.index({ company: 1, lastMessageAt: -1 });
conversationSchema.index({ student: 1, lastMessageAt: -1 });

export type ConversationDocument = InferSchemaType<typeof conversationSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Conversation =
  mongoose.models.Conversation ??
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
