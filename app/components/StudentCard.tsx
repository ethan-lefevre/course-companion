import Link from "next/link";

type StudentCardProps = {
  username: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  major?: string | null;
  year?: string | null;
  interests?: string | null;
};

export default function StudentCard({
  username,
  fullName,
  avatarUrl,
  major,
  year,
  interests,
}: StudentCardProps) {
  const displayName = fullName || username;

  return (
    <Link href={`/u/${username}`} className="student-card">
      <div className="avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt={username} />
        ) : (
          displayName.charAt(0).toUpperCase()
        )}
      </div>

      <div>
        <p style={{ margin: 0, fontWeight: 600 }}>{displayName}</p>
        <p className="muted" style={{ margin: "4px 0 0" }}>
          @{username}
        </p>

        {major && (
          <p className="muted" style={{ margin: "8px 0 0" }}>
            Major: {major}
          </p>
        )}

        {year && (
          <p className="muted" style={{ margin: "4px 0 0" }}>
            Year: {year}
          </p>
        )}

        {interests && (
          <p className="muted" style={{ margin: "4px 0 0" }}>
            Interests: {interests}
          </p>
        )}
      </div>
    </Link>
  );
}