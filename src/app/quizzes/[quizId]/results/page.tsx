import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import QuizResultsCard from "./components/quiz-results-card";
import { getUserQuizAttempt } from "@/server/user/quiz-attempts";
import { getOwnerQuiz } from "@/server/actions/quiz/read";
import { tryCatch } from "@/lib/try-catch";

type Props = {
  params: Promise<{
    quizId: string;
  }>;
};

export default async function QuizResultsPage({ params }: Props) {
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

  const { data: quizAttempt, error: userAttemptError } = await tryCatch(
    getUserQuizAttempt(session.user.id, parseInt(quizId)),
  );
  if (userAttemptError) {
    throw new Error(userAttemptError.message);
  }

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 pt-4">
      <QuizResultsCard
        quiz={quiz}
        quizAttempt={quizAttempt}
        userId={session.user.id}
      />
    </div>
  );
}
