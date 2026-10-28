import type { Metadata } from "next";
import { AdminPage } from "../_components/admin-page";
import { adminIdentity } from "../mock-data";
import { UsersWorkspace } from "./_components/users-workspace";
import { getUsers } from "./mock-data";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const { users } = await getUsers();

  return (
    <AdminPage
      title="Users"
      description="Look up a player, see how they play, and ban or unban accounts.">
      <UsersWorkspace users={users} meId={adminIdentity.id} />
    </AdminPage>
  );
}
