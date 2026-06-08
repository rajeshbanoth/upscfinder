import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Question from "@/models/Question";
import Subject from "@/models/Subject";

// Escape regex special characters to prevent "unmatched closing parenthesis" errors
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const mode = searchParams.get("mode") || "search";
    const query = searchParams.get("q") || "";
    const subjectSlug = searchParams.get("subject") || "";
    const chapter = searchParams.get("chapter") || "";
    const subtopic = searchParams.get("subtopic") || "";
    const year = searchParams.get("year") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Build base filter
    const baseFilter: any = {};
    if (subjectSlug) {
      const subject = await Subject.findOne({ slug: subjectSlug });
      if (subject) {
        if (subject.type === "GS" && subject.mapping?.gs_paper) {
          baseFilter["classification.gs_paper"] = subject.mapping.gs_paper;
        } else if (subject.type === "Optional" && subject.mapping?.optional_name) {
          baseFilter["classification.optional_name"] = subject.mapping.optional_name;
        }
      }
    }
    
    // ⭐ CRITICAL: Escape regex special characters in user input
    if (chapter) {
      baseFilter["classification.chapter"] = { $regex: escapeRegex(chapter), $options: "i" };
    }
    if (subtopic) {
      baseFilter["classification.subtopic"] = { $regex: escapeRegex(subtopic), $options: "i" };
    }
    if (year) baseFilter["enrichment.year"] = parseInt(year);
    if (difficulty) baseFilter["enrichment.difficulty"] = difficulty;

    // ---- Autocomplete mode ----
    if (mode === "autocomplete" && query.length >= 2) {
      const escapedQuery = escapeRegex(query);
      const suggestions = await Question.find({
        $or: [
          { "content.question_text": { $regex: escapedQuery, $options: "i" } },
          { "source.file_name": { $regex: escapedQuery, $options: "i" } },
        ],
        ...baseFilter,
      })
        .select("content.question_text")
        .limit(5)
        .lean();

      const formatted = suggestions.map((q: any) => ({
        _id: q._id.toString(),
        text: q.content.question_text,
      }));
      return NextResponse.json({ suggestions: formatted });
    }

    // ---- Full search mode ----
    if (!query) {
      return NextResponse.json({ questions: [], totalPages: 0, currentPage: page, total: 0 });
    }

    // Try Atlas Search first (won't cause regex errors)
    let questions: any[] = [];
    let total = 0;

    try {
      const pipeline: any[] = [
        {
          $search: {
            index: "default",
            compound: {
              must: [
                {
                  text: {
                    query,
                    path: [
                      "content.question_text",
                      "content.introduction",
                      "source.file_name",
                      "content.thinkers.name",
                      "enrichment.keywords",
                      "enrichment.concepts",
                    ],
                    fuzzy: { maxEdits: 1 },
                    score: { boost: { value: 3 } },
                  },
                },
              ],
            },
          },
        },
        { $match: baseFilter },
        { $addFields: { score: { $meta: "searchScore" } } },
        { $sort: { score: -1 } },
        { $skip: skip },
        { $limit: limit },
      ];
      questions = await Question.aggregate(pipeline);
      const metaPipeline = [
        {
          $search: {
            index: "default",
            compound: {
              must: [{ text: { query, path: ["content.question_text"] } }],
            },
          },
        },
        { $match: baseFilter },
        { $count: "total" },
      ];
      const metaResult = await Question.aggregate(metaPipeline);
      total = metaResult[0]?.total || 0;
    } catch (err) {
      console.warn("Atlas Search error, falling back to regex:", err);
    }

    // Fallback: regex search (with escaping)
    if (questions.length === 0 || total === 0) {
      const escapedQuery = escapeRegex(query);
      const fallbackFilter: any = {
        ...baseFilter,
        $or: [
          { "content.question_text": { $regex: escapedQuery, $options: "i" } },
          { "content.introduction": { $regex: escapedQuery, $options: "i" } },
          { "source.file_name": { $regex: escapedQuery, $options: "i" } },
          { "content.thinkers.name": { $regex: escapedQuery, $options: "i" } },
          { "enrichment.keywords": { $regex: escapedQuery, $options: "i" } },
          { "enrichment.concepts": { $regex: escapedQuery, $options: "i" } },
        ],
      };
      total = await Question.countDocuments(fallbackFilter);
      questions = await Question.find(fallbackFilter)
        .sort({ "metadata.created_at": -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    return NextResponse.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}