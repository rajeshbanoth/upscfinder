import mongoose, { Schema, Model, Document } from "mongoose";

export interface ISubject extends Document {
  name: string;
  slug: string;
  type: "GS" | "Optional";
  enabled: boolean;
  mapping?: {
    gs_paper?: string;
    optional_name?: string;
  };
  description?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: ["GS", "Optional"], required: true },
    enabled: { type: Boolean, default: true },
    mapping: {
      gs_paper: String,
      optional_name: String,
    },
    description: String,
    icon: String,
  },
  { timestamps: true }
);

export default (mongoose.models.Subject as Model<ISubject>) ||
  mongoose.model<ISubject>("Subject", SubjectSchema);