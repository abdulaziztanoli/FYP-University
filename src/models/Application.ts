import mongoose, { Schema, type InferSchemaType } from "mongoose";

const applicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "accepted"],
      default: "pending",
    },
    coverLetter: { type: String, default: "" },
    appliedAt: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

applicationSchema.index({ job: 1, student: 1 }, { unique: true });

export type ApplicationDocument = InferSchemaType<typeof applicationSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Application =
  mongoose.models.Application ??
  mongoose.model("Application", applicationSchema);

export default Application;
