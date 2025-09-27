import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to the canonical Brand Run connect step
  redirect("/brand-run?step=connect");
}
