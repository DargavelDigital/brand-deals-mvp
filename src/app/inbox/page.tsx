import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to the canonical outreach inbox route
  redirect("/outreach/inbox");
}
