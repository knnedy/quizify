import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { getOwnerQuiz } from "@/server/actions/quiz/read";
import { getUserQuizAttempt } from "@/server/user/quiz-attempts";
import QuizReview from "./components/quiz-review";
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

  const { data: quizAttempt, error: quizAttemptError } = await tryCatch(
    getUserQuizAttempt(session.user.id, parseInt(quizId)),
  );
  if (quizAttemptError) {
    throw new Error(quizAttemptError.message);
  }

  return <QuizReview quiz={quiz} quizAttempt={quizAttempt} />;
}
