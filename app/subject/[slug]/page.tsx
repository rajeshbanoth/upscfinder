import { Suspense } from "react";
import dbConnect from "@/lib/dbConnect";
import Subject from "@/models/Subject";
import Question from "@/models/Question";
import QuestionListClient from "./QuestionListClient";
import { notFound } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export const dynamic = "force-dynamic";

async function getSubject(slug: string) {
  await dbConnect();
  const subject = await Subject.findOne({ slug }).lean();
  return subject ? JSON.parse(JSON.stringify(subject)) : null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
  // searchParams is intentionally omitted – client component will use useSearchParams
}

export default async function SubjectPage({ params }: PageProps) {
  const { slug } = await params;

  const subject = await getSubject(slug);
  if (!subject) notFound();

  await dbConnect();
  const queryFilter: any = {};
  if (subject.type === "GS" && subject.mapping?.gs_paper) {
    queryFilter["classification.gs_paper"] = subject.mapping.gs_paper;
  } else if (subject.type === "Optional" && subject.mapping?.optional_name) {
    queryFilter["classification.optional_name"] = subject.mapping.optional_name;
  }

  const chapters = await Question.distinct("classification.chapter", queryFilter);
  const years = await Question.distinct("enrichment.year", queryFilter);

  // Type‑safe filter: remove null/undefined, keep only numbers
  const validYears = years.filter((y): y is number => y !== null && y !== undefined).sort();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {subject.name} – Questions
      </h1>
      <Suspense fallback={<LoadingSpinner />}>
        <QuestionListClient
          subject={subject}
          availableChapters={chapters}
          availableYears={validYears}
        />
      </Suspense>
    </div>
  );
}