import type { Metadata } from "next";
import { isAdmin } from "@/lib/roles";
import { userQuerySchema } from "@/lib/schemas/admin-users";
import { getUserSummary, listUsers } from "@/server/queries/admin-users";
import { requireStaff } from "@/server/session";
import { AdminPage } from "../_components/admin-page";
import { UsersExplorer } from "./_components/users-explorer";
import { UsersSummary } from "./_components/users-summary";

export const metadata: Metadata = { title: "Users" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [raw, staff] = await Promise.all([
    searchParams,
    requireStaff("/users"),
  ]);
  const query = userQuerySchema.parse(raw);

  const [result, summary] = await Promise.all([
    listUsers(query),
    getUserSummary(),
  ]);

  return (
    <AdminPage
      fill={false}
      title="Users"
      description="Find a player, see how they play, and ban or unban accounts.">
      <UsersSummary summary={summary} />
      <UsersExplorer
        rows={result.items}
        total={result.total}
        page={result.page}
        pageCount={result.pageCount}
        counts={result.counts}
        query={query}
        meId={staff.id}
        canManageRoles={isAdmin(staff.role)}
      />
    </AdminPage>
  );
}
