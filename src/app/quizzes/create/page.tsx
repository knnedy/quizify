import { redirect } from "next/navigation";
import QuizForm from "./components/quiz-form";
import { auth } from "@/server/auth";
import { headers } from "next/headers";

export default async function CreateQuizPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return <QuizForm session={session} />;
}
