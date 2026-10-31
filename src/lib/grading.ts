import type { QuestionType } from "@/types/play";

// An answer is right only when the chosen options are exactly the correct ones
export function isAnswerCorrect(
  correctIds: readonly number[],
  selectedIds: readonly number[],
) {
  if (correctIds.length === 0) return false;
  if (new Set(selectedIds).size !== correctIds.length) return false;

  const selected = new Set(selectedIds);
  return correctIds.every((id) => selected.has(id));
}

// A selection is valid when every option belongs to the question, none repeat,
// and only multiple answer questions take more than one
export function isValidSelection(
  type: QuestionType,
  selectedIds: readonly number[],
  optionIds: ReadonlySet<number>,
) {
  if (new Set(selectedIds).size !== selectedIds.length) return false;
  if (!selectedIds.every((id) => optionIds.has(id))) return false;
  return type === "MULTIPLE" || selectedIds.length <= 1;
}
