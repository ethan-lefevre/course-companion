"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CourseSuggestion = {
  id: string;
  code: string;
  title?: string | null;
};

const SEMESTER_OPTIONS = [
  "Fall 2025",
  "Winter 2026",
  "Spring 2026",
  "Summer 2026",
  "Fall 2026",
  "Winter 2027",
];

function normalizeCourseCode(input: string) {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, " ");
  const match = cleaned.match(/^([A-Z]+)\s*([0-9]+[A-Z]?)$/);

  if (!match) return cleaned;

  return `${match[1]} ${match[2]}`;
}

export default function AddClassForm() {
  const [code, setCode] = useState("");
  const [semester, setSemester] = useState("Fall 2026");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CourseSuggestion[]>([]);
  const [searching, setSearching] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const trimmed = code.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSearching(true);

        const normalized = normalizeCourseCode(trimmed);

        const res = await fetch(
          `/api/search-courses?q=${encodeURIComponent(normalized)}`
        );
        const data = await res.json();

        setSuggestions(data.courses || []);
      } catch (error) {
        console.error("Course search failed:", error);
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [code]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const normalizedCode = normalizeCourseCode(code);

      const res = await fetch("/api/add-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: normalizedCode,
          semester,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`Added ${data.course.code}`);
        setCode("");
        setSuggestions([]);
        router.refresh();
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestionClick(selectedCode: string) {
    setCode(selectedCode);
    setSuggestions([]);
  }

  return (
    <form onSubmit={handleSubmit} className="stack" style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          className="input"
          type="text"
          placeholder="Enter class code, like CIS 120"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
        />

        {searching && (
          <p className="muted" style={{ marginTop: 8 }}>
            Searching classes...
          </p>
        )}

        {suggestions.length > 0 && (
          <div className="autocomplete-dropdown">
            {suggestions.map((course) => (
              <button
                key={course.id}
                type="button"
                className="autocomplete-item"
                onClick={() => handleSuggestionClick(course.code)}
              >
                <span style={{ fontWeight: 600 }}>{course.code}</span>
                {course.title ? (
                  <span className="muted" style={{ marginLeft: 8 }}>
                    {course.title}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>

      <select
        className="input"
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
      >
        {SEMESTER_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <button className="button button-primary" type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add class"}
      </button>

      {message && (
        <p className={message.startsWith("Added") ? "success" : "error"}>
          {message}
        </p>
      )}
    </form>
  );
}