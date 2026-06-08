"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface Suggestion {
  _id: string;
  text: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search questions, concepts, toppers...",
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}&mode=autocomplete`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowDropdown(data.suggestions?.length > 0);
      } catch (e) {
        setSuggestions([]);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [value]);

  const clearSearch = () => {
    setValue("");
    setSuggestions([]);
    onSearch("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      setShowDropdown(false);
    }
  };

  const handleSelect = (text: string) => {
    setValue(text);
    setShowDropdown(false);
    onSearch(text);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-16 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {value && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
            {loading && (
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            )}
          </div>
        </div>
      </form>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-auto">
          {suggestions.map((s) => (
            <li
              key={s._id}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(s.text);
              }}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <span className="line-clamp-1">{s.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}