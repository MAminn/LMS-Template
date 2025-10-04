import { redirect } from "next/navigation";

export default function AdminPage() {
  // Redirect to template manager as the main admin landing page
  redirect("/admin/templates");
}
