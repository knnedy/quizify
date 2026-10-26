"use client";

import { useEffect, useMemo, useReducer } from "react";
import {
  changeQuestionType,
  collectIssues,
  createOption,
  createQuestion,
  duplicateQuestion,
  limits,
  toggleCorrect,
} from "@/lib/quiz-editor-rules";
import type {
  EditorQuestion,
  EditorSelection,
  QuestionType,
  QuizSettings,
} from "@/types/quiz-editor";

type Initial = {
  settings: QuizSettings;
  questions: EditorQuestion[];
};

type State = {
  settings: QuizSettings;
  questions: EditorQuestion[];
  selection: EditorSelection;
  dirty: boolean;
  showErrors: boolean;
};

type Action =
  | { type: "settings"; patch: Partial<QuizSettings> }
  | { type: "select"; selection: EditorSelection }
  | { type: "add-question" }
  | {
      type: "edit-question";
      key: string;
      patch: Partial<Pick<EditorQuestion, "title" | "explanation">>;
    }
  | { type: "set-type"; key: string; questionType: QuestionType }
  | { type: "add-option"; key: string }
  | { type: "remove-option"; key: string; optionKey: string }
  | { type: "edit-option"; key: string; optionKey: string; label: string }
  | { type: "toggle-correct"; key: string; optionKey: string }
  | { type: "move-question"; key: string; direction: -1 | 1 }
  | { type: "duplicate-question"; key: string }
  | { type: "remove-question"; key: string }
  | { type: "restore-question"; question: EditorQuestion; index: number }
  | { type: "saved" }
  | { type: "show-errors" };

function mapQuestion(
  state: State,
  key: string,
  update: (question: EditorQuestion) => EditorQuestion,
): State {
  return {
    ...state,
    dirty: true,
    questions: state.questions.map((question) =>
      question.key === key ? update(question) : question,
    ),
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "settings":
      return {
        ...state,
        dirty: true,
        settings: { ...state.settings, ...action.patch },
      };

    case "select":
      return { ...state, selection: action.selection };

    case "add-question": {
      if (state.questions.length >= limits.questionsMax) return state;
      const question = createQuestion();
      return {
        ...state,
        dirty: true,
        questions: [...state.questions, question],
        selection: { kind: "question", key: question.key },
      };
    }

    case "edit-question":
      return mapQuestion(state, action.key, (question) => ({
        ...question,
        ...action.patch,
      }));

    case "set-type":
      return mapQuestion(state, action.key, (question) =>
        changeQuestionType(question, action.questionType),
      );

    case "add-option":
      return mapQuestion(state, action.key, (question) =>
        question.type === "TRUE_FALSE" ||
        question.options.length >= limits.optionsMax
          ? question
          : { ...question, options: [...question.options, createOption()] },
      );

    case "remove-option":
      return mapQuestion(state, action.key, (question) =>
        question.type === "TRUE_FALSE" ||
        question.options.length <= limits.optionsMin
          ? question
          : {
              ...question,
              options: question.options.filter(
                (option) => option.key !== action.optionKey,
              ),
            },
      );

    case "edit-option":
      return mapQuestion(state, action.key, (question) => ({
        ...question,
        options: question.options.map((option) =>
          option.key === action.optionKey
            ? { ...option, label: action.label }
            : option,
        ),
      }));

    case "toggle-correct":
      return mapQuestion(state, action.key, (question) =>
        toggleCorrect(question, action.optionKey),
      );

    case "move-question": {
      const index = state.questions.findIndex((q) => q.key === action.key);
      const target = index + action.direction;
      if (index === -1 || target < 0 || target >= state.questions.length) {
        return state;
      }

      const questions = [...state.questions];
      [questions[index], questions[target]] = [
        questions[target],
        questions[index],
      ];
      return { ...state, dirty: true, questions };
    }

    case "duplicate-question": {
      if (state.questions.length >= limits.questionsMax) return state;
      const index = state.questions.findIndex((q) => q.key === action.key);
      if (index === -1) return state;

      const copy = duplicateQuestion(state.questions[index]);
      const questions = [...state.questions];
      questions.splice(index + 1, 0, copy);
      return {
        ...state,
        dirty: true,
        questions,
        selection: { kind: "question", key: copy.key },
      };
    }

    case "remove-question": {
      const index = state.questions.findIndex((q) => q.key === action.key);
      if (index === -1) return state;

      const questions = state.questions.filter((q) => q.key !== action.key);
      const wasSelected =
        state.selection.kind === "question" &&
        state.selection.key === action.key;
      const neighbour = questions[index] ?? questions[index - 1];

      let selection = state.selection;
      if (wasSelected) {
        selection = neighbour
          ? { kind: "question", key: neighbour.key }
          : { kind: "details" };
      }

      return { ...state, dirty: true, questions, selection };
    }

    case "restore-question": {
      const questions = [...state.questions];
      questions.splice(
        Math.min(action.index, questions.length),
        0,
        action.question,
      );
      return {
        ...state,
        dirty: true,
        questions,
        selection: { kind: "question", key: action.question.key },
      };
    }

    case "saved":
      return { ...state, dirty: false };

    case "show-errors":
      return { ...state, showErrors: true };
  }
}

