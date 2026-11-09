import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAdmin, isStaff } from "@/lib/roles";
import { profileParamsSchema, userIdSchema } from "@/lib/schemas/admin-profile";
import { getAdminUser } from "@/server/queries/admin-users";
import { getOptionalUser, requireStaff } from "@/server/session";
import { BackToUsers } from "../_components/back-to-users";
import { UserProfile } from "../_components/user-profile";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function load(id: string) {
  const parsed = userIdSchema.safeParse(id);
  return parsed.success ? getAdminUser(parsed.data) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  // Only staff get to look a user up, even for a page title
  const viewer = await getOptionalUser();
  if (!viewer || !isStaff(viewer.role)) return { title: "Not found" };

  const user = await load((await params).id);
  return { title: user ? user.name : "User not found" };
}

export default async function UserPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ id }, raw] = await Promise.all([params, searchParams]);
  const staff = await requireStaff(`/users/${id}`);

  const user = await load(id);
  if (!user) notFound();

  const { tab } = profileParamsSchema.parse(raw);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-6 py-6 sm:py-8 lg:py-9">
      <BackToUsers />
      <UserProfile
        key={user.id}
        user={user}
        meId={staff.id}
        canManageRoles={isAdmin(staff.role)}
        initialTab={tab ?? "overview"}
      />
    </main>
  );
}
