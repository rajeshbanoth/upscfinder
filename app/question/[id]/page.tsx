// // import { Suspense } from "react";
// // import dbConnect from "@/lib/dbConnect";
// // import Question from "@/models/Question";
// // import QuestionDetail from "@/components/QuestionDetail";
// // import SimilarQuestions from "@/components/SimilarQuestions";
// // import VisitorTracker from "./VisitorTracker";
// // import { notFound } from "next/navigation";
// // import LoadingSpinner from "@/components/LoadingSpinner";

// // export const dynamic = "force-dynamic";

// // async function getQuestion(id: string) {
// //   await dbConnect();
// //   const question = await Question.findById(id).lean();
// //   return question ? JSON.parse(JSON.stringify(question)) : null;
// // }

// // async function getSimilarQuestions(question: any) {
// //   if (!question) return [];
// //   await dbConnect();
// //   const filter: any = { _id: { $ne: question._id } };
// //   if (question.classification?.optional_name) {
// //     filter["classification.optional_name"] = question.classification.optional_name;
// //   } else if (question.classification?.gs_paper) {
// //     filter["classification.gs_paper"] = question.classification.gs_paper;
// //   }
// //   if (question.classification?.chapter) {
// //     filter["classification.chapter"] = question.classification.chapter;
// //   }
// //   const similar = await Question.find(filter).limit(5).lean();
// //   return JSON.parse(JSON.stringify(similar));
// // }

// // interface PageProps {
// //   params: Promise<{ id: string }>;
// // }

// // export default async function QuestionPage({ params }: PageProps) {
// //   const { id } = await params;
// //   const question = await getQuestion(id);
// //   if (!question) notFound();

// //   const similar = await getSimilarQuestions(question);

// //   return (
// //     <div>
// //       <VisitorTracker questionId={id} />
// //       <QuestionDetail question={question} />
// //       <Suspense fallback={<LoadingSpinner />}>
// //         <SimilarQuestions questions={similar} />
// //       </Suspense>
// //     </div>
// //   );
// // }

// import { Suspense } from "react";
// import mongoose from "mongoose";                              // ★ added
// import dbConnect from "@/lib/dbConnect";
// import Question from "@/models/Question";
// import QuestionDetail from "@/components/QuestionDetail";
// import SimilarQuestions from "@/components/SimilarQuestions";
// import VisitorTracker from "./VisitorTracker";
// import { notFound } from "next/navigation";
// import LoadingSpinner from "@/components/LoadingSpinner";

// export const dynamic = "force-dynamic";

// async function getQuestion(id: string) {
//   await dbConnect();
//   const question = await Question.findById(id).lean();
//   return question ? JSON.parse(JSON.stringify(question)) : null;
// }

// async function getSimilarQuestions(question: any) {
//   if (!question) return [];
//   await dbConnect();

//   const currentId = new mongoose.Types.ObjectId(question._id);   // ★ ObjectId, not string

//   // 1. Build search text from the question
//   const searchText = [
//     question.content?.question_text,
//     question.content?.introduction,
//     question.enrichment?.keywords?.join(" "),
//     question.enrichment?.concepts?.join(" "),
//   ]
//     .filter(Boolean)
//     .join(" ")
//     .slice(0, 500);

//   // 2. Atlas Search path (if index is ready)
//   if (searchText) {
//     try {
//       const similar = await Question.aggregate([
//         {
//           $search: {
//             index: "default",
//             compound: {
//               must: [
//                 {
//                   text: {
//                     query: searchText,
//                     path: [
//                       "content.question_text",
//                       "content.introduction",
//                       "enrichment.keywords",
//                       "enrichment.concepts",
//                     ],
//                     fuzzy: { maxEdits: 1 },
//                     score: { boost: { value: 2 } },
//                   },
//                 },
//               ],
//               mustNot: [
//                 { equals: { path: "_id", value: currentId } },   // ★ now ObjectId
//               ],
//             },
//           },
//         },
//         { $limit: 5 },
//         { $addFields: { score: { $meta: "searchScore" } } },
//         { $sort: { score: -1 } },
//       ]);

//       if (similar.length > 0) {
//         return JSON.parse(JSON.stringify(similar));
//       }
//     } catch (err) {
//       console.warn("Atlas Search not available – using fallback.");
//     }
//   }

//   // 3. Fallback – always return something
//   const fallbackFilter: any = { _id: { $ne: currentId } };

