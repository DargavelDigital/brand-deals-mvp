import AppShell from "@/components/shell/AppShell";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <div className="container-1200 mx-auto py-6">
        {children}
      </div>
    </AppShell>
  );
}
