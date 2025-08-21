export async function runAudit() {
  return {
    insights: [
      "Your audience is 60% Gen Z",
      "High engagement on TikTok"
    ]
  };
}

export async function runBrandIdentification() {
  return {
    brands: [
      { name: "Nike", reason: "Matches fitness content" },
      { name: "Coca-Cola", reason: "Aligns with lifestyle posts" }
    ]
  };
}

export async function runContactFinder() {
  return {
    contacts: [
      { name: "Jane Doe", email: "jane@nike.com" }
    ]
  };
}

export async function runMediaPack() {
  return {
    url: "/mock/media-pack.pdf",
    summary: "Media pack created"
  };
}

export async function runOutreach() {
  return {
    status: "Outreach email sent (stub)",
    id: "123"
  };
}

export async function runScheduleMeeting() {
  return {
    link: "https://calendly.com/demo-meeting"
  };
}
