import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminIdentity } from "../../mock-data";
import { BackToUsers } from "../_components/back-to-users";
import type { ProfileTab } from "../_components/profile-tabs";
import { UserProfile } from "../_components/user-profile";
import { getUserDetail } from "../mock-data";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function load(id: string) {
  const numeric = Number.parseInt(id, 10);
  return Number.isInteger(numeric) ? getUserDetail(numeric) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
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

  const user = await load(id);
  if (!user) notFound();

  const rawTab = first(raw.tab);
  const tab: ProfileTab =
    rawTab === "quizzes" || rawTab === "history" ? rawTab : "overview";

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-6 py-6 sm:py-8 lg:py-9">
      <BackToUsers />
      <UserProfile
        key={user.id}
        user={user}
        meId={adminIdentity.id}
        initialTab={tab}
      />
    </main>
  );
}
