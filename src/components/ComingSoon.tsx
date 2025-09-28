import { Card } from "@/components/ui/Card"

interface ComingSoonProps {
  title: string
  subtitle: string
  className?: string
}

export function ComingSoon({ title, subtitle, className }: ComingSoonProps) {
  return (
    <Card className={`p-8 text-center ${className || ""}`}>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </Card>
  )
}
