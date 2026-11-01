import type { Role } from "@/lib/roles";

export type SettingsUser = {
  name: string;
  email: string;
  role: Role;
  joinedAt: Date;
  timezone: string;
  totalXp: number;
  links: {
    website: string;
    instagram: string;
    x: string;
  };
};
