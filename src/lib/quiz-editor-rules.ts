import type {
  EditorIssue,
  EditorOption,
  EditorQuestion,
  QuestionType,
  QuizSettings,
} from "@/types/quiz-editor";

export const limits = {
  titleMin: 3,
  titleMax: 80,
  descriptionMin: 10,
  descriptionMax: 300,
  questionMax: 250,
  optionMax: 120,
  explanationMax: 400,
  optionsMin: 2,
  optionsMax: 6,
  questionsMin: 5,
  questionsMax: 50,
  tagsMax: 5,
  tagMax: 24,
  minutesMin: 1,
  minutesMax: 180,
} as const;

export const questionTypes = [
  "SINGLE",
  "MULTIPLE",
  "TRUE_FALSE",
] as const satisfies readonly QuestionType[];

export const questionTypeLabels: Record<QuestionType, string> = {
  SINGLE: "Single answer",
  MULTIPLE: "Multiple answers",
  TRUE_FALSE: "True or false",
};

export type SettingsErrors = {
  title?: string;
  description?: string;
  category?: string;
};

export type QuestionErrors = {
  title?: string;
  options?: string;
  correct?: string;
  emptyOptions: string[];
};

export function validateSettings(settings: QuizSettings): SettingsErrors {
  const errors: SettingsErrors = {};

  if (settings.title.trim().length < limits.titleMin) {
    errors.title = `Use at least ${limits.titleMin} characters.`;
  }
  if (settings.description.trim().length < limits.descriptionMin) {
    errors.description = `Use at least ${limits.descriptionMin} characters.`;
  }
  if (!settings.category) {
    errors.category = "Pick a category.";
  }

  return errors;
}

export function validateQuestion(question: EditorQuestion): QuestionErrors {
  const errors: QuestionErrors = { emptyOptions: [] };

  if (!question.title.trim()) {
    errors.title = "Write the question.";
  }

  for (const option of question.options) {
    if (!option.label.trim()) errors.emptyOptions.push(option.key);
  }
  if (errors.emptyOptions.length > 0) {
    errors.options =
      "Fill in every answer, or remove the ones you do not need.";
  }

  if (!question.options.some((option) => option.isCorrect)) {
    errors.correct =
      question.type === "MULTIPLE"
        ? "Mark at least one correct answer."
        : "Mark the correct answer.";
  }

  return errors;
}

export function isQuestionComplete(question: EditorQuestion) {
  const errors = validateQuestion(question);
  return !errors.title && !errors.options && !errors.correct;
}

export function collectIssues(
  settings: QuizSettings,
  questions: EditorQuestion[],
): EditorIssue[] {
  const issues: EditorIssue[] = [];

  if (Object.keys(validateSettings(settings)).length > 0) {
    issues.push({
      target: { kind: "details" },
      message: "Finish the quiz details.",
    });
  }

  if (questions.length < limits.questionsMin) {
    issues.push({
      target: null,
      message: `Add at least ${limits.questionsMin} questions.`,
    });
  }

  questions.forEach((question, index) => {
    if (!isQuestionComplete(question)) {
      issues.push({
        target: { kind: "question", key: question.key },
        message: `Question ${index + 1} needs attention.`,
      });
    }
  });

  return issues;
}

export function newKey() {
  return crypto.randomUUID();
}

export function createOption(label = "", isCorrect = false): EditorOption {
  return { key: newKey(), label, isCorrect };
}

function blankOptions() {
  return [createOption(), createOption(), createOption(), createOption()];
}

function trueFalseOptions() {
  return [createOption("True"), createOption("False")];
}

export function createQuestion(): EditorQuestion {
  return {
    key: newKey(),
    type: "SINGLE",
    title: "",
    explanation: "",
    options: blankOptions(),
  };
}

export function duplicateQuestion(question: EditorQuestion): EditorQuestion {
  return {
    ...question,
    key: newKey(),
    options: question.options.map((option) => ({ ...option, key: newKey() })),
  };
}

export function changeQuestionType(
  question: EditorQuestion,
  type: QuestionType,
): EditorQuestion {
  if (question.type === type) return question;

  if (type === "TRUE_FALSE") {
    return { ...question, type, options: trueFalseOptions() };
  }

  const options =
    question.type === "TRUE_FALSE" ? blankOptions() : question.options;

  if (type === "MULTIPLE") return { ...question, type, options };

  // Single answer keeps only the first correct option.
  let kept = false;
  return {
    ...question,
    type,
    options: options.map((option) => {
      if (!option.isCorrect) return option;
      if (kept) return { ...option, isCorrect: false };
      kept = true;
      return option;
    }),
  };
}

export function toggleCorrect(
  question: EditorQuestion,
  optionKey: string,
): EditorQuestion {
  if (question.type === "MULTIPLE") {
    return {
      ...question,
      options: question.options.map((option) =>
        option.key === optionKey
          ? { ...option, isCorrect: !option.isCorrect }
          : option,
      ),
    };
  }

  return {
    ...question,
    options: question.options.map((option) => ({
      ...option,
      isCorrect: option.key === optionKey,
    })),
  };
}

export function createEmptySettings(): QuizSettings {
  return {
    title: "",
    description: "",
    category: null,
    difficulty: "BEGINNER",
    visibility: "PUBLIC",
    timeLimitMinutes: null,
    shuffleQuestions: false,
    shuffleOptions: false,
    maxAttempts: null,
    tags: [],
  };
}
