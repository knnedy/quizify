"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArchiveIcon,
  CopyIcon,
  EllipsisIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  archiveQuiz,
  deleteQuiz,
  duplicateQuiz,
} from "@/server/actions/quizzes";
import type { MyQuizStatus } from "@/types/my-quizzes";

export function QuizRowMenu({
  slug,
  title,
  status,
}: {
  slug: string;
  title: string;
  status: MyQuizStatus;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canDuplicate = status !== "SUSPENDED";
  const canArchive = status === "PUBLISHED";
  const canRepublish = status === "ARCHIVED";

  function duplicate() {
    startTransition(async () => {
      const result = await duplicateQuiz({ slug });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Copied as a new draft", {
        action: {
          label: "Edit",
          onClick: () => router.push(`/my-quizzes/${result.slug}/edit`),
        },
      });
    });
  }

  function archive(closeDialog = false) {
    startTransition(async () => {
      const result = await archiveQuiz({ slug });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      if (closeDialog) setConfirmOpen(false);
      toast.success(
        "Quiz archived. Publish it again any time from the editor.",
      );
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteQuiz({ slug });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setConfirmOpen(false);
      toast.success("Quiz deleted");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isPending}
          aria-label={`More actions for ${title}`}
          className="inline-flex size-8 items-center justify-center rounded-lg border bg-card text-muted-foreground shadow-xs transition-colors hover:border-foreground/25 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60 data-popup-open:border-foreground/25 data-popup-open:text-foreground">
          <EllipsisIcon aria-hidden className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {canRepublish && (
            <DropdownMenuItem
              onClick={() => router.push(`/my-quizzes/${slug}/edit`)}>
              <SendIcon />
              Publish again
            </DropdownMenuItem>
          )}
          {canDuplicate && (
            <DropdownMenuItem onClick={duplicate}>
              <CopyIcon />
              Duplicate
            </DropdownMenuItem>
          )}
          {canArchive && (
            <DropdownMenuItem onClick={() => archive()}>
              <ArchiveIcon />
              Archive
            </DropdownMenuItem>
          )}

          {(canRepublish || canDuplicate || canArchive) && (
            <DropdownMenuSeparator />
          )}

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmOpen(true)}>
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="gap-2 pr-8">
            <DialogTitle className="text-lg leading-snug">
              Delete {title}?
            </DialogTitle>
            <DialogDescription>
              It disappears for everyone and you can&rsquo;t undo this.
              {canArchive &&
                " If you only want to hide it for now, archive it instead."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            {canArchive && (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => archive(true)}>
                <ArchiveIcon />
                Archive instead
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={remove}>
              <Trash2Icon />
              Delete quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
