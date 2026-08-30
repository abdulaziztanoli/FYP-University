import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const MESSAGE_MAX_LENGTH = 4000;

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: MESSAGE_MAX_LENGTH,
    },
    readAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

/**
 * The polling index. Every delta fetch is
 * `{ conversation, _id: { $gt: cursor } }` sorted by `_id` ascending, which this
 * index serves end to end — no in-memory sort, no collection scan.
 *
 * `_id` is the cursor rather than `createdAt` because it is unique and totally
 * ordered, so a client can never skip or re-receive a message when two land in
 * the same millisecond.
 */
messageSchema.index({ conversation: 1, _id: 1 });

export type MessageDocument = InferSchemaType<typeof messageSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Message =
  mongoose.models.Message ?? mongoose.model("Message", messageSchema);

export default Message;
