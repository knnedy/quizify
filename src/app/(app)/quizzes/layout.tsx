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
  return <>{children}</>;
}