export function useQuizEditor(initial: Initial) {
  const [state, dispatch] = useReducer(
    reducer,
    initial,
    (value): State => ({
      settings: value.settings,
      questions: value.questions,
      selection: { kind: "details" },
      dirty: false,
      showErrors: false,
    }),
  );

  const actions = useMemo(
    () => ({
      updateSettings: (patch: Partial<QuizSettings>) =>
        dispatch({ type: "settings", patch }),
      select: (selection: EditorSelection) =>
        dispatch({ type: "select", selection }),
      addQuestion: () => dispatch({ type: "add-question" }),
      editQuestion: (
        key: string,
        patch: Partial<Pick<EditorQuestion, "title" | "explanation">>,
      ) => dispatch({ type: "edit-question", key, patch }),
      setQuestionType: (key: string, questionType: QuestionType) =>
        dispatch({ type: "set-type", key, questionType }),
      addOption: (key: string) => dispatch({ type: "add-option", key }),
      removeOption: (key: string, optionKey: string) =>
        dispatch({ type: "remove-option", key, optionKey }),
      editOption: (key: string, optionKey: string, label: string) =>
        dispatch({ type: "edit-option", key, optionKey, label }),
      toggleCorrect: (key: string, optionKey: string) =>
        dispatch({ type: "toggle-correct", key, optionKey }),
      moveQuestion: (key: string, direction: -1 | 1) =>
        dispatch({ type: "move-question", key, direction }),
      duplicateQuestion: (key: string) =>
        dispatch({ type: "duplicate-question", key }),
      removeQuestion: (key: string) =>
        dispatch({ type: "remove-question", key }),
      restoreQuestion: (question: EditorQuestion, index: number) =>
        dispatch({ type: "restore-question", question, index }),
      markSaved: () => dispatch({ type: "saved" }),
      revealErrors: () => dispatch({ type: "show-errors" }),
    }),
    [],
  );

  const issues = useMemo(
    () => collectIssues(state.settings, state.questions),
    [state.settings, state.questions],
  );

  const selectedKey =
    state.selection.kind === "question" ? state.selection.key : null;
  const selectedIndex =
    selectedKey === null
      ? -1
      : state.questions.findIndex((q) => q.key === selectedKey);
  const question = selectedIndex >= 0 ? state.questions[selectedIndex] : null;

  // Alt with the up and down arrows steps through the outline, where the
  // quiz details count as the first stop.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

      event.preventDefault();
      const next = selectedIndex + (event.key === "ArrowDown" ? 1 : -1);
      if (next < -1 || next >= state.questions.length) return;

      dispatch({
        type: "select",
        selection:
          next === -1
            ? { kind: "details" }
            : { kind: "question", key: state.questions[next].key },
      });
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex, state.questions]);

  return { state, question, selectedIndex, issues, actions };
}

export type EditorActions = ReturnType<typeof useQuizEditor>["actions"];
