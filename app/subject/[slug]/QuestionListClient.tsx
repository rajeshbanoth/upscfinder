"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import QuestionCard from "@/components/QuestionCard";
import Pagination from "@/components/Pagination";
import LoadingSpinner from "@/components/LoadingSpinner";

interface QuestionListClientProps {
  subject: any;
  availableChapters: string[];
  availableYears: number[];
}

export default function QuestionListClient({
  subject,
  availableChapters,
  availableYears,
}: QuestionListClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [questions, setQuestions] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert URL params to proper types for FilterPanel
  const chapterFilter = searchParams.get("chapter") || "";
  const subtopicFilter = searchParams.get("subtopic") || "";
  const yearParam = searchParams.get("year");
  const yearFilter = yearParam ? parseInt(yearParam, 10) : undefined;
  const difficultyFilter = searchParams.get("difficulty") || "";

  const fetchQuestions = useCallback(async () => {
    if (!subject.slug) return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams(searchParams.toString());
    const searchQuery = params.get("search") || "";
    params.delete("search");

    const apiUrl = searchQuery
      ? `/api/search?q=${encodeURIComponent(searchQuery)}&subject=${subject.slug}&${params.toString()}`
      : `/api/questions?subject=${subject.slug}&${params.toString()}`;

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status} - ${res.statusText}`);
      }
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (err: any) {
      console.error("Fetch failed:", err);
      setError(err.message);
    }
    setLoading(false);
  }, [searchParams, subject.slug]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const updateUrl = (newParams: URLSearchParams) => {
    newParams.set("page", "1");
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleSearch = (query: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (query) {
      newParams.set("search", query);
    } else {
      newParams.delete("search");
    }
    updateUrl(newParams);
  };

  const handleFilterChange = (filters: any) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (filters.chapter) newParams.set("chapter", filters.chapter);
    else newParams.delete("chapter");
    if (filters.subtopic) newParams.set("subtopic", filters.subtopic);
    else newParams.delete("subtopic");
    // Convert year to string for URL
    if (filters.year !== undefined && filters.year !== null) {
      newParams.set("year", filters.year.toString());
    } else {
      newParams.delete("year");
    }
    if (filters.difficulty) newParams.set("difficulty", filters.difficulty);
    else newParams.delete("difficulty");
    updateUrl(newParams);
  };

  return (
    <div>
      <SearchBar
        onSearch={handleSearch}
        placeholder="Search questions, concepts, toppers..."
      />
      <div className="mt-4">
        <FilterPanel
          filters={{
            chapter: chapterFilter,
            subtopic: subtopicFilter,
            year: yearFilter,      // ✅ now a number or undefined
            difficulty: difficultyFilter,
          }}
          onFilterChange={handleFilterChange}
          chapters={availableChapters}
          difficulties={["Easy", "Medium", "Hard"]}
        />
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-red-500 text-center py-10">Error: {error}</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4">
            {questions.map((q: any) => (
              <QuestionCard key={q._id} question={q} />
            ))}
            {questions.length === 0 && (
              <p className="text-gray-500 text-center py-10">
                No questions found. Try a different search or filter.
              </p>
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/subject/${subject.slug}`}
          />
        </>
      )}
    </div>
  );
}