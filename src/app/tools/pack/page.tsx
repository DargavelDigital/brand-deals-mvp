import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to the canonical Brand Run pack step
  redirect("/brand-run?step=pack");
}