//   // Try to match same subject (GS paper or optional)
//   if (question.classification?.gs_paper) {
//     fallbackFilter["classification.gs_paper"] = question.classification.gs_paper;
//   } else if (question.classification?.optional_name) {
//     fallbackFilter["classification.optional_name"] = question.classification.optional_name;
//   }

//   // First attempt with subject + chapter (if available)
//   if (question.classification?.chapter) {
//     const withChapter = {
//       ...fallbackFilter,
//       "classification.chapter": question.classification.chapter,
//     };
//     const chapterSimilar = await Question.find(withChapter).limit(5).lean();
//     if (chapterSimilar.length > 0) {
//       return JSON.parse(JSON.stringify(chapterSimilar));
//     }
//   }

//   // Second attempt with subject only (no chapter restriction)
//   const subjectSimilar = await Question.find(fallbackFilter)
//     .sort({ "metadata.created_at": -1 })
//     .limit(5)
//     .lean();

//   if (subjectSimilar.length > 0) {
//     return JSON.parse(JSON.stringify(subjectSimilar));
//   }

//   // 4. Last resort – return any 5 questions except current
//   const anySimilar = await Question.find({ _id: { $ne: currentId } })
//     .sort({ "metadata.created_at": -1 })
//     .limit(5)
//     .lean();

//   return JSON.parse(JSON.stringify(anySimilar));
// }

// interface PageProps {
//   params: Promise<{ id: string }>;
// }

// export default async function QuestionPage({ params }: PageProps) {
//   const { id } = await params;
//   const question = await getQuestion(id);
//   if (!question) notFound();

//   const similar = await getSimilarQuestions(question);

//   return (
//     <div>
//       <VisitorTracker questionId={id} />
//       <QuestionDetail question={question} />

//       {similar.length > 0 && (
//         <Suspense fallback={<LoadingSpinner />}>
//           <SimilarQuestions questions={similar} />
//         </Suspense>
//       )}
//     </div>
//   );
// }


import { Suspense } from "react";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Question from "@/models/Question";
import QuestionDetail from "@/components/QuestionDetail";
import SimilarQuestions from "@/components/SimilarQuestions";   // now client component
import VisitorTracker from "./VisitorTracker";
import { notFound } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export const dynamic = "force-dynamic";

async function getQuestion(id: string) {
  await dbConnect();
  const question = await Question.findById(id).lean();
  return question ? JSON.parse(JSON.stringify(question)) : null;
}

// Helper to fetch initial 5 distinct similar questions (server-side)
async function getInitialSimilar(question: any) {
  if (!question) return [];
  await dbConnect();

  const currentId = question._id.toString();

  const searchText = [
    question.content?.question_text,
    question.content?.introduction,
    question.enrichment?.keywords?.join(" "),
    question.enrichment?.concepts?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 500);

  let similar: any[] = [];

  if (searchText) {
    try {
      similar = await Question.aggregate([
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
                { equals: { path: "_id", value: question._id } },
              ],
            },
          },
        },
        { $limit: 50 },
        { $addFields: { score: { $meta: "searchScore" } } },
        { $sort: { score: -1 } },
      ]);
    } catch (e) {
      console.warn("Atlas Search unavailable for similar – using fallback.");
    }
  }

  if (similar.length === 0) {
    const fallbackFilter: any = { _id: { $ne: question._id } };
    if (question.classification?.gs_paper) {
      fallbackFilter["classification.gs_paper"] = question.classification.gs_paper;
    } else if (question.classification?.optional_name) {
      fallbackFilter["classification.optional_name"] = question.classification.optional_name;
    }
    if (question.classification?.chapter) {
      fallbackFilter["classification.chapter"] = question.classification.chapter;
    }
    similar = await Question.find(fallbackFilter)
      .sort({ "metadata.created_at": -1 })
      .limit(50)
      .lean();
  }

  // Deduplicate by file_name (topper)
  const seen = new Set<string>();
  const distinct = similar.filter((q: any) => {
    const file = q.source?.file_name || "unknown";
    if (seen.has(file)) return false;
    seen.add(file);
    return true;
  });

  return JSON.parse(JSON.stringify(distinct.slice(0, 5)));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionPage({ params }: PageProps) {
  const { id } = await params;
  const question = await getQuestion(id);
  if (!question) notFound();

  const initialSimilar = await getInitialSimilar(question);

  return (
    <div>
      <VisitorTracker questionId={id} />
      <QuestionDetail question={question} />

      <Suspense fallback={<LoadingSpinner />}>
        <SimilarQuestions
          initialQuestions={initialSimilar}
          questionId={id}
        />
      </Suspense>
    </div>
  );
}