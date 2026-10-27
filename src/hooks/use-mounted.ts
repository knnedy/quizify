"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// False on the server and during hydration, true afterwards. Used where the
// value only exists in the browser, like the saved theme.
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
