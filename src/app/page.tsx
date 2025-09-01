import { redirect } from "next/navigation";

export default function RootRedirect() {
  redirect("/en/dashboard"); // change "en" if your default differs
}
