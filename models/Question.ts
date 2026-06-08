import mongoose, { Schema, Model, Document } from "mongoose";

export interface IQuestion extends Document {
  content: {
    question_text: string;
    introduction?: string;
    thinkers?: { name?: string; concept?: string }[];
    diagram?: string;
  };
  source: {
    file_name?: string;
    drive_url?: string;
    drive_id?:string;
    page?: number;
  };
  syllabus_raw?: string;
  classification: {
    gs_paper?: string | null;
    optional_name?: string | null;
    optional_paper?: number;
    chapter?: string;
    subtopic?: string;
    language?: string;
    english_medium?: boolean;
    subject?: mongoose.Types.ObjectId;   // ← NEW reference to Subject
  };
  enrichment: {
    year?: number | null;
    exam_type?: string | null;
    marks?: number | null;
    difficulty?: string | null;
    crux_points?: string[];
    main_arguments?: string[];
    examples_used?: string[];
    keywords?: string[];
    concepts?: string[];
    source_pdf_metadata?: {
      author?: string | null;
      coaching?: string | null;
      year_of_pdf?: number | null;
    };
    notes?: string | null;
    model_answer_reference?: string | null;
    custom_fields?: Record<string, any>;
  };
  metadata: {
    created_at: Date;
    updated_at: Date;
    source_sheet?: string;
    schema_version?: string;
  };
  visitorCount: number;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    content: {
      question_text: { type: String, required: true },
      introduction: String,
      thinkers: [{ name: String, concept: String }],
      diagram: String,
    },
    source: {
      file_name: String,
      drive_url: String,
      page: Number,
    },
    syllabus_raw: String,
    classification: {
      gs_paper: { type: String, default: null },
      optional_name: { type: String, default: null },
      optional_paper: Number,
      chapter: String,
      subtopic: String,
      language: String,
      english_medium: Boolean,
      subject: { type: Schema.Types.ObjectId, ref: "Subject", index: true }, // ← NEW
    },
    enrichment: {
      year: Number,
      exam_type: String,
      marks: Number,
      difficulty: String,
      crux_points: [String],
      main_arguments: [String],
      examples_used: [String],
      keywords: [String],
      concepts: [String],
      source_pdf_metadata: {
        author: String,
        coaching: String,
        year_of_pdf: Number,
      },
      notes: String,
      model_answer_reference: String,
      custom_fields: { type: Map, of: Schema.Types.Mixed },
    },
    metadata: {
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now },
      source_sheet: String,
      schema_version: String,
    },
    visitorCount: { type: Number, default: 0 },
  },
  {
    timestamps: {
      createdAt: "metadata.created_at",
      updatedAt: "metadata.updated_at",
    },
  }
);

// Existing indexes
QuestionSchema.index({ "content.question_text": "text", "content.introduction": "text" });
QuestionSchema.index({ "classification.gs_paper": 1, "classification.optional_name": 1 });
QuestionSchema.index({ "classification.chapter": 1, "classification.subtopic": 1 });
// New index for subject reference (already indexed by the field definition, but explicit is fine)
QuestionSchema.index({ "classification.subject": 1 });

export default (mongoose.models.Question as Model<IQuestion>) ||
  mongoose.model<IQuestion>("Question", QuestionSchema);