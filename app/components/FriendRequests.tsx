"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RequestItem = {
  id: string;
  requester: {
    username: string;
    full_name: string | null;
  };
};

type Props = {
  requests: RequestItem[];
};

export default function FriendRequests({ requests }: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function acceptRequest(friendshipId: string) {
    try {
      setLoadingId(friendshipId);

      const res = await fetch("/api/friends/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendshipId }),
      });

      const data = await res.json();

      if (data.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Accept request failed:", error);
    } finally {
      setLoadingId(null);
    }
  }

  if (!requests.length) {
    return <p className="muted">No pending friend requests.</p>;
  }

  return (
    <div className="list">
      {requests.map((request) => (
        <div key={request.id} className="card">
          <div style={{ marginBottom: 12 }}>
            <Link
              href={`/u/${request.requester.username}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>
                {request.requester.full_name || request.requester.username}
              </p>
              <p className="muted" style={{ marginTop: 4 }}>
                @{request.requester.username}
              </p>
            </Link>
          </div>

          <button
            className="button"
            onClick={() => acceptRequest(request.id)}
            disabled={loadingId === request.id}
          >
            {loadingId === request.id ? "Accepting..." : "Accept"}
          </button>
        </div>
      ))}
    </div>
  );
}