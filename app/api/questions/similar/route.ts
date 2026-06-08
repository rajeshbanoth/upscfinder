// import { NextRequest, NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Question from "@/models/Question";

// export async function GET(req: NextRequest) {
//   const url = new URL(req.url);
//   const questionId = url.searchParams.get("questionId");
//   if (!questionId) {
//     return NextResponse.json({ error: "questionId required" }, { status: 400 });
//   }
//   try {
//     await dbConnect();
//     const question = await Question.findById(questionId).lean();
//     if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });

//     const filter: any = { _id: { $ne: question._id } };
//     if (question.classification?.optional_name) {
//       filter["classification.optional_name"] = question.classification.optional_name;
//     } else if (question.classification?.gs_paper) {
//       filter["classification.gs_paper"] = question.classification.gs_paper;
//     }
//     if (question.classification?.chapter) {
//       filter["classification.chapter"] = question.classification.chapter;
//     }
//     const similar = await Question.find(filter).limit(5).lean();
//     return NextResponse.json(similar);
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Question from "@/models/Question";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const questionId = url.searchParams.get("questionId");
  const limit = parseInt(url.searchParams.get("limit") || "5", 10);
  const skip = parseInt(url.searchParams.get("skip") || "0", 10);

  if (!questionId) {
    return NextResponse.json({ error: "questionId required" }, { status: 400 });
  }

  try {
    await dbConnect();

    // 1. Get the current question
    const current = await Question.findById(questionId).lean();
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentId = current._id.toString();

    // 2. Build search text from the current question
    const searchText = [
      current.content?.question_text,
      current.content?.introduction,
      current.enrichment?.keywords?.join(" "),
      current.enrichment?.concepts?.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 500);

    // 3. Fetch similar questions (try Atlas Search first, fallback to chapter/paper)
    let similarQuestions: any[] = [];

    if (searchText) {
      try {
        // Use Atlas Search compound query (mustNot exclude current)
        similarQuestions = await Question.aggregate([
          {
            $search: {
              index: "default",
              compound: {
                must: [
                  {
                    text: {
                      query: searchText,
                      path: [
                        "content.question_text",
                        "content.introduction",
                        "enrichment.keywords",
                        "enrichment.concepts",
                      ],
                      fuzzy: { maxEdits: 1 },
                      score: { boost: { value: 2 } },
                    },
                  },
                ],
                mustNot: [
                  { equals: { path: "_id", value: current._id } },
                ],
              },
            },
          },
          { $limit: 50 }, // fetch more to deduplicate later
          { $addFields: { score: { $meta: "searchScore" } } },
          { $sort: { score: -1 } },
        ]);
      } catch (e) {
        console.warn("Atlas Search not available – using fallback.");
      }
    }

    // Fallback if Atlas Search fails or no searchText
    if (similarQuestions.length === 0) {
      const fallbackFilter: any = { _id: { $ne: current._id } };
      if (current.classification?.gs_paper) {
        fallbackFilter["classification.gs_paper"] = current.classification.gs_paper;
      } else if (current.classification?.optional_name) {
        fallbackFilter["classification.optional_name"] = current.classification.optional_name;
      }
      if (current.classification?.chapter) {
        fallbackFilter["classification.chapter"] = current.classification.chapter;
      }
      similarQuestions = await Question.find(fallbackFilter)
        .sort({ "metadata.created_at": -1 })
        .limit(50)
        .lean();
    }

    // 4. Deduplicate by topper (file_name)
    const seenFiles = new Set<string>();
    const distinctQuestions: any[] = [];

    for (const q of similarQuestions) {
      const fileName = q.source?.file_name || "unknown";
      if (!seenFiles.has(fileName)) {
        seenFiles.add(fileName);
        distinctQuestions.push(q);
      }
    }

    // 5. Apply pagination (skip & limit)
    const paginated = distinctQuestions.slice(skip, skip + limit);

    return NextResponse.json({
      questions: paginated,
      totalDistinct: distinctQuestions.length,
      hasMore: skip + limit < distinctQuestions.length,
    });
  } catch (error: any) {
    console.error("Similar API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}