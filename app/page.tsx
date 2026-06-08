import dbConnect from "@/lib/dbConnect";
import Subject from "@/models/Subject";
import SubjectCard from "@/components/SubjectCard";
import SubjectDropdown from "@/components/SubjectDropdown";

export const dynamic = "force-dynamic";

async function getSubjects() {
  await dbConnect();
  const subjects = await Subject.find({}).lean();
  return JSON.parse(JSON.stringify(subjects));
}

export default async function HomePage() {
  const subjects = await getSubjects();
  const gsSubjects = subjects.filter((s: any) => s.type === "GS" && s.enabled);
  const optionalSubjects = subjects.filter(
    (s: any) => s.type === "Optional" && s.enabled
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Explore Topper Answer Copies
      </h1>

      {/* GS Papers as cards */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          General Studies
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gsSubjects.map((sub: any) => (
            <SubjectCard key={sub.slug} subject={sub} />
          ))}
        </div>
      </section>

      {/* Optional Subjects dropdown */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Optional Subjects
        </h2>
        <SubjectDropdown
          subjects={optionalSubjects}
          label="Choose an optional subject:"
        />
        {optionalSubjects.length === 0 && (
          <p className="text-gray-500 mt-2 text-sm">
            No optional subjects available at the moment.
          </p>
        )}
      </section>
    </div>
  );
}