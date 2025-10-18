import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function UnsubscribePage({ 
  params 
}: { 
  params: { locale: string; token: string } 
}) {
  let success = false;
  let email = '';
  let error = '';

  try {
    // Find the unsubscribe token
    const token = await prisma().unsubscribeToken.findUnique({
      where: { token: params.token }
    });

    if (!token) {
      error = 'This unsubscribe link is invalid or has expired.';
    } else if (new Date() > token.expiresAt) {
      error = 'This unsubscribe link has expired.';
    } else {
      email = token.email;

      // Mark all contacts with this email as unsubscribed
      await prisma().contact.updateMany({
        where: { 
          email: token.email,
          workspaceId: token.workspaceId 
        },
        data: { 
          unsubscribed: true,
          updatedAt: new Date()
        }
      });

      success = true;
    }
  } catch (e) {
    console.error('Unsubscribe error:', e);
    error = 'An error occurred while processing your request.';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface)] px-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center">
          {success ? (
            <>
              <div className="text-5xl mb-4">✓</div>
              <h1 className="text-2xl font-bold mb-2">Successfully Unsubscribed</h1>
              <p className="text-[var(--muted-fg)] mb-6">
                {email} has been removed from our mailing list.
              </p>
              <p className="text-sm text-[var(--muted-fg)] mb-6">
                You will no longer receive outreach emails from us. If you change your mind, 
                you can contact us to resubscribe.
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-4">✗</div>
              <h1 className="text-2xl font-bold mb-2">Unable to Unsubscribe</h1>
              <p className="text-[var(--muted-fg)] mb-6">
                {error}
              </p>
              <p className="text-sm text-[var(--muted-fg)] mb-6">
                If you're experiencing issues, please contact our support team.
              </p>
            </>
          )}

          <Link href={`/${params.locale}`}>
            <Button variant="secondary" className="mt-4">
              Return to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

