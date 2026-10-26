"use client";

import { useState } from "react";
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
import type { MyQuiz } from "../mock-data";

export function QuizRowMenu({ quiz }: { quiz: MyQuiz }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const canDuplicate = quiz.status !== "SUSPENDED";
  const canArchive = quiz.status === "PUBLISHED";
  const canRepublish = quiz.status === "ARCHIVED";

  // Mock only: the real actions write to the database and refresh the list.
  function duplicate() {
    toast.success("Copied as a new draft");
  }

  function archive() {
    toast.success("Quiz archived. Publish it again any time from the editor.");
  }

  function remove() {
    setConfirmOpen(false);
    toast.success("Quiz deleted");
  }

  function archiveInstead() {
    setConfirmOpen(false);
    archive();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`More actions for ${quiz.title}`}
          className="inline-flex size-8 items-center justify-center rounded-lg border bg-card text-muted-foreground shadow-xs transition-colors hover:border-foreground/25 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-popup-open:border-foreground/25 data-popup-open:text-foreground">
          <EllipsisIcon aria-hidden className="size-4" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {canRepublish && (
            <DropdownMenuItem
              onClick={() => router.push(`/my-quizzes/${quiz.slug}/edit`)}>
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
            <DropdownMenuItem onClick={archive}>
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
              Delete {quiz.title}?
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
              <Button type="button" variant="outline" onClick={archiveInstead}>
                <ArchiveIcon />
                Archive instead
              </Button>
            )}
            <Button type="button" variant="destructive" onClick={remove}>
              <Trash2Icon />
              Delete quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
