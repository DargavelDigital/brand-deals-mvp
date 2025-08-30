import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface UnauthorizedPromptProps {
  onSignIn: () => void
  message?: string
}

export function UnauthorizedPrompt({ onSignIn, message = "Please sign in to continue" }: UnauthorizedPromptProps) {
  return (
    <Card className="p-6 text-center">
      <div className="space-y-4">
        <div className="text-[var(--muted-fg)]">
          {message}
        </div>
        <Button onClick={onSignIn} className="bg-[var(--brand-600)] hover:bg-[var(--brand-600)]/90">
          Sign In
        </Button>
      </div>
    </Card>
  )
}
