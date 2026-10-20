"use client";

import { BookOpen, Sparkles, Globe, User } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

const stats = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    value: "1000+",
    label: "Quizzes Created",
  },
  {
    icon: <User className="h-6 w-6" />,
    value: "500+",
    label: "Active Users",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    value: "200+",
    label: "Quiz Categories",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    value: "50+",
    label: "Countries Served",
  },
];

export default function StatsSection() {
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });

  return (
    <section id="stats" className="py-16 relative">
      <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-primary/10 h-1/2 transform skew-y-3"></div>
      <div ref={statsRef} className="container mx-auto px-4 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20 dark:border-white/10 shadow-lg">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  {stat.icon}
                </div>
              </div>
              <motion.h3
                className="text-3xl md:text-4xl font-bold text-foreground"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}>
                {stat.value}
              </motion.h3>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
