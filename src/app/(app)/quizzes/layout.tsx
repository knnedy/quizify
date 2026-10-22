import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Quizzes",
  description: "This is the explore quizzes page.",
};

interface QuizzesLayoutProps {
  children: React.ReactNode;
}

export default function QuizzesLayout({ children }: QuizzesLayoutProps) {
  return (
    <main className="container mx-auto px-4 py-4 min-h-screen md:px-10 lg:px-14">
      {children}
    </main>
  );
}
