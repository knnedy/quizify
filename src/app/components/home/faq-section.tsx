import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I create my own quiz?",
    answer:
      "Creating a quiz is simple! After signing in, navigate to the dashboard and click on 'Create Quiz'. Follow the step-by-step guide to add questions, set answers, and customize your quiz settings before publishing.",
  },
  {
    question: "Can I share my quizzes with friends?",
    answer:
      "Every quiz you create has a unique shareable link. You can also set privacy options to make your quiz public, private, or available only to people with the link.",
  },
  {
    question: "Is Quizify free to use?",
    answer:
      "Quizify offers both free and premium plans. The free plan gives you access to most features, while our premium plans offer additional customization options, analytics, and ad-free experience.",
  },
  {
    question: "How are the leaderboards calculated?",
    answer:
      "Leaderboards are calculated based on quiz scores, completion time, and difficulty level. We use a weighted algorithm to ensure fair rankings across different quiz types and categories.",
  },
  {
    question: "Can I use Quizify for educational purposes?",
    answer:
      "Yes! Quizify is perfect for educational settings. We offer special features for teachers and educators, including classroom management, student progress tracking, and curriculum-aligned quiz templates.",
  },
];

export default function FAQSection() {
  return (
    <section
      id="faq"
      className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 px-3 py-1 border-primary/20 bg-primary/5 text-primary">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about Quizify
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-border">
                <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
