import { Maximize2Icon, Minimize2Icon } from "lucide-react";
import { Keycap } from "@/components/keycap";

export function FocusToggle({
  focused,
  onToggle,
}: {
  focused: boolean;
  onToggle: () => void;
}) {
  const Icon = focused ? Minimize2Icon : Maximize2Icon;

  return (
    <button
      type="button"
      aria-pressed={focused}
      onClick={onToggle}
      className="inline-flex h-9 items-center gap-2 rounded-lg border bg-card px-3 text-sm font-medium text-muted-foreground shadow-xs transition-colors hover:border-foreground/25 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <Icon className="size-4" />
      <span className="hidden sm:inline">
        {focused ? "Exit focus" : "Focus"}
      </span>
      <Keycap className="hidden h-5 min-w-5 text-[11px] sm:inline-flex">
        {focused ? "Esc" : "F"}
      </Keycap>
    </button>
  );
}
