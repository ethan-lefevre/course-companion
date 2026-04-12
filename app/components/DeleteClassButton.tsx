"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  enrollmentId: string;
};

export default function DeleteClassButton({ enrollmentId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm("Remove this class from your list?");
    if (!confirmed) return;

    try {
      setLoading(true);

      const res = await fetch("/api/delete-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enrollmentId }),
      });

      const data = await res.json();

      if (data.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="button"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "Removing..." : "Remove"}
    </button>
  );
}