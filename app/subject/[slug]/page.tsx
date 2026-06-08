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

// Updated PageProps: params and searchParams are Promises
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SubjectPage({ params, searchParams }: PageProps) {
  // Resolve the Promises first
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const subject = await getSubject(slug);
  if (!subject) notFound();

  // Fetch distinct chapters and years for filter dropdowns
  await dbConnect();
  const queryFilter: any = {};
  if (subject.type === "GS" && subject.mapping?.gs_paper) {
    queryFilter["classification.gs_paper"] = subject.mapping.gs_paper;
  } else if (subject.type === "Optional" && subject.mapping?.optional_name) {
    queryFilter["classification.optional_name"] = subject.mapping.optional_name;
  }

  const chapters = await Question.distinct("classification.chapter", queryFilter);
  const years = await Question.distinct("enrichment.year", queryFilter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {subject.name} – Questions
      </h1>
      <Suspense fallback={<LoadingSpinner />}>
        <QuestionListClient
          subject={subject}
          searchParams={resolvedSearchParams}   // plain object, no longer a Promise
          availableChapters={chapters}
          availableYears={years.filter(Boolean).sort()}
        />
      </Suspense>
    </div>
  );
}