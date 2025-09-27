import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to the canonical Brand Run matches step
  redirect("/brand-run?step=matches");
}
