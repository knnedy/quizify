import { tryCatch } from "@/lib/try-catch";
import QuizQuestion from "./components/quiz-question";
import { auth } from "@/server/auth";
import { getPublicQuiz } from "@/server/actions/quiz/read";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    quizId: string;
  }>;
};

export default async function PlayQuizPage({ params }: Props) {
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

  return <QuizQuestion quiz={quiz} session={session} />;
}
