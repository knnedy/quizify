const LONG_OPTION_LENGTH = 40;

type LayoutQuestion = {
  type: string;
  options: { label: string }[];
};

// One long option stacks the whole question so every tile in it keeps the
// same width. True/false always stays as two tiles.
export function shouldStackOptions(question: LayoutQuestion) {
  if (question.type === "TRUE_FALSE") return false;

  return question.options.some(
    (option) => option.label.length > LONG_OPTION_LENGTH,
  );
}
