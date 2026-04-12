import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="home-page">
      <div className="home-shell">
        <header className="home-header">
          <div className="home-brand">CourseCompanion</div>

          <div className="home-actions">
            {user ? (
              <Link href="/dashboard" className="link-button">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="link-button">
                  Log in
                </Link>
                <Link href="/signup" className="button button-primary">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </header>

        <section className="home-hero">
          <p className="home-kicker">For GRCC students</p>

          <h1 className="home-title">
            Meeting people on campus
            <br />
            shouldn’t be this hard.
          </h1>

          <p className="home-text">
            CourseCompanion helps you see who’s in your classes, find familiar
            faces, and make campus feel a little smaller.
          </p>

          <div className="home-cta">
            {user ? (
              <Link href="/dashboard" className="button button-primary">
                Open dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className="button button-primary">
                  Create account
                </Link>
                <Link href="/login" className="link-button">
                  I already have one
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="home-info">
          <div className="home-info-block">
            <h2>What it does</h2>
            <p>
              Add your classes, browse student profiles, and connect with people
              you’re already around.
            </p>
          </div>

          <div className="home-info-block">
            <h2>Why it exists</h2>
            <p>
              Community college can lack the social environment of a university. My goal is to change that. 
              Search for people by interest, class and major if you're looking to break the ice.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}