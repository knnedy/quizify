import type { Metadata } from "next";
import { AdminPage } from "../_components/admin-page";
import { adminIdentity } from "../mock-data";
import { UsersExplorer } from "./_components/users-explorer";
import { UsersSummary } from "./_components/users-summary";
import { getUserSummary, listUsers } from "./mock-data";
import { parseUserQuery } from "./query-params";

export const metadata: Metadata = { title: "Users" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = parseUserQuery(await searchParams);
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
        meId={adminIdentity.id}
      />
    </AdminPage>
  );
}
