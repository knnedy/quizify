import {
  EyeOffIcon,
  ShieldCheckIcon,
  Trash2Icon,
  Undo2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import type { Moderation, PreviewStatus } from "../mock-data";

const descriptions: Record<PreviewStatus, string> = {
  PUBLISHED: "This quiz is live and players can find it.",
  HIDDEN:
    "Hidden from players automatically because enough people reported it. It stays hidden until you decide.",
  SUSPENDED:
    "Hidden from players until it is restored. The creator can see your message.",
  DELETED: "Removed for everyone. Players' past results are kept.",
};

const verbs: Partial<Record<PreviewStatus, string>> = {
  SUSPENDED: "Suspended",
  DELETED: "Deleted",
};

export function ModerationCard({
  moderation,
  canUndo,
  onSuspend,
  onRestore,
  onDelete,
  onUndo,
}: {
  moderation: Moderation;
  canUndo: boolean;
  onSuspend: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onUndo: () => void;
}) {
  const { status } = moderation;
  const canSuspend = status === "PUBLISHED" || status === "HIDDEN";
  const canDelete = status !== "DELETED";
  const canRestore = status !== "PUBLISHED";
  const verb = verbs[status];

  return (
    <section
      aria-labelledby="moderation-heading"
      className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
      <h2 id="moderation-heading" className="text-base">
        Moderation
      </h2>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{descriptions[status]}</p>

        {verb && moderation.by && (
          <p className="text-xs text-muted-foreground">
            {verb} by {moderation.by}
            {moderation.at ? ` on ${formatDate(moderation.at)}` : " just now"}
          </p>
        )}

        {moderation.note && (
          <blockquote className="border-l-2 border-primary pl-3 text-sm leading-relaxed">
            {moderation.note}
          </blockquote>
        )}
      </div>

      <div className="space-y-2.5">
        {canRestore && (
          <Button
            type="button"
            size="lg"
            className={cn("w-full", "shadow-primary")}
            onClick={onRestore}>
            <ShieldCheckIcon />
            {status === "HIDDEN" ? "Make live again" : "Restore quiz"}
          </Button>
        )}
        {canSuspend && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onSuspend}>
            <EyeOffIcon />
            Suspend quiz
          </Button>
        )}
        {canDelete && (
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="w-full"
            onClick={onDelete}>
            <Trash2Icon />
            Delete quiz
          </Button>
        )}
        {canUndo && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={onUndo}>
            <Undo2Icon />
            Undo last change
          </Button>
        )}
      </div>
    </section>
  );
}
