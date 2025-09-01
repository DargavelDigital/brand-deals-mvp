import { redirect } from 'next/navigation';

export default function DemoPage() {
  // Redirect to dashboard instead of showing 404
  redirect('/dashboard');
}
