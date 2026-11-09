"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toSearchString, type UserQuery } from "@/lib/admin-users";
import { userQuerySchema } from "@/lib/schemas/admin-users";

export function useUserNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  // Any change except the page itself sends you back to page 1.
  const navigate = useCallback(
    (patch: Partial<UserQuery>, mode: "push" | "replace" = "push") => {
      const current = userQuerySchema.parse(
        Object.fromEntries(searchParams.entries()),
      );
      const search = toSearchString({ ...current, page: 1, ...patch });
      const href = search ? `${pathname}?${search}` : pathname;

      startTransition(() => {
        if (mode === "replace") {
          router.replace(href, { scroll: false });
        } else {
          router.push(href, { scroll: false });
        }
      });
    },
    [pathname, router, searchParams],
  );

  return { navigate, pending };
}
