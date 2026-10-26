import { SaveIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuizStatus } from "@/types/quiz-editor";

export function EditorActions({
  status,
  dirty,
  onSave,
  onPublish,
  className,
}: {
  status: QuizStatus;
  dirty: boolean;
  onSave: () => void;
  onPublish: () => void;
  className?: string;
}) {
  const canPublish = status === "DRAFT" || status === "ARCHIVED";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        variant={canPublish ? "outline" : "default"}
        className={cn(!canPublish && "shadow-primary")}
        disabled={!dirty}
        onClick={onSave}>
        <SaveIcon />
        {status === "DRAFT" ? "Save draft" : "Save changes"}
      </Button>

      {canPublish && (
        <Button className="shadow-primary" onClick={onPublish}>
          <SendIcon />
          {status === "ARCHIVED" ? "Publish again" : "Publish"}
        </Button>
      )}
    </div>
  );
}
