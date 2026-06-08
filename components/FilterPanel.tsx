"use client";
import { useState } from "react";
import { Filter, X } from "lucide-react";

interface Filters {
  chapter?: string;
  subtopic?: string;
  year?: number;
  difficulty?: string;
}

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  chapters?: string[];
  difficulties?: string[];
}

export default function FilterPanel({
  filters,
  onFilterChange,
  chapters = [],
  difficulties = ["Easy", "Medium", "Hard"],
}: FilterPanelProps) {
  const [local, setLocal] = useState<Filters>(filters);

  const handleChange = (key: keyof Filters, value: string) => {
    const updated = { ...local, [key]: value || undefined };
    setLocal(updated);
  };

  const apply = () => onFilterChange(local);

  const clear = () => {
    const cleared: Filters = {};
    setLocal(cleared);
    onFilterChange(cleared);
  };

  const activeFiltersCount = Object.values(local).filter(Boolean).length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Filter size={18} />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={clear}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Chapter</label>
          <input
            type="text"
            value={local.chapter || ""}
            onChange={(e) => handleChange("chapter", e.target.value)}
            placeholder="e.g., Discipline"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            list="chapter-list"
          />
          <datalist id="chapter-list">
            {chapters.map((ch) => (
              <option key={ch} value={ch} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Subtopic</label>
          <input
            type="text"
            value={local.subtopic || ""}
            onChange={(e) => handleChange("subtopic", e.target.value)}
            placeholder="e.g., 1.2"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
          <input
            type="number"
            value={local.year || ""}
            onChange={(e) => handleChange("year", e.target.value)}
            placeholder="2024"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Difficulty</label>
          <select
            value={local.difficulty || ""}
            onChange={(e) => handleChange("difficulty", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Any</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={apply}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}