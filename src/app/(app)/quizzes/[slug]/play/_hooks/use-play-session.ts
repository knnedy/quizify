"use client";

import { useState } from "react";
import type { PlayQuestion } from "../mock-data";

export type Answers = Record<number, number[]>;

export function usePlaySession(questions: PlayQuestion[]) {
  const [answers, setAnswers] = useState<Answers>({});
  const [current, setCurrent] = useState(0);

  const total = questions.length;
  const onSubmitStep = current >= total;
  const question = onSubmitStep ? null : questions[current];

  function isAnswered(questionId: number) {
    return (answers[questionId]?.length ?? 0) > 0;
  }

  function select(optionId: number) {
    if (!question) return;

    setAnswers((previous) => {
      if (question.type !== "MULTIPLE") {
        return { ...previous, [question.id]: [optionId] };
      }

      const chosen = previous[question.id] ?? [];
      const next = chosen.includes(optionId)
        ? chosen.filter((id) => id !== optionId)
        : [...chosen, optionId];

      return { ...previous, [question.id]: next };
    });
  }

  function goTo(index: number) {
    setCurrent(Math.min(Math.max(index, 0), total));
  }

  function next() {
    setCurrent((value) => Math.min(value + 1, total));
  }

  function previous() {
    setCurrent((value) => Math.max(value - 1, 0));
  }

  const unanswered = questions.flatMap((item, index) =>
    isAnswered(item.id) ? [] : [{ index, title: item.title }],
  );

  return {
    answers,
    current,
    total,
    question,
    onSubmitStep,
    answeredCount: total - unanswered.length,
    unanswered,
    isAnswered,
    select,
    goTo,
    next,
    previous,
  };
}
