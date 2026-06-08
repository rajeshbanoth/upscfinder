"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ISubject } from "@/models/Subject";

export default function SubjectDropdown({
  subjects,
  label,
}: {
  subjects: ISubject[];
  label: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    setSelected(slug);
    if (slug) router.push(`/subject/${slug}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={selected}
        onChange={handleChange}
        className="border rounded p-2 bg-white text-sm"
      >
        <option value="">-- Choose --</option>
        {subjects.map((sub) => (
          <option key={sub.slug} value={sub.slug} disabled={!sub.enabled}>
            {sub.name} {sub.enabled ? "" : "(currently unavailable)"}
          </option>
        ))}
      </select>
    </div>
  );
}