import { EyeOffIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/format-date";
import type { Moderation, PreviewStatus } from "@/types/admin-quizzes";

const descriptions: Record<PreviewStatus, string> = {
  PUBLISHED: "This quiz is live and players can find it.",
  HIDDEN:
    "Hidden from players automatically because enough people reported it. It stays hidden until you decide.",
  SUSPENDED:
    "Hidden from players until it is restored. The creator can see your message.",
  UNPUBLISHED:
    "The creator has taken this quiz down, so players can't find it.",
  DELETED: "Removed for everyone. Players' past results are kept.",
};

const verbs: Partial<Record<PreviewStatus, string>> = {
  SUSPENDED: "Suspended",
  DELETED: "Deleted",
};

export function ModerationCard({
  moderation,
  busy,
  onSuspend,
  onRestore,
  onDelete,
}: {
  moderation: Moderation;
  busy: boolean;
  onSuspend: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const { status } = moderation;
  const canSuspend = status === "PUBLISHED" || status === "HIDDEN";
  const canRestore = status === "SUSPENDED" || status === "HIDDEN";
  const canDelete = status !== "DELETED";
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
            {moderation.at ? ` on ${formatDate(moderation.at)}` : ""}
          </p>
        )}

        {status === "SUSPENDED" && moderation.note && (
          <blockquote className="border-l-2 border-primary pl-3 text-sm leading-relaxed">
            {moderation.note}
          </blockquote>
        )}
      </div>

      {(canRestore || canSuspend || canDelete) && (
        <div className="space-y-2.5">
          {canRestore && (
            <Button
              type="button"
              size="lg"
              className="w-full shadow-primary"
              disabled={busy}
              onClick={onRestore}>
              {busy ? <Spinner /> : <ShieldCheckIcon />}
              {status === "HIDDEN" ? "Make live again" : "Restore quiz"}
            </Button>
          )}
          {canSuspend && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              disabled={busy}
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
              disabled={busy}
              onClick={onDelete}>
              <Trash2Icon />
              Delete quiz
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
