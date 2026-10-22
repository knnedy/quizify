import {
  ClapperboardIcon,
  CpuIcon,
  FlaskConicalIcon,
  GlobeIcon,
  LandmarkIcon,
  MusicIcon,
  ShapesIcon,
  TrophyIcon,
  UtensilsIcon,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  geography: GlobeIcon,
  science: FlaskConicalIcon,
  history: LandmarkIcon,
  technology: CpuIcon,
  music: MusicIcon,
  sports: TrophyIcon,
  movies: ClapperboardIcon,
  food: UtensilsIcon,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return icons[slug] ?? ShapesIcon;
}
