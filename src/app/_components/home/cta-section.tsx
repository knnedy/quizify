import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CtaSection({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="px-6 pb-20 sm:pb-24">
      <div className="mx-auto max-w-6xl rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground sm:px-16 sm:py-20">
        <h2 className="mx-auto max-w-2xl text-4xl sm:text-5xl">
          Ready for your first question?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-primary-foreground/80">
          Pick a quiz and play your first round in minutes. Your progress starts
          counting from the first answer.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-background text-foreground hover:bg-background/90",
            )}>
            {isSignedIn ? "Go to dashboard" : "Create free account"}
          </Link>
          <Link
            href="/quizzes"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
            )}>
            Browse quizzes
          </Link>
        </div>
      </div>
    </section>
  );
}
