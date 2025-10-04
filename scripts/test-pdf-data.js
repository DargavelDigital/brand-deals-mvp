// Test script to verify PDF data structure
// Run this in browser console on your live site

const testData = {
  "socials": [
    { "followers": 125000, "engagementRate": 0.045, "avgViews": 45000 },
    { "followers": 89000, "engagementRate": 0.062, "avgViews": 120000 },
    { "followers": 45000, "engagementRate": 0.038, "avgViews": 25000 }
  ],
  "brandContext": { "name": "Acme Corp" },
  "ai": { "highlights": ["Reason 1", "Reason 2", "Reason 3"] },
  "cta": { "meetingUrl": "https://calendly.com/test" }
};

// Test the same calculation logic as React-PDF
const socials = (testData.socials || []).filter(Boolean);
const totalFollowers = socials.reduce((sum, s) => sum + (s.followers || 0), 0);
const avgEngagement = socials.length > 0 
  ? socials.reduce((sum, s) => sum + (s.engagementRate || 0), 0) / socials.length 
  : 0;
const totalAvgViews = socials.reduce((sum, s) => sum + (s.avgViews || 0), 0);

console.log('=== PDF DATA CALCULATION TEST ===');
console.log('Socials:', socials);
console.log('Total Followers:', totalFollowers.toLocaleString());
console.log('Avg Engagement:', (avgEngagement * 100).toFixed(1) + '%');
console.log('Total Avg Views:', totalAvgViews.toLocaleString());
console.log('Brand Name:', testData.brandContext.name);
console.log('Highlights:', testData.ai.highlights);
console.log('CTA URL:', testData.cta.meetingUrl);

// Expected results:
// Total Followers: 259,000
// Avg Engagement: 4.8%
// Total Avg Views: 190,000
// Brand Name: Acme Corp
// Highlights: ["Reason 1", "Reason 2", "Reason 3"]
// CTA URL: https://calendly.com/test
