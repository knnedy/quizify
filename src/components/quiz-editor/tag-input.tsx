import { useState, type KeyboardEvent } from "react";
import { XIcon } from "lucide-react";
import { limits } from "@/lib/quiz-editor-rules";
import { inputClass } from "../form/form-block";

export function TagInput({
  id,
  tags,
  onChange,
}: {
  id: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const full = tags.length >= limits.tagsMax;

  function commit() {
    const tag = draft.trim().toLowerCase().slice(0, limits.tagMax);
    setDraft("");
    if (!tag || full || tags.includes(tag)) return;
    onChange([...tags, tag]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit();
      return;
    }

    if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="space-y-3">
      <input
        id={id}
        value={draft}
        disabled={full}
        maxLength={limits.tagMax}
        placeholder={full ? "Tag limit reached" : "Type a tag and press Enter"}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        className={inputClass}
      />

      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-muted py-1 pr-1.5 pl-3 text-sm">
              {tag}
              <button
                type="button"
                aria-label={`Remove tag ${tag}`}
                onClick={() => onChange(tags.filter((item) => item !== tag))}
                className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
                <XIcon aria-hidden className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
