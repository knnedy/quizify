"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { motion, useInView } from "motion/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Trophy, PenTool, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "Take a Quiz",
    description:
      "Challenge yourself with our diverse range of quizzes across multiple categories and difficulty levels.",
    link: "/dashboard",
    color: "from-blue-500 to-cyan-400",
    gradient: "bg-gradient-to-br from-blue-500/10 to-cyan-400/10",
    border: "border-blue-500/20",
    hoverBg: "group-hover:bg-blue-500/10",
    hoverBorder: "group-hover:border-blue-500/40",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: <PenTool className="h-8 w-8" />,
    title: "Create a Quiz",
    description:
      "Design your own custom quizzes with our intuitive editor and share them with friends or the community.",
    link: "/dashboard",
    color: "from-purple-500 to-pink-400",
    gradient: "bg-gradient-to-br from-purple-500/10 to-pink-400/10",
    border: "border-purple-500/20",
    hoverBg: "group-hover:bg-purple-500/10",
    hoverBorder: "group-hover:border-purple-500/40",
    iconBg: "bg-purple-500/10",
  },
  {
    icon: <Trophy className="h-8 w-8" />,
    title: "Leaderboard",
    description:
      "Compete with others and see how you rank on our global and category-specific leaderboards.",
    link: "/dashboard",
    color: "from-amber-500 to-orange-400",
    gradient: "bg-gradient-to-br from-amber-500/10 to-orange-400/10",
    border: "border-amber-500/20",
    hoverBg: "group-hover:bg-amber-500/10",
    hoverBorder: "group-hover:border-amber-500/40",
    iconBg: "bg-amber-500/10",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Community",
    description:
      "Join our thriving community of quiz enthusiasts, share knowledge, and discover new content.",
    link: "/dashboard",
    color: "from-emerald-500 to-teal-400",
    gradient: "bg-gradient-to-br from-emerald-500/10 to-teal-400/10",
    border: "border-emerald-500/20",
    hoverBg: "group-hover:bg-emerald-500/10",
    hoverBorder: "group-hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10",
  },
];

export default function FeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <section
      id="features"
      ref={featuresRef}
      className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 px-3 py-1 border-primary/20 bg-primary/5 text-primary">
            Powerful Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools to create, take, and share quizzes in one
            platform
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.2 },
              }}
              className="group"
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}>
              <Card
                className={cn(
                  "h-full backdrop-blur-sm border transition-all duration-300",
                  feature.gradient,
                  feature.border,
                  feature.hoverBorder,
                  "hover:shadow-xl",
                )}>
                <CardHeader className="pb-4">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md mb-4",
                      feature.color,
                    )}>
                    <motion.div
                      animate={{
                        rotate: hoveredIndex === index ? [0, 10, -10, 0] : 0,
                      }}
                      transition={{ duration: 0.4 }}>
                      {feature.icon}
                    </motion.div>
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="ghost"
                    className={cn(
                      "group w-full justify-start p-0 hover:bg-transparent",
                      feature.hoverBg,
                    )}>
                    <Link
                      href={feature.link}
                      className="flex items-center text-primary">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
