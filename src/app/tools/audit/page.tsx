import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to the canonical Brand Run audit step
  redirect("/brand-run?step=audit");
}
