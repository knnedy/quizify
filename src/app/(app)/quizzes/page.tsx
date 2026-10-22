import { auth } from "@/server/auth";
import QuizzesContent from "./components/quizzes-content";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPublicQuizzes } from "@/server/actions/quiz/read";
import { tryCatch } from "@/lib/try-catch";
import { getUserBookmarkedQuizzes } from "@/server/actions/quiz/bookmark";
import { getTopRatedQuizzes } from "@/server/actions/quiz/rating";

export default async function QuizzesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const { data: publicQuizzes, error: publicQuizzesError } = await tryCatch(
    getPublicQuizzes(session.user.id),
  );
  if (publicQuizzesError) {
    throw new Error(publicQuizzesError.message);
  }

  const { data: topRatedQuizzes, error: topRatedQuizzesError } = await tryCatch(
    getTopRatedQuizzes(session.user.id),
  );
  if (topRatedQuizzesError) {
    throw new Error(topRatedQuizzesError.message);
  }

  const { data: bookmarkedQuizzes, error: bookmarkedQuizzesError } =
    await tryCatch(getUserBookmarkedQuizzes(session.user.id));
  if (bookmarkedQuizzesError) {
    throw new Error(bookmarkedQuizzesError.message);
  }

  return (
    <QuizzesContent
      quizzes={publicQuizzes ?? []}
      topRatedQuizzes={topRatedQuizzes ?? []}
      bookmarkedQuizzes={bookmarkedQuizzes ?? []}
    />
  );
}
