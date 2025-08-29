"use client";
import * as React from "react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";

const tokenSwatches: Array<[string,string]> = [
  ["bg", "Background"],["surface","Surface"],["text","Text"],["muted","Muted"],
  ["border","Border"],["accent","Accent"],["success","Success"],["warn","Warn"],
  ["error","Error"],["info","Info"]
];

function Swatch({ name, label }: {name:string; label:string}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: `var(--${name})`, borderColor: "var(--border)" }} />
      <div className="text-sm"><strong>--{name}</strong><div className="text-[var(--muted)]">{label}</div></div>
    </div>
  );
}

export default function UISystemPage() {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark"); else root.classList.remove("dark");
  }, [dark]);

  return (
    <Section title="UI System" description="Tokens, primitives, and patterns">
      <div className="mb-6 flex items-center gap-3">
        <Badge>Theme</Badge>
        <Button variant="secondary" onClick={() => setDark(false)}>Light</Button>
        <Button variant="secondary" onClick={() => setDark(true)}>Dark</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Color Tokens</h3>
          <div className="grid gap-3">
            {tokenSwatches.map(([n,l]) => <Swatch key={n} name={n} label={l} />)}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Typography</h3>
          <div className="space-y-2">
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <p>Body text — readable, neutral, tokenized color.</p>
            <small>Small / helper text</small>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Buttons</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Inputs</h3>
          <div className="grid gap-3">
            <Input placeholder="Text input" />
            <Select defaultValue="">
              <option value="" disabled>Select an option</option>
              <option>Option A</option>
              <option>Option B</option>
            </Select>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Badges</h3>
          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge className="text-success border-success/30 bg-success/10">Success</Badge>
            <Badge className="text-warn border-warn/30 bg-warn/10">Warning</Badge>
            <Badge className="text-error border-error/30 bg-error/10">Error</Badge>
            <Badge className="text-info border-info/30 bg-info/10">Info</Badge>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Guidelines</h3>
          <ul className="list-disc pl-5 text-sm text-[var(--muted)] space-y-1">
            <li>Use primitives for all new UI (Button, Card, Input, Select, Badge, Section).</li>
            <li>No raw hex/rgb — use tokens via Tailwind.</li>
            <li>One primary CTA per section; use Section for page scaffolds.</li>
            <li>Respect focus-visible and reduced motion.</li>
          </ul>
        </Card>
      </div>
    </Section>
  );
}
