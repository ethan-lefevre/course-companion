import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CourseCompanion",
  description: "See who is in your classes at GRCC",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}