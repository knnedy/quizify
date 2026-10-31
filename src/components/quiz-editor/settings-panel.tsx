import { useId, useState, type ComponentType, type ReactNode } from "react";
import { GlobeIcon, LinkIcon, LockIcon } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { difficultyInfo, difficulties } from "@/lib/difficulty";
import { limits, type SettingsErrors } from "@/lib/quiz-editor-rules";
import { cn } from "@/lib/utils";
import type {
  CategoryOption,
  QuizSettings,
  QuizVisibility,
} from "@/types/quiz-editor";
import { FormBlock, inputClass } from "../form/form-block";
import { Segmented } from "../form/segmented";
import { SwitchRow } from "../form/switch-row";
import { TagInput } from "./tag-input";

const difficultyOptions = difficulties.map((value) => ({
  value,
  label: difficultyInfo[value].label,
}));

const attemptOptions: { value: number | null; label: string }[] = [
  { value: null, label: "Unlimited" },
  { value: 1, label: "1" },
  { value: 3, label: "3" },
  { value: 5, label: "5" },
];

const visibilityOptions: {
  value: QuizVisibility;
  label: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  {
    value: "PUBLIC",
    label: "Public",
    description: "Listed in browse and search.",
    Icon: GlobeIcon,
  },
  {
    value: "UNLISTED",
    label: "Unlisted",
    description: "Anyone with the link can play. It is not listed.",
    Icon: LinkIcon,
  },
  {
    value: "PRIVATE",
    label: "Private",
    description: "Only you can see and play it.",
    Icon: LockIcon,
  },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-6 rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
      <h3 className="text-lg">{title}</h3>
      {children}
    </section>
  );
}

export function SettingsPanel({
  settings,
  errors,
  categories,
  onChange,
}: {
  settings: QuizSettings;
  errors: SettingsErrors;
  categories: CategoryOption[];
  onChange: (patch: Partial<QuizSettings>) => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const minutesId = useId();
  const tagsId = useId();
  const [minutes, setMinutes] = useState(
    String(settings.timeLimitMinutes ?? 10),
  );

  const timed = settings.timeLimitMinutes !== null;

  function parseMinutes(value: string) {
    const parsed = Number.parseInt(value, 10);
    const valid = parsed >= limits.minutesMin && parsed <= limits.minutesMax;
    return valid ? parsed : null;
  }

  function toggleTimer(on: boolean) {
    onChange({ timeLimitMinutes: on ? (parseMinutes(minutes) ?? 10) : null });
  }

  function changeMinutes(value: string) {
    setMinutes(value);
    const parsed = parseMinutes(value);
    if (parsed !== null) onChange({ timeLimitMinutes: parsed });
  }

  return (
    <div className="animate-in space-y-6 duration-200 fade-in slide-in-from-bottom-1">
      <Section title="Basics">
        <FormBlock
          label="Title"
          htmlFor={titleId}
          error={errors.title}
          hint={`Up to ${limits.titleMax} characters.`}>
          <input
            id={titleId}
            value={settings.title}
            maxLength={limits.titleMax}
            placeholder="Capital cities of Africa"
            aria-invalid={Boolean(errors.title)}
            onChange={(event) => onChange({ title: event.target.value })}
            className={inputClass}
          />
        </FormBlock>

        <FormBlock
          label="Description"
          htmlFor={descriptionId}
          error={errors.description}
          hint={`Up to ${limits.descriptionMax} characters. Shown on the quiz card and its page.`}>
          <textarea
            id={descriptionId}
            rows={3}
            value={settings.description}
            maxLength={limits.descriptionMax}
            placeholder="Match every capital to its country, from Nairobi to Windhoek."
            aria-invalid={Boolean(errors.description)}
            onChange={(event) => onChange({ description: event.target.value })}
            className={cn(inputClass, "resize-y")}
          />
        </FormBlock>

        <FormBlock label="Category" error={errors.category}>
          <div
            role="radiogroup"
            aria-label="Category"
            className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.slug);
              const active = settings.category === category.slug;

              return (
                <button
                  key={category.slug}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange({ category: category.slug })}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "border-primary bg-primary-soft"
                      : "bg-card hover:border-foreground/25 hover:bg-muted/60",
                  )}>
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}>
                    <Icon className="size-4" />
                  </span>
                  <span className="truncate">{category.name}</span>
                </button>
              );
            })}
          </div>
        </FormBlock>
      </Section>

      <Section title="How it plays">
        <FormBlock label="Difficulty">
          <Segmented
            label="Difficulty"
            value={settings.difficulty}
            options={difficultyOptions}
            onChange={(difficulty) => onChange({ difficulty })}
          />
        </FormBlock>

        <FormBlock
          label="Attempts per player"
          hint="How many times one player can play it.">
          <Segmented
            label="Attempts per player"
            value={settings.maxAttempts}
            options={attemptOptions}
            onChange={(maxAttempts) => onChange({ maxAttempts })}
          />
        </FormBlock>

        <div className="space-y-3">
          <SwitchRow
            label="Time limit"
            description="Players finish before the clock runs out."
            checked={timed}
            onCheckedChange={toggleTimer}>
            {timed && (
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3">
                <label
                  htmlFor={minutesId}
                  className="text-sm text-muted-foreground">
                  Minutes
                </label>
                <input
                  id={minutesId}
                  type="number"
                  inputMode="numeric"
                  min={limits.minutesMin}
                  max={limits.minutesMax}
                  value={minutes}
                  onChange={(event) => changeMinutes(event.target.value)}
                  onBlur={() => setMinutes(String(settings.timeLimitMinutes))}
                  className={cn(inputClass, "w-24 py-2 tabular-nums")}
                />
                <span className="text-sm text-muted-foreground">
                  From {limits.minutesMin} to {limits.minutesMax}
                </span>
              </div>
            )}
          </SwitchRow>

          <SwitchRow
            label="Shuffle questions"
            description="Every attempt gets the questions in a new order."
            checked={settings.shuffleQuestions}
            onCheckedChange={(shuffleQuestions) =>
              onChange({ shuffleQuestions })
            }
          />

          <SwitchRow
            label="Shuffle answers"
            description="The answers inside each question change order too."
            checked={settings.shuffleOptions}
            onCheckedChange={(shuffleOptions) => onChange({ shuffleOptions })}
          />
        </div>
      </Section>

      <Section title="Visibility">
        <div
          role="radiogroup"
          aria-label="Visibility"
          className="grid gap-2.5 sm:grid-cols-3">
          {visibilityOptions.map(({ value, label, description, Icon }) => {
            const active = settings.visibility === value;

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ visibility: value })}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active
                    ? "border-primary bg-primary-soft"
                    : "bg-card hover:border-foreground/25 hover:bg-muted/60",
                )}>
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}>
                  <Icon className="size-4" />
                </span>
                <span className="font-medium">{label}</span>
                <span className="text-sm text-muted-foreground">
                  {description}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Discovery">
        <FormBlock
          label="Tags"
          optional
          htmlFor={tagsId}
          hint={`Up to ${limits.tagsMax}. Press Enter to add one.`}>
          <TagInput
            id={tagsId}
            tags={settings.tags}
            onChange={(tags) => onChange({ tags })}
          />
        </FormBlock>
      </Section>
    </div>
  );
}
