export default function Toaster({ children }: { children: React.ReactNode }) {
  return (
    <div 
      aria-live="polite" 
      aria-atomic="true" 
      className="fixed bottom-4 right-4 z-50"
    >
      {children}
    </div>
  )
}
