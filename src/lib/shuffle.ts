function createRandom(seed: number) {
  let state = seed | 0;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The same seed always gives the same order, so a resumed attempt looks the
// same as before
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const copy = [...items];
  const random = createRandom(seed);

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    if (a === undefined || b === undefined) continue;
    copy[i] = b;
    copy[j] = a;
  }

  return copy;
}

// The order a player saw during an attempt. Play and review both call this, so
// the letters on the options match in both places. True or false options keep
// their order.
export function arrangeQuestions<
  Q extends { id: number; type: string; options: readonly unknown[] },
>(
  questions: Q[],
  settings: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    seed: number;
  },
): Q[] {
  const arranged = questions.map((question) =>
    settings.shuffleOptions && question.type !== "TRUE_FALSE"
      ? {
          ...question,
          options: seededShuffle(question.options, settings.seed + question.id),
        }
      : question,
  );

  return settings.shuffleQuestions
    ? seededShuffle(arranged, settings.seed)
    : arranged;
}
