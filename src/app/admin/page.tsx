import { redirect } from "next/navigation";

// Stand-in until the admin overview exists, which replaces this redirect.
export default function AdminPage() {
  redirect("/admin/applications");
}
