"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlayIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { startAttempt } from "@/server/actions/attempts";

export function StartButton({ slug, label }: { slug: string; label: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function start() {
    startTransition(async () => {
      const result = await startAttempt({ slug });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      router.push(`/quizzes/${slug}/play`);
    });
  }

  return (
    <Button size="lg" className="w-full" disabled={isPending} onClick={start}>
      {isPending ? <Spinner /> : <PlayIcon className="fill-current" />}
      {label}
    </Button>
  );
}
