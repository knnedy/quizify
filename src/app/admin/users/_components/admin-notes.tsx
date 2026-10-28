"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import type { AdminNote } from "../mock-data";

const MAX_LENGTH = 400;

export function AdminNotes({
  notes,
  onAdd,
}: {
  notes: AdminNote[];
  onAdd: (text: string) => void;
}) {
  const id = useId();
  const [text, setText] = useState("");

  const valid = text.trim().length >= 3;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;

    onAdd(text.trim());
    setText("");
  }

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="space-y-4 rounded-2xl border bg-card p-5 shadow-xs">
      <div className="space-y-1">
        <h3 id={`${id}-heading`} className="text-base">
          Admin notes
        </h3>
        <p className="text-sm text-muted-foreground">
          Only staff can see these. Leave context for whoever looks next.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-2.5">
        <label htmlFor={`${id}-note`} className="sr-only">
          Add a note
        </label>
        <textarea
          id={`${id}-note`}
          rows={3}
          value={text}
          maxLength={MAX_LENGTH}
          placeholder="Add a note about this user"
          onChange={(event) => setText(event.target.value)}
          className="w-full resize-y rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring/40"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={!valid}>
            Add note
          </Button>
        </div>
      </form>

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="space-y-4 border-t pt-4">
          {notes.map((note) => (
            <li key={note.id} className="space-y-1">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{note.by}</span>
                {" · "}
                {note.at ? formatDate(note.at) : "just now"}
              </p>
              <p className="text-sm leading-relaxed">{note.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
