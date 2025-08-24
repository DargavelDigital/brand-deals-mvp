export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Profile Settings</h1>
        <p className="text-[var(--muted)]">
          Manage your personal information and account preferences.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Personal Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Full Name</label>
            <input
              type="text"
              defaultValue="John Doe"
              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Email</label>
            <input
              type="email"
              defaultValue="john.doe@example.com"
              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Company</label>
            <input
              type="text"
              defaultValue="Hype & Swagger"
              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button className="bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white px-4 py-2 rounded-lg transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
