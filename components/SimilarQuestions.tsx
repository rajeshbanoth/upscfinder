"use client";

import { useState } from "react";
import Link from "next/link";
import { IQuestion } from "@/models/Question";
import { FileText, Loader2 } from "lucide-react";

export default function SimilarQuestions({
  initialQuestions,
  questionId,
}: {
  initialQuestions: IQuestion[];
  questionId: string;
}) {
  const [questions, setQuestions] = useState<IQuestion[]>(initialQuestions);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialQuestions.length >= 5);

  const loadMore = async () => {
    setLoading(true);
    try {
      const skip = questions.length;
      const res = await fetch(
        `/api/questions/similar?questionId=${questionId}&limit=5&skip=${skip}`
      );
      const data = await res.json();
      if (data.questions?.length) {
        setQuestions((prev) => [...prev, ...data.questions]);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more similar questions", err);
    }
    setLoading(false);
  };

  if (!questions.length) return null;

  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <span className="bg-blue-100 p-1.5 rounded-lg">
          <FileText size={20} className="text-blue-600" />
        </span>
        Similar Questions from Different Toppers
      </h3>
      <div className="grid gap-4">
        {questions.map((q) => (
          <Link key={q._id.toString()} href={`/question/${q._id}`}>
            <div className="group border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold text-gray-800 flex-1">
                  {q.content.question_text}
                </h4>
                {q.source?.file_name && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {q.source.file_name}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                <span>{q.classification.chapter}</span>
                {q.classification.subtopic && (
                  <>
                    <span>•</span>
                    <span>{q.classification.subtopic}</span>
                  </>
                )}
                {q.enrichment.year && (
                  <>
                    <span>•</span>
                    <span>{q.enrichment.year}</span>
                  </>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Loading...
              </>
            ) : (
              "Load more similar copies"
            )}
          </button>
        </div>
      )}
    </div>
  );
}