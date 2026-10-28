import { getApplications } from "./applications/mock-data";

export type AdminCounts = {
  applications: number;
};

export type AdminIdentity = {
  id: number;
  name: string;
  role: "ADMIN" | "MODERATOR";
};

export const adminIdentity: AdminIdentity = {
  id: 1,
  name: "Don Demarco",
  role: "ADMIN",
};

// Stand-in for the session user and the real count queries. The reports
// count joins this when the reports queue exists.
export async function getAdminShell() {
  const { counts } = await getApplications({ status: "PENDING" });

  return {
    counts: { applications: counts.PENDING } satisfies AdminCounts,
    admin: adminIdentity,
  };
}
