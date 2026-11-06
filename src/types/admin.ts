export type AdminCounts = {
  applications: number;
  reports: number;
};

export type AdminIdentity = {
  id: number;
  name: string;
  role: "ADMIN" | "MODERATOR";
};
