import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE?.trim() || "en";

export default async function Page() {
  const c = await cookies();
  const locale = c.get("NEXT_LOCALE")?.value || DEFAULT_LOCALE;
  redirect(`/${locale}/tools/deal-desk`);
}
