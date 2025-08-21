export const discovery = {
  run: async (brand: { domain: string; name: string }) => {
    // Simulate discovery delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      { 
        name: "Alex Patel", 
        title: "Head of Influencer Marketing", 
        email: `alex@${brand.domain}`, 
        seniority: "Head", 
        verifiedStatus: "VALID", 
        score: 98, 
        source: "mock",
        linkedin: `https://linkedin.com/in/alex-patel-${brand.domain}`,
        phone: "+1-555-0123"
      },
      { 
        name: "Morgan Lee", 
        title: "Brand Partnerships Manager", 
        email: `morgan@${brand.domain}`, 
        seniority: "Manager", 
        verifiedStatus: "VALID", 
        score: 92, 
        source: "mock",
        linkedin: `https://linkedin.com/in/morgan-lee-${brand.domain}`,
        phone: "+1-555-0124"
      },
      { 
        name: "Jamie Chen", 
        title: "Social Media Lead", 
        email: `jamie@${brand.domain}`, 
        seniority: "Lead", 
        verifiedStatus: "RISKY", 
        score: 80, 
        source: "mock",
        linkedin: `https://linkedin.com/in/jamie-chen-${brand.domain}`,
        phone: "+1-555-0125"
      }
    ];
  }
};
