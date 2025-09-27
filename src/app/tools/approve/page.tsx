import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to the canonical Brand Run approve step
  redirect("/brand-run?step=approve");
}
