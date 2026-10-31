"use client";

import { useEffect, useRef, useState } from "react";
import type { PlayQuestion } from "@/types/play";

export type Answers = Record<number, number[]>;

export function usePlaySession(
  questions: PlayQuestion[],
  {
    initialAnswers,
    onAnswerChange,
  }: {
    initialAnswers: Answers;
    onAnswerChange: (questionId: number, optionIds: number[]) => void;
  },
) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);

  // A resumed attempt opens on the first open question, or on the submit step
  // when everything is answered
  const [current, setCurrent] = useState(() => {
    const firstOpen = questions.findIndex(
      (item) => (initialAnswers[item.id]?.length ?? 0) === 0,
    );
    return firstOpen === -1 ? questions.length : firstOpen;
  });

  const answersRef = useRef<Answers>(initialAnswers);
  const timingsRef = useRef<Record<number, number>>({});
  const activeRef = useRef<{ id: number; since: number } | null>(null);
  const onAnswerChangeRef = useRef(onAnswerChange);

  useEffect(() => {
    onAnswerChangeRef.current = onAnswerChange;
  });

  const total = questions.length;
  const onSubmitStep = current >= total;
  const question = onSubmitStep ? null : questions[current];
  const questionId = question?.id ?? null;

  // Time on each question: counted while it is on screen
  useEffect(() => {
    if (questionId === null) return;

    activeRef.current = { id: questionId, since: performance.now() };

    return () => {
      const active = activeRef.current;
      if (!active) return;

      timingsRef.current[active.id] =
        (timingsRef.current[active.id] ?? 0) +
        (performance.now() - active.since);
      activeRef.current = null;
    };
  }, [questionId]);

  function isAnswered(id: number) {
    return (answers[id]?.length ?? 0) > 0;
  }

  function select(optionId: number) {
    if (!question) return;

    const chosen = answersRef.current[question.id] ?? [];

    let next: number[];
    if (question.type === "MULTIPLE") {
      next = chosen.includes(optionId)
        ? chosen.filter((id) => id !== optionId)
        : [...chosen, optionId];
    } else {
      if (chosen.length === 1 && chosen[0] === optionId) return;
      next = [optionId];
    }

    answersRef.current = { ...answersRef.current, [question.id]: next };
    setAnswers(answersRef.current);
    onAnswerChangeRef.current(question.id, next);
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

  function getAnswers() {
    return answersRef.current;
  }

  // Milliseconds per question id, including the question on screen right now
  function getTimings() {
    const active = activeRef.current;

    if (active) {
      const now = performance.now();
      timingsRef.current[active.id] =
        (timingsRef.current[active.id] ?? 0) + (now - active.since);
      active.since = now;
    }

    return Object.fromEntries(
      Object.entries(timingsRef.current).map(([id, ms]) => [
        id,
        Math.round(ms),
      ]),
    );
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
    getAnswers,
    getTimings,
  };
}
