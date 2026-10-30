import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { QuizDemo } from "@/components/quiz-demo";
import { cn } from "@/lib/utils";

export default function HeroSection({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_88%_0%,var(--glow),transparent)]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-16 sm:py-24 lg:grid-cols-[1fr_1.05fr]">
        <div className="space-y-7">
          <h1 className="text-5xl leading-[1.02] sm:text-6xl">
            Test what you know. Learn what you don&apos;t.
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Play quick quizzes on anything from geography to JavaScript, keep
            your streak alive and build your own for others to try.
          </p>
          <div className="flex flex-wrap gap-3">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "shadow-primary",
                )}>
                Go to dashboard
              </Link>
            ) : (
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "shadow-primary",
                )}>
                Get started
              </Link>
            )}
            <Link
              href="/quizzes"
              className={buttonVariants({ variant: "outline", size: "lg" })}>
              Browse quizzes
            </Link>
          </div>
          {!isSignedIn && (
            <p className="text-sm text-muted-foreground">
              Browsing is open to everyone. Sign in when you&apos;re ready to
              play.
            </p>
          )}
        </div>

        <div className="flex justify-center lg:justify-end">
          <QuizDemo />
        </div>
      </div>
    </section>
  );
}
