import {
  AwardIcon,
  FlameIcon,
  PenLineIcon,
  SparklesIcon,
  StarIcon,
  TargetIcon,
  TrophyIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  "first-steps": StarIcon,
  "getting-warm": TargetIcon,
  marathon: TrophyIcon,
  "week-on-fire": FlameIcon,
  sharpshooter: SparklesIcon,
  "xp-hunter": ZapIcon,
  author: PenLineIcon,
};

export function getAchievementIcon(key: string): LucideIcon {
  return icons[key] ?? AwardIcon;
}
