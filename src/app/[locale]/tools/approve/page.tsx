import { redirect } from "next/navigation";

export default function Page({ params }: { params: { locale: string } }) {
  // Redirect to canonical page WITH locale preserved
  redirect(`/${params.locale}/brand-run?step=approve`);
}