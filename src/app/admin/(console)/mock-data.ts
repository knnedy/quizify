export type { AdminIdentity } from "@/types/admin";
import type { AdminIdentity } from "@/types/admin";

// Still used by admin pages that haven't been converted yet. The console
// shell reads the real session and the real counts now.
export const adminIdentity: AdminIdentity = {
  id: 1,
  name: "Don Demarco",
  role: "ADMIN",
};
