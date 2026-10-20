import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import QuizPreviewContent from "./components/preview-content";
import { getOwnerQuiz } from "@/server/actions/quiz/read";
import { tryCatch } from "@/lib/try-catch";

type Props = {
  params: Promise<{
    quizId: string;
  }>;
};

export default async function QuizPreviewPage({ params }: Props) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const { quizId } = await params;

  const { data: quiz, error: quizError } = await tryCatch(
    getOwnerQuiz(parseInt(quizId), session.user.id),
  );
  if (quizError) {
    throw new Error(quizError.message);
  }

  return <QuizPreviewContent quiz={quiz} />;
}
