import { redirect } from "next/navigation";

export default function StatistiquesRedirect() {
  redirect("/dashboard/admin/chiffre-affaires");
}
