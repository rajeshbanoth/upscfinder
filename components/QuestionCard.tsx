import Link from "next/link";
import { IQuestion } from "@/models/Question";
import { truncate } from "@/lib/utils";
import { Eye, FileText, Calendar, BookOpen, Tag } from "lucide-react";

export default function QuestionCard({ question }: { question: IQuestion }) {
  const id = question._id.toString();
  const topper = question.source?.file_name?.replace(/\.pdf$/i, "") || "Unknown topper";

  return (
    <Link href={`/question/${id}`}>
      <div className="group relative border border-gray-200 rounded-xl p-5 bg-white hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer">
        {/* Topper badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            <FileText size={12} />
            {truncate(topper, 25)}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 text-lg leading-snug pr-20">
          {truncate(question.content.question_text, 100)}
        </h3>

        {/* Introduction preview (if exists) */}
        {question.content.introduction && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
            {truncate(question.content.introduction, 150)}
          </p>
        )}

        {/* Metadata pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {question.classification.chapter && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
              <BookOpen size={12} />
              {question.classification.chapter}
            </span>
          )}
          {question.classification.subtopic && (
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
              <Tag size={12} />
              {question.classification.subtopic}
            </span>
          )}
          {question.enrichment.year && (
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">
              <Calendar size={12} />
              {question.enrichment.year}
            </span>
          )}
          {question.enrichment.marks && (
            <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
              {question.enrichment.marks} marks
            </span>
          )}
          {question.enrichment.difficulty && (
            <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full capitalize">
              {question.enrichment.difficulty}
            </span>
          )}
        </div>

        {/* Footer stats */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Eye size={12} />
            {question.visitorCount || 0} views
          </span>
          <span className="group-hover:text-blue-600 transition-colors font-medium text-blue-500">
            View Answer →
          </span>
        </div>
      </div>
    </Link>
  );
}