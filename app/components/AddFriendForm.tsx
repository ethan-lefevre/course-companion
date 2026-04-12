"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SearchUser = {
  id: string;
  username: string;
  full_name: string | null;
  major: string | null;
  year: string | null;
};

export default function AddFriendForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSearching(true);
        setMessage("");

        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(trimmed)}`
        );
        const data = await res.json();

        if (!data.success) {
          setResults([]);
          return;
        }

        setResults(data.users || []);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  async function handleAddFriend(username: string) {
    try {
      setSendingTo(username);
      setMessage("");

      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!data.success) {
        setMessage(data.error || "Something went wrong.");
        setSendingTo(null);
        return;
      }

      setMessage(`Friend request sent to @${username}.`);
      router.refresh();
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSendingTo(null);
    }
  }

  return (
    <div className="stack">
      <input
        className="input"
        type="text"
        placeholder="Search by username or name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {searching && <p className="muted">Searching users...</p>}

      {message && (
        <p
          className={
            message.includes("sent") ? "success" : "error"
          }
        >
          {message}
        </p>
      )}

      {query.trim().length >= 2 && !searching && results.length === 0 && (
        <p className="muted">No users found.</p>
      )}

      {results.length > 0 && (
        <div className="list">
          {results.map((user) => (
            <div key={user.id} className="student-card">
              <div className="avatar">
                {(user.full_name || user.username).charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <Link
                  href={`/u/${user.username}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {user.full_name || user.username}
                  </p>
                  <p className="muted" style={{ margin: "4px 0 0" }}>
                    @{user.username}
                  </p>

                  {user.major && (
                    <p className="muted" style={{ margin: "8px 0 0" }}>
                      Major: {user.major}
                    </p>
                  )}

                  {user.year && (
                    <p className="muted" style={{ margin: "4px 0 0" }}>
                      Year: {user.year}
                    </p>
                  )}
                </Link>
              </div>

              <button
                className="button"
                onClick={() => handleAddFriend(user.username)}
                disabled={sendingTo === user.username}
              >
                {sendingTo === user.username ? "Sending..." : "Add Friend"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}