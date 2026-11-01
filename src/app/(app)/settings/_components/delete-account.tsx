"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { inputClass } from "@/components/form/form-block";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { DELETE_CONFIRM_WORD } from "@/lib/schemas/settings";
import { deleteAccount } from "@/server/actions/account";
import { SectionBody, SettingsSection } from "./settings-section";

export function DeleteAccountSection() {
  const inputId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  const confirmed = text.trim().toLowerCase() === DELETE_CONFIRM_WORD;

  function onOpenChange(next: boolean) {
    if (isPending) return;
    setOpen(next);
    if (next) setText("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmed || isPending) return;

    startTransition(async () => {
      const result = await deleteAccount({ confirmation: text });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      // The account and its sessions are gone. This only clears the cookie
      // that is left in the browser.
      await authClient.signOut().catch(() => undefined);

      setOpen(false);
      toast.success("Account deleted");
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <SettingsSection
      id="delete-account"
      title="Delete account"
      description="Permanently remove your account and everything tied to it."
      tone="danger">
      <SectionBody>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm text-muted-foreground">
            This can&rsquo;t be undone. Download or note anything you want to
            keep first.
          </p>

          <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger render={<Button variant="destructive" />}>
              <Trash2Icon />
              Delete account
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <form onSubmit={submit} className="grid gap-4">
                <DialogHeader className="gap-2 pr-8">
                  <DialogTitle className="text-lg leading-snug">
                    Delete your account?
                  </DialogTitle>
                  <DialogDescription>
                    This is what happens when you confirm:
                  </DialogDescription>
                </DialogHeader>

                <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                  <li>
                    Your progress, XP, streak and achievements are deleted for
                    good.
                  </li>
                  <li>
                    Quizzes you published stay up, credited to &ldquo;Former
                    member&rdquo;. Your drafts, archived and private quizzes are
                    deleted.
                  </li>
                  <li>You are signed out everywhere straight away.</li>
                </ul>

                <div className="space-y-2">
                  <label
                    htmlFor={inputId}
                    className="block text-sm font-medium">
                    Type{" "}
                    <span className="font-semibold text-incorrect-ink">
                      {DELETE_CONFIRM_WORD}
                    </span>{" "}
                    to confirm
                  </label>
                  <input
                    id={inputId}
                    value={text}
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(event) => setText(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <DialogFooter>
                  <DialogClose
                    render={<Button type="button" variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={!confirmed || isPending}>
                    {isPending ? <Spinner /> : <Trash2Icon />}
                    Delete my account
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </SectionBody>
    </SettingsSection>
  );
}
