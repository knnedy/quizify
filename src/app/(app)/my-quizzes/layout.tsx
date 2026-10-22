import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Quizzes",
  description: "This is where you can manage your quizzes.",
};

interface MyQuizzesLayoutProps {
  children: React.ReactNode;
}

export default function MyQuizzesLayout({ children }: MyQuizzesLayoutProps) {
  return (
    <main className="container mx-auto px-4 py-4 min-h-screen md:px-10 lg:px-14">
      {children}
    </main>
  );
}
