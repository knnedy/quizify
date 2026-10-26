import type { ComponentType } from "react";
import {
  ArchiveIcon,
  CircleCheckIcon,
  GlobeIcon,
  LinkIcon,
  LockIcon,
  PencilLineIcon,
  ShieldAlertIcon,
} from "lucide-react";
import type { MyQuizStatus, Visibility } from "../mock-data";

type IconType = ComponentType<{ className?: string }>;

const statusConfig: Record<
  MyQuizStatus,
  { label: string; Icon: IconType; tone: string }
> = {
  PUBLISHED: {
    label: "Published",
    Icon: CircleCheckIcon,
    tone: "bg-correct-soft text-correct-ink",
  },
  DRAFT: {
    label: "Draft",
    Icon: PencilLineIcon,
    tone: "bg-muted text-muted-foreground",
  },
  ARCHIVED: {
    label: "Archived",
    Icon: ArchiveIcon,
    tone: "bg-muted text-muted-foreground",
  },
  SUSPENDED: {
    label: "Suspended",
    Icon: ShieldAlertIcon,
    tone: "bg-incorrect-soft text-incorrect-ink",
  },
};

const visibilityConfig: Record<Visibility, { label: string; Icon: IconType }> =
  {
    PUBLIC: { label: "Public", Icon: GlobeIcon },
    UNLISTED: { label: "Unlisted", Icon: LinkIcon },
    PRIVATE: { label: "Private", Icon: LockIcon },
  };

export function StatusBadge({ status }: { status: MyQuizStatus }) {
  const { label, Icon, tone } = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      <Icon aria-hidden className="size-3.5" />
      {label}
    </span>
  );
}

export function VisibilityTag({ visibility }: { visibility: Visibility }) {
  const { label, Icon } = visibilityConfig[visibility];

  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon aria-hidden className="size-3.5" />
      {label}
    </span>
  );
}
