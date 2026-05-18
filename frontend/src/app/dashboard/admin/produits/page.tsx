import { redirect } from "next/navigation";

export default function AdminProduitsRedirect() {
  redirect("/dashboard/admin/commandes");
}
