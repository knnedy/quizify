import { ChevronDownIcon } from "lucide-react";

const faqs = [
  {
    question: "Do I need an account to play?",
    answer:
      "You can browse every quiz without one. To play, you need a free account, so your score, XP and streak are saved.",
  },
  {
    question: "How does XP work?",
    answer:
      "Every finished quiz earns XP. As your total grows you level up, and some achievements add bonus XP on top.",
  },
  {
    question: "How do streaks work?",
    answer:
      "Finish at least one quiz a day to keep your streak going. If you miss a day it starts over, but your best streak is always kept.",
  },
  {
    question: "Can I make my own quizzes?",
    answer:
      "Yes. Any signed-in user can create a quiz with a title, category, difficulty and questions. Keep it as a draft until you are ready to publish.",
  },
  {
    question: "Are quizzes timed?",
    answer:
      "Only if the creator sets a time limit. Timed quizzes show a countdown line at the top of each question.",
  },
];

export default function FaqSection() {
  return (
    <section
      id="faq"
      className="mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-6 py-20 sm:py-24 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl">Questions, answered</h2>
        <p className="max-w-sm text-base text-muted-foreground">
          Short answers to what new players ask most.
        </p>
      </div>

      <div>
        {faqs.map((faq) => (
          <details key={faq.question} className="group border-b first:border-t">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md py-5 text-lg font-medium focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
              {faq.question}
              <ChevronDownIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="max-w-prose pb-5 text-base text-muted-foreground">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
