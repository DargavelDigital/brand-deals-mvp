import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const DEFAULT_LOCALE =
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE?.trim() || "en";

export default function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const c = cookies();
  const saved = c.get("NEXT_LOCALE")?.value;
  const locale = saved || DEFAULT_LOCALE;

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams || {})) {
    if (Array.isArray(v)) v.forEach((x) => qs.append(k, String(x)));
    else if (v != null) qs.set(k, String(v));
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/${locale}/brand-run${suffix}`);
}
