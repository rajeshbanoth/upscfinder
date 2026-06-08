

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Question from "@/models/Question";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const mode = url.searchParams.get("mode") || "search"; // "search" | "autocomplete"
    const subjectSlug = url.searchParams.get("subject") || "";
    const chapter = url.searchParams.get("chapter") || "";
    const year = url.searchParams.get("year") || "";
    const difficulty = url.searchParams.get("difficulty") || "";

    // Base filter (classification / enrichment)
    const baseFilter: any = {};
    if (subjectSlug) {
      const Subject = (await import("@/models/Subject")).default;
      const subject = await Subject.findOne({ slug: subjectSlug });
      if (subject) {
        if (subject.type === "GS" && subject.mapping?.gs_paper) {
          baseFilter["classification.gs_paper"] = subject.mapping.gs_paper;
        } else if (subject.type === "Optional" && subject.mapping?.optional_name) {
          baseFilter["classification.optional_name"] = subject.mapping.optional_name;
        }
      }
    }
    if (chapter) baseFilter["classification.chapter"] = chapter;
    if (year) baseFilter["enrichment.year"] = parseInt(year);
    if (difficulty) baseFilter["enrichment.difficulty"] = difficulty;

    const skip = (page - 1) * limit;

    // ----- Autocomplete mode (lightweight, fast) -----
    if (mode === "autocomplete" && query.length >= 2) {
      const suggestions = await Question.aggregate([
        {
          $search: {
            index: "default",
            autocomplete: {
              query: query,
              path: "content.question_text",  // you can add more paths with compound
              fuzzy: { maxEdits: 1 }
            }
          }
        },
        { $match: baseFilter },
        { $limit: 5 },
        {
          $project: {
            _id: 1,
            text: "$content.question_text",
            score: { $meta: "searchScore" }
          }
        }
      ]);
      return NextResponse.json({ suggestions });
    }

    // ----- Full search with relevance -----
    if (!query) {
      // Fallback to regular listing if no query (still can filter)
      const total = await Question.countDocuments(baseFilter);
      const questions = await Question.find(baseFilter)
        .sort({ "metadata.created_at": -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      return NextResponse.json({
        questions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      });
    }

    // Main search aggregation
    const pipeline: any[] = [
      {
        $search: {
          index: "default",
          compound: {
            must: [
              {
                text: {
                  query: query,
                  path: [
                    "content.question_text",
                    "content.introduction",
                    "source.file_name",
                    "content.thinkers.name",
                    "enrichment.keywords",
                    "enrichment.concepts"
                  ],
                  fuzzy: { maxEdits: 1 },
                  score: { boost: { value: 3 } } // boost relevance
                }
              }
            ],
            should: [
              {
                text: {
                  query: query,
                  path: "syllabus_raw",
                  score: { boost: { value: 1 } }
                }
              }
            ]
          }
        }
      },
      { $match: baseFilter },
      {
        $addFields: {
          score: { $meta: "searchScore" },
          highlights: { $meta: "searchHighlights" }
        }
      },
      { $sort: { score: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          content: 1,
          source: 1,
          classification: 1,
          enrichment: 1,
          visitorCount: 1,
          score: 1,
          highlights: 1
        }
      }
    ];

    const results = await Question.aggregate(pipeline);

    // Count total hits (separate $searchMetadata)
    const countPipeline = [
      { $search: { index: "default", compound: { must: [{ text: { query, path: "content.question_text" } }] } } },
      { $match: baseFilter },
      { $count: "total" }
    ];
    const countResult = await Question.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    return NextResponse.json({
      questions: results,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}