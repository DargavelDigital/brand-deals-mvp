import { redirect } from 'next/navigation';

export default function OutreachRedirect({ 
  params 
}: { 
  params: { locale: string } 
}) {
  redirect(`/${params.locale}/tools/outreach`);
}
