export default function AppShell({ header, sidebar, children }: {
  header: React.ReactNode; sidebar: React.ReactNode; children: React.ReactNode
}) {
  return (
    <>
      <a 
        href="#main" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white px-3 py-2 rounded shadow z-50"
      >
        Skip to content
      </a>
      <header role="banner">{header}</header>
      <div className="flex">
        <nav aria-label="Primary" role="navigation">{sidebar}</nav>
        <main id="main" role="main" className="flex-1">{children}</main>
      </div>
      <footer role="contentinfo" className="sr-only" />
    </>
  )
}
