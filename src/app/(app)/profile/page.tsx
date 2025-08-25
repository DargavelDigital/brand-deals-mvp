'use client'

import { useState } from 'react'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Demo User',
    email: 'demo@branddeals.test',
    company: 'Demo Company'
  })

  const handleSave = () => {
    console.log('Profile saved:', profile)
    // Logic to save profile
  }

  return (
    <div>
      <div>
        <h1>Profile Settings</h1>
        <p>
          Update your personal information and account preferences.
        </p>
      </div>

      <div>
        <h2>Personal Information</h2>
        
        <div>
          <div>
            <label>Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div>
            <label>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div>
            <label>Company</label>
            <input
              type="text"
              value={profile.company}
              onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
            />
          </div>
          
          <div>
            <button onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
