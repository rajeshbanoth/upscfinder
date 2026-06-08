import Link from "next/link";
import { ISubject } from "@/models/Subject";

export default function SubjectCard({ subject }: { subject: ISubject }) {
  return (
    <Link href={`/subject/${subject.slug}`}>
      <div className="border rounded-lg p-6 shadow hover:shadow-lg transition cursor-pointer bg-white">
        <h3 className="text-xl font-semibold text-gray-800">{subject.name}</h3>
        {subject.description && (
          <p className="text-gray-500 mt-2 text-sm">{subject.description}</p>
        )}
        <span className="text-xs text-gray-400 mt-3 block">
          {subject.type === "GS" ? "General Studies" : "Optional Subject"}
        </span>
      </div>
    </Link>
  );
}