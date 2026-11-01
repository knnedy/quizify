import { SaveIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { QuizStatus } from "@/types/quiz-editor";

export type EditorPending = "save" | "publish" | null;

export function EditorActions({
  status,
  dirty,
  pending,
  onSave,
  onPublish,
  className,
}: {
  status: QuizStatus;
  dirty: boolean;
  pending: EditorPending;
  onSave: () => void;
  onPublish: () => void;
  className?: string;
}) {
  const canPublish = status === "DRAFT" || status === "ARCHIVED";
  const busy = pending !== null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        variant={canPublish ? "outline" : "default"}
        className={cn(!canPublish && "shadow-primary")}
        disabled={!dirty || busy}
        onClick={onSave}>
        {pending === "save" ? <Spinner /> : <SaveIcon />}
        {status === "DRAFT" ? "Save draft" : "Save changes"}
      </Button>

      {canPublish && (
        <Button className="shadow-primary" disabled={busy} onClick={onPublish}>
          {pending === "publish" ? <Spinner /> : <SendIcon />}
          {status === "ARCHIVED" ? "Publish again" : "Publish"}
        </Button>
      )}
    </div>
  );
}
