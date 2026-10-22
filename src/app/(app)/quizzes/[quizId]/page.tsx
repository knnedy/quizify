import { auth } from "@/server/auth";
// import { getPublicQuiz } from "@/server/quiz/get";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import QuizDetails from "./components/quiz-details";
import { getPublicQuiz } from "@/server/actions/quiz/read";
import { getUserQuizAttempts } from "@/server/user/quiz-attempts";
import { getQuizLeaderboard } from "@/server/actions/quiz/leaderboard";
import { tryCatch } from "@/lib/try-catch";

type Props = {
  params: Promise<{
    quizId: string;
  }>;
};

export default async function QuizQuestionPage({ params }: Props) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const { quizId } = await params;

  const { data: quiz, error: quizError } = await tryCatch(
    getPublicQuiz(parseInt(quizId), session.user.id),
  );
  if (quizError) {
    throw new Error(quizError.message);
  }

  const { data: quizAttempts, error: userAttemptsError } = await tryCatch(
    getUserQuizAttempts(session.user.id, parseInt(quizId)),
  );
  if (userAttemptsError) {
    throw new Error(userAttemptsError.message);
  }

  const { data: leaderboard, error: leaderboardError } = await tryCatch(
    getQuizLeaderboard(parseInt(quizId)),
  );
  if (leaderboardError) {
    throw new Error(leaderboardError.message);
  }

  return (
    <QuizDetails
      quiz={quiz}
      userAttempts={quizAttempts}
      leaderboard={leaderboard}
      session={session}
    />
  );
}
