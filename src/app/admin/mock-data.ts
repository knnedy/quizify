import { getApplications } from "./applications/mock-data";

export type AdminCounts = {
  applications: number;
};

// Stand-in for the real count queries. The reports count joins this when the
// reports queue exists.
export async function getAdminCounts(): Promise<AdminCounts> {
  const { counts } = await getApplications({ status: "PENDING" });
  return { applications: counts.PENDING };
}
