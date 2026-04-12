"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SearchUser = {
  id: string;
  username: string;
  full_name: string | null;
  major: string | null;
  year: string | null;
  interests: string | null;
  avatar_url: string | null;
};

type SearchCourse = {
  id: string;
  code: string;
  title: string | null;
};

export default function DashboardSearchBar() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [courses, setCourses] = useState<SearchCourse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setUsers([]);
      setCourses([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const [usersRes, coursesRes] = await Promise.all([
          fetch(`/api/users/search?q=${encodeURIComponent(trimmed)}`),
          fetch(`/api/search-courses?q=${encodeURIComponent(trimmed)}`),
        ]);

        const usersData = await usersRes.json();
        const coursesData = await coursesRes.json();

        setUsers(usersData.users || []);
        setCourses(coursesData.courses || []);
      } catch (error) {
        console.error("Dashboard search failed:", error);
        setUsers([]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="search-wrap">
      <input
        className="search-input"
        type="text"
        placeholder="Search users, majors, interests, or classes"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {query.trim().length >= 2 && (
        <div className="autocomplete-dropdown">
          {loading ? (
            <div className="autocomplete-item">
              <span className="muted">Searching...</span>
            </div>
          ) : users.length === 0 && courses.length === 0 ? (
            <div className="autocomplete-item">
              <span className="muted">No matches found.</span>
            </div>
          ) : (
            <>
              {users.length > 0 && (
                <>
                  <div
                    className="autocomplete-item"
                    style={{ background: "#fafbfc", cursor: "default" }}
                  >
                    <strong>People</strong>
                  </div>

                  {users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/u/${user.username}`}
                      className="autocomplete-item"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="avatar">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} />
                          ) : (
                            (user.full_name || user.username).charAt(0).toUpperCase()
                          )}
                        </div>

                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {user.full_name || user.username}
                          </div>
                          <div className="muted">@{user.username}</div>
                          {user.major && (
                            <div className="muted">Major: {user.major}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              )}

              {courses.length > 0 && (
                <>
                  <div
                    className="autocomplete-item"
                    style={{ background: "#fafbfc", cursor: "default" }}
                  >
                    <strong>Classes</strong>
                  </div>

                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/course/${encodeURIComponent(course.code)}`}
                      className="autocomplete-item"
                    >
                      <span style={{ fontWeight: 600 }}>{course.code}</span>
                      {course.title ? (
                        <span className="muted" style={{ marginLeft: 8 }}>
                          {course.title}
                        </span>
                      ) : null}
                    </Link>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}