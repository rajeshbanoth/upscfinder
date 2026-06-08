import dbConnect from "./dbConnect";
import Subject from "@/models/Subject";
import Question from "@/models/Question";
import fs from "fs";
import path from "path";

// ---------- Default subjects ----------
const defaultSubjects = [
  {
    name: "GS-1",
    slug: "gs-1",
    type: "GS" as const,
    enabled: true,
    mapping: { gs_paper: "GS1" },
    description: "Indian Heritage & Culture, History, Geography of World & Society",
  },
  {
    name: "GS-2",
    slug: "gs-2",
    type: "GS" as const,
    enabled: true,
    mapping: { gs_paper: "GS2" },
    description: "Governance, Constitution, Polity, Social Justice & International Relations",
  },
  {
    name: "GS-3",
    slug: "gs-3",
    type: "GS" as const,
    enabled: true,
    mapping: { gs_paper: "GS3" },
    description: "Technology, Economic Development, Bio‑diversity, Environment, Security & Disaster Management",
  },
  {
    name: "GS-4",
    slug: "gs-4",
    type: "GS" as const,
    enabled: true,
    mapping: { gs_paper: "GS4" },
    description: "Ethics, Integrity & Aptitude",
  },
  {
    name: "Sociology",
    slug: "sociology",
    type: "Optional" as const,
    enabled: true,
    mapping: { optional_name: "Sociology" },
    description: "Sociology Optional Subject",
  },
  // Add more optional subjects here if needed
];

// ---------- Flags to prevent repeated seeding ----------
let subjectsSeeded = false;
let questionsSeeded = false;

// ---------- Seed subjects ----------
export async function ensureSubjectsSeeded() {
  if (subjectsSeeded) return;
  try {
    await dbConnect();
    const count = await Subject.countDocuments();
    if (count === 0) {
      console.log("🌱 Seeding default subjects...");
      await Subject.insertMany(defaultSubjects);
      console.log("✅ Default subjects seeded.");
    }
    subjectsSeeded = true;
  } catch (error) {
    console.error("❌ Error seeding subjects:", error);
  }
}

// ---------- Seed questions (from data/questions.json) ----------
export async function ensureQuestionsSeeded() {
  if (questionsSeeded) return;
  try {
    await dbConnect();

    const count = await Question.countDocuments();
    if (count > 0) {
      console.log(`ℹ️ Already have ${count} questions – skipping seed.`);
      questionsSeeded = true;
      return;
    }

    // Read JSON file
    const filePath = path.join(process.cwd(), "data", "questions.json");
    if (!fs.existsSync(filePath)) {
      console.warn("⚠️ No questions.json found – skipping question seed.");
      questionsSeeded = true;
      return;
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    let questionsData = JSON.parse(raw);

    // Handle your actual structure: { collection, total_documents, data: [...] }
    if (!Array.isArray(questionsData)) {
      if (questionsData.data && Array.isArray(questionsData.data)) {
        questionsData = questionsData.data;
        console.log(`📦 Extracted array from 'data' property – length: ${questionsData.length}`);
      } else {
        console.warn("⚠️ questions.json does not contain an array – skipping.");
        questionsSeeded = true;
        return;
      }
    }

    console.log(`📄 Found ${questionsData.length} questions to seed. Fetching subjects...`);

    // Build lookup maps from Subject documents
    const allSubjects = await Subject.find({}).lean();
    const gsMap: Record<string, any> = {};
    const optionalMap: Record<string, any> = {};
    for (const sub of allSubjects) {
      if (sub.type === "GS" && sub.mapping?.gs_paper) {
        gsMap[sub.mapping.gs_paper] = sub;
      } else if (sub.type === "Optional" && sub.mapping?.optional_name) {
        optionalMap[sub.mapping.optional_name] = sub;
      }
    }

    // Process all questions, assign subject reference
    const prepared = questionsData.map((q: any, index: number) => {
      const classification = q.classification || {};
      let subjectId = null;

      if (classification.gs_paper) {
        const subject = gsMap[classification.gs_paper];
        if (subject) subjectId = subject._id;
      } else if (classification.optional_name) {
        const subject = optionalMap[classification.optional_name];
        if (subject) subjectId = subject._id;
      }

      return {
        ...q,
        _id: undefined, // Let MongoDB generate new _id to avoid conflicts
        classification: {
          ...classification,
          subject: subjectId,
        },
        visitorCount: q.visitorCount || 0,
      };
    });

    // Insert in batches for efficiency and to avoid timeout/memory issues
    const BATCH_SIZE = 500;
    let insertedCount = 0;
    const totalBatches = Math.ceil(prepared.length / BATCH_SIZE);

    console.log(`🚀 Inserting ${prepared.length} questions in ${totalBatches} batches...`);

    for (let i = 0; i < prepared.length; i += BATCH_SIZE) {
      const batch = prepared.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      try {
        await Question.insertMany(batch, { ordered: false });
        insertedCount += batch.length;
        console.log(`✅ Batch ${batchNumber}/${totalBatches} done – total inserted: ${insertedCount}`);
      } catch (batchError: any) {
        console.error(`❌ Batch ${batchNumber} insertion error:`, batchError.message);
        // If a batch fails completely, try inserting one by one to salvage
        console.log(`🔄 Retrying batch ${batchNumber} one-by-one...`);
        for (const doc of batch) {
          try {
            await Question.create(doc);
            insertedCount++;
          } catch (singleError: any) {
            console.error(`   └─ Failed to insert document:`, singleError.message);
          }
        }
      }
    }

    console.log(`🎉 Finished seeding. ${insertedCount} out of ${prepared.length} questions inserted.`);

    // Verify
    const finalCount = await Question.countDocuments();
    console.log(`📊 Current questions in DB: ${finalCount}`);

    questionsSeeded = true;
  } catch (error) {
    console.error("❌ Error seeding questions:", error);
  }
}