import mongoose, { Schema, type InferSchemaType } from "mongoose";

const jobSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    type: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract"],
      required: true,
    },
    location: { type: String, required: true, trim: true },
    isRemote: { type: Boolean, default: false },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },
    skills: { type: [String], default: [] },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["open", "closed", "draft"],
      default: "draft",
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior"],
      required: true,
    },
    positions: { type: Number, default: 1, min: 1 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

jobSchema.index({ status: 1, deadline: 1 });
jobSchema.index({ title: "text", location: "text" });

export type JobDocument = InferSchemaType<typeof jobSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Job = mongoose.models.Job ?? mongoose.model("Job", jobSchema);

export default Job;
