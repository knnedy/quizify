import type { ReactNode } from "react";

export function Highlight({ text, term }: { text: string; term: string }) {
  const needle = term.trim().toLowerCase();
  if (!needle) return <>{text}</>;

  const lower = text.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let index = lower.indexOf(needle, cursor);

  while (index !== -1) {
    if (index > cursor) parts.push(text.slice(cursor, index));

    parts.push(
      <mark key={index} className="rounded-sm bg-xp-soft px-0.5 text-xp-ink">
        {text.slice(index, index + needle.length)}
      </mark>,
    );

    cursor = index + needle.length;
    index = lower.indexOf(needle, cursor);
  }

  parts.push(text.slice(cursor));
  return <>{parts}</>;
}
