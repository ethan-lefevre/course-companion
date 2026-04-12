import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AddFriendForm from "./../components/AddFriendForm";
import FriendRequests from "./../components/FriendRequests";

export default async function FriendsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: incomingRequests, error: incomingError } = await supabase
    .from("friendships")
    .select(`
      id,
      requester:profiles!friendships_requester_id_fkey (
        username,
        full_name
      )
    `)
    .eq("addressee_id", user.id)
    .eq("status", "pending");

  if (incomingError) {
    console.error("Incoming requests error:", incomingError);
  }

  const { data: outgoingAccepted, error: outgoingError } = await supabase
    .from("friendships")
    .select(`
      id,
      addressee:profiles!friendships_addressee_id_fkey (
        id,
        username,
        full_name,
        major,
        year
      )
    `)
    .eq("requester_id", user.id)
    .eq("status", "accepted");

  if (outgoingError) {
    console.error("Outgoing accepted friends error:", outgoingError);
  }

  const { data: incomingAccepted, error: incomingAcceptedError } = await supabase
    .from("friendships")
    .select(`
      id,
      requester:profiles!friendships_requester_id_fkey (
        id,
        username,
        full_name,
        major,
        year
      )
    `)
    .eq("addressee_id", user.id)
    .eq("status", "accepted");

  if (incomingAcceptedError) {
    console.error("Incoming accepted friends error:", incomingAcceptedError);
  }

  const friends = [
    ...((outgoingAccepted || []).map((f: any) => f.addressee).filter(Boolean)),
    ...((incomingAccepted || []).map((f: any) => f.requester).filter(Boolean)),
  ];

  return (
    <main className="page">
      <div className="spacer-lg">
        <Link href="/dashboard" className="link-button">
          Back to Dashboard
        </Link>
      </div>

      <h1 className="title" style={{ fontSize: 42 }}>Friends</h1>

      <div className="card spacer-xl">
        <h2 className="section-title">Find people</h2>
        <AddFriendForm />
      </div>

      <div className="card spacer-xl">
        <h2 className="section-title">Pending requests</h2>
        <FriendRequests requests={(incomingRequests as any[]) || []} />
      </div>

      <div>
        <h2 className="section-title">Your friends</h2>

        {!friends.length ? (
          <p className="muted">No friends yet.</p>
        ) : (
          <div className="list">
            {friends.map((friend: any) => (
              <Link
                key={friend.id}
                href={`/u/${friend.username}`}
                className="student-card"
              >
                <div className="avatar">
                  {(friend.full_name || friend.username).charAt(0).toUpperCase()}
                </div>

                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {friend.full_name || friend.username}
                  </p>
                  <p className="muted" style={{ margin: "4px 0 0" }}>
                    @{friend.username}
                  </p>

                  {friend.major && (
                    <p className="muted" style={{ margin: "8px 0 0" }}>
                      Major: {friend.major}
                    </p>
                  )}

                  {friend.year && (
                    <p className="muted" style={{ margin: "4px 0 0" }}>
                      Year: {friend.year}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}