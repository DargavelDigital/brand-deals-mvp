import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function MyFeaturePage() {
  return (
    <Section title="My Feature" description="A custom feature built using our design system">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">Getting Started</h3>
          <p className="text-[var(--muted)] mb-4">This section demonstrates cards, buttons, and base spacing.</p>
          <div className="flex items-center gap-3">
            <Button>Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">Next Steps</h3>
          <ul className="list-disc pl-5 text-sm text-[var(--muted)] space-y-1">
            <li>Connect data</li>
            <li>Add inputs/selects</li>
            <li>Use badges for statuses</li>
          </ul>
        </Card>
      </div>
    </Section>
  );
}
