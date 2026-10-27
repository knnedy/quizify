export type SettingsRole = "USER" | "CREATOR" | "MODERATOR" | "ADMIN";

export type SettingsUser = {
  name: string;
  email: string;
  role: SettingsRole;
  joinedAt: string;
  timezone: string;
  totalXp: number;
  links: {
    website: string;
    github: string;
    x: string;
  };
};

export async function getSettingsUser(): Promise<SettingsUser> {
  return {
    name: "Amina Wanjiru",
    email: "amina@example.com",
    role: "CREATOR",
    joinedAt: "2026-03-14T00:00:00.000Z",
    timezone: "Africa/Nairobi",
    totalXp: 4820,
    links: {
      website: "https://amina.dev",
      github: "aminaw",
      x: "",
    },
  };
}
