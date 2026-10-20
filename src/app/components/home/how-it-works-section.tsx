"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { BookOpen, PenTool, Zap, User } from "lucide-react";
import { cn } from "@/lib/utils";

const howItWorks = [
  {
    title: "Sign Up",
    description:
      "Create your free account in seconds and join our community of quiz enthusiasts.",
    icon: <User className="h-8 w-8" />,
    color: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-500",
  },
  {
    title: "Explore Quizzes",
    description:
      "Browse through thousands of quizzes across various categories and difficulty levels.",
    icon: <BookOpen className="h-8 w-8" />,
    color: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    iconColor: "text-purple-500",
  },
  {
    title: "Challenge Yourself",
    description:
      "Take quizzes, earn points, and track your progress as you improve your knowledge.",
    icon: <Zap className="h-8 w-8" />,
    color: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    iconColor: "text-amber-500",
  },
  {
    title: "Create & Share",
    description:
      "Design your own quizzes and share them with friends or the Quizify community.",
    icon: <PenTool className="h-8 w-8" />,
    color: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    iconColor: "text-emerald-500",
  },
];

export default function HowItWorksSection() {
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const howItWorksInView = useInView(howItWorksRef, {
    once: true,
    amount: 0.3,
  });
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 px-3 py-1 border-primary/20 bg-primary/5 text-primary">
            Simple Process
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How Quizify Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes and begin your knowledge journey
          </p>
        </div>

        <div ref={howItWorksRef} className="relative">
          {/* Connection line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-primary/20 via-primary/40 to-primary/20 hidden md:block"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative">
                <div
                  className={cn(
                    "rounded-xl p-6 border backdrop-blur-sm relative z-10 h-full",
                    step.color,
                    step.borderColor,
                  )}>
                  <div className="absolute -top-5 -right-5 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>

                  <div className="flex justify-center mb-6">
                    <motion.div
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center border-2 bg-white dark:bg-gray-900",
                        step.borderColor,
                        step.iconColor,
                      )}
                      initial={{ scale: 0.5 }}
                      animate={howItWorksInView ? { scale: 1 } : {}}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1 + 0.2,
                      }}>
                      {step.icon}
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-foreground flex items-center justify-center text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                    </motion.div>
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-center">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
