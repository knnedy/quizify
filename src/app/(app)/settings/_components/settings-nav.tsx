import {
  LockKeyholeIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";

const items: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: "profile", label: "Profile", Icon: UserIcon },
  { id: "preferences", label: "Preferences", Icon: SlidersHorizontalIcon },
  { id: "security", label: "Security", Icon: LockKeyholeIcon },
  { id: "delete-account", label: "Delete account", Icon: Trash2Icon },
];

export function SettingsNav() {
  return (
    <nav
      aria-label="Settings sections"
      className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
      <ul className="space-y-1">
        {items.map(({ id, label, Icon }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
              <Icon aria-hidden className="size-4" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
