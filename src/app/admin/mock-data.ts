import { getApplications } from "./applications/mock-data";
import { getReports } from "./reports/mock-data";

export type AdminCounts = {
  applications: number;
  reports: number;
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

// Stand-in for the session user and the real count queries.
export async function getAdminShell() {
  const [{ counts }, { items }] = await Promise.all([
    getApplications({ status: "PENDING" }),
    getReports(),
  ]);

  return {
    counts: {
      applications: counts.PENDING,
      reports: items.filter((item) => item.status === "OPEN").length,
    } satisfies AdminCounts,
    admin: adminIdentity,
  };
}
