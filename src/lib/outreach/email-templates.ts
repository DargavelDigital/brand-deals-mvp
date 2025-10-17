export interface EmailTemplate {
  id: string;
  category: `introduction` | `follow-up` | `pitch` | `value-prop` | `custom`;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  tone: `professional` | `casual` | `friendly`;
  whenToUse: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: `intro-media-kit`,
    category: `introduction`,
    name: `Media Kit Introduction`,
    subject: `Partnership Opportunity - {{brandName}}`,
    body: `Hi {{contactFirstName}},

I'm {{creatorName}}, a content creator in the {{niche}} space with {{followerCount}} engaged followers.

I've been following {{brandName}} and love what you're doing with {{brandFocus}}. I think there's a great opportunity for us to collaborate.

I've put together a media kit that shows my audience demographics, engagement rates, and previous brand partnerships: {{mediaPackUrl}}

Would you be open to a quick chat about potential collaboration opportunities?

Best regards,
{{creatorName}}`,
    variables: [`contactFirstName`, `creatorName`, `niche`, `followerCount`, `brandName`, `brandFocus`, `mediaPackUrl`],
    tone: `professional`,
    whenToUse: `First contact with a brand`
  },
  
  {
    id: `followup-no-response`,
    category: `follow-up`,
    name: `Follow-up (No Response)`,
    subject: `Re: Partnership with {{brandName}}`,
    body: `Hi {{contactFirstName}},

I wanted to follow up on my previous email about partnering with {{brandName}}.

I know you're busy, so I'll keep this brief. My audience of {{followerCount}} in the {{niche}} space aligns perfectly with your target demographic.

Here's my media kit again: {{mediaPackUrl}}

Would love to connect for 15 minutes this week if you're interested.

Thanks,
{{creatorName}}`,
    variables: [`contactFirstName`, `brandName`, `followerCount`, `niche`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `3-5 days after initial email with no response'
  },

  {
    id: `value-prop-pitch`,
    category: `pitch`,
    name: `Value Proposition Pitch`,
    subject: `How I can help {{brandName}} reach {{targetAudience}}`,
    body: `Hi {{contactFirstName}},

I noticed {{brandName}} is focused on reaching {{targetAudience}}. That's exactly my audience!

Quick stats:
- {{followerCount}} followers with {{engagementRate}}% engagement
- {{ageRange}} years old, {{gender}} split
- Located in {{topMarkets}}

I've helped similar brands achieve:
✓ {{metric1}}
✓ {{metric2}}
✓ {{metric3}}

My full media kit with case studies: {{mediaPackUrl}}

Available for a call this week?

Best,
{{creatorName}}`,
    variables: [`contactFirstName`, `brandName`, `targetAudience`, `followerCount`, `engagementRate`, `ageRange`, `gender`, `topMarkets`, `metric1`, `metric2`, `metric3`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `When you have strong audience alignment data'
  },

  {
    id: `casual-intro`,
    category: `introduction`,
    name: `Casual Introduction`,
    subject: `Love what {{brandName}} is doing!`,
    body: `Hey {{contactFirstName}}!

I'm {{creatorName}} and I've been a huge fan of {{brandName}} for a while now. Seriously love {{brandFocus}}.

I create content in the {{niche}} space and have built an awesome community of {{followerCount}} people who would absolutely love your products.

Threw together a quick media pack if you want to check out my vibe: {{mediaPackUrl}}

Down to chat about working together?

Cheers,
{{creatorName}}`,
    variables: [`contactFirstName`, `creatorName`, `brandName`, `brandFocus`, `niche`, `followerCount`, `mediaPackUrl`],
    tone: `casual`,
    whenToUse: `For lifestyle/casual brands or when you have an informal relationship'
  },

  {
    id: `final-attempt`,
    category: `follow-up`,
    name: `Final Follow-up`,
    subject: `Last try - {{brandName}} x {{creatorName}}`,
    body: `Hi {{contactFirstName}},

This is my last email about partnering with {{brandName}} - I don't want to be that person who keeps emailing! 😊

But I genuinely think there's a great fit here:
- My audience matches your demographic perfectly
- {{engagementRate}}% engagement rate (way above industry average)
- Previous successful partnerships with similar brands

Media kit: {{mediaPackUrl}}

If you're interested, I'd love to chat. If not, no worries - I'll stop bothering you!

{{creatorName}}`,
    variables: [`contactFirstName`, `brandName`, `creatorName`, `engagementRate`, `mediaPackUrl`],
    tone: `friendly`,
    whenToUse: `After 2-3 previous attempts with no response'
  },

  {
    id: `seasonal-collab`,
    category: `pitch`,
    name: `Seasonal Collaboration`,
    subject: `{{season}} Collaboration Idea for {{brandName}}`,
    body: `Hi {{contactFirstName}},

With {{season}} coming up, I wanted to reach out about a potential collaboration with {{brandName}}.

I have some creative ideas for {{season}}-themed content that would showcase your products to my {{followerCount}} followers who are actively shopping for {{seasonalCategory}}.

Past {{season}} campaigns have generated:
- {{seasonalMetric1}}
- {{seasonalMetric2}}

Full details in my media kit: {{mediaPackUrl}}

Interested in discussing this?

Best,
{{creatorName}}`,
    variables: [`contactFirstName`, `season`, `brandName`, `followerCount`, `seasonalCategory`, `seasonalMetric1`, `seasonalMetric2`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `For seasonal campaigns (holidays, back-to-school, etc.)'
  },

  {
    id: `case-study-proof`,
    category: `pitch`,
    name: `Case Study & Proof`,
    subject: `Proven Results for {{brandCategory}} Brands`,
    body: `Hi {{contactFirstName}},

I specialize in helping {{brandCategory}} brands reach {{targetAudience}}, and I've got the track record to prove it.

Recent success with {{competitorName}}:
📊 {{caseStudyResult1}}
📊 {{caseStudyResult2}}
📊 {{caseStudyResult3}}

I believe I could deliver similar (or better!) results for {{brandName}}.

See my full portfolio and metrics: {{mediaPackUrl}}

Open to a quick call?

{{creatorName}}`,
    variables: [`contactFirstName`, `brandCategory`, `targetAudience`, `competitorName`, `caseStudyResult1`, `caseStudyResult2`, `caseStudyResult3`, `brandName`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `When you have strong case studies in the same industry'
  },

  {
    id: `product-launch`,
    category: `pitch`,
    name: `Product Launch Support`,
    subject: `Help Launch {{productName}} to {{followerCount}} Engaged Followers`,
    body: `Hi {{contactFirstName}},

Saw that {{brandName}} is launching {{productName}} - congrats! 🎉

I'd love to help you make a splash with the launch. My {{followerCount}} followers in the {{niche}} space are exactly the early adopters you need.

What I can offer:
• Unboxing/review content
• Behind-the-scenes launch coverage  
• Authentic testimonials
• Multi-platform amplification

Media kit with launch case studies: {{mediaPackUrl}}

Want to discuss launch partnership options?

{{creatorName}}`,
    variables: [`contactFirstName`, `brandName`, `productName`, `followerCount`, `niche`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `When a brand is launching a new product'
  },

  {
    id: `mutual-connection`,
    category: `introduction`,
    name: `Mutual Connection Introduction`,
    subject: `{{mutualContact}} suggested I reach out`,
    body: `Hi {{contactFirstName}},

{{mutualContact}} mentioned you're looking for creators in the {{niche}} space and suggested I get in touch!

I'm {{creatorName}} - I create {{contentType}} content for {{followerCount}} followers who are passionate about {{niche}}.

{{mutualContact}} and I worked together on {{previousCollab}}, which generated {{previousResult}}.

Media kit: {{mediaPackUrl}}

{{mutualContact}} said you'd be the right person to discuss partnership opportunities - does that sound right?

Thanks,
{{creatorName}}`,
    variables: [`contactFirstName`, `mutualContact`, `niche`, `creatorName`, `contentType`, `followerCount`, `previousCollab`, `previousResult`, `mediaPackUrl`],
    tone: `friendly`,
    whenToUse: `When you have a mutual connection or referral'
  },

  {
    id: `ugc-focused`,
    category: `pitch`,
    name: `UGC Content Pitch`,
    subject: `UGC Content Creator for {{brandName}}`,
    body: `Hi {{contactFirstName}},

I'm a UGC content creator specializing in {{niche}} and I'd love to create authentic content for {{brandName}}.

What I offer:
📱 High-quality UGC videos and photos
🎬 Fast turnaround ({{turnaroundTime}})
✨ Rights for paid ads and organic posts
💰 Competitive rates with bulk discounts

Recent UGC work:
- {{ugcExample1}}
- {{ugcExample2}}

Portfolio and pricing: {{mediaPackUrl}}

Need content creators for an upcoming campaign?

{{creatorName}}`,
    variables: [`contactFirstName`, `niche`, `brandName`, `turnaroundTime`, `ugcExample1`, `ugcExample2`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `For UGC-focused pitches (less emphasis on follower count)'
  },

  {
    id: `ambassador-program`,
    category: `pitch`,
    name: `Brand Ambassador Interest`,
    subject: `Interest in {{brandName}} Ambassador Program`,
    body: `Hi {{contactFirstName}},

I'm reaching out about {{brandName}}'s brand ambassador program.

I've been using {{productName}} for {{timeUsing}} and genuinely love it. My audience frequently asks me about {{productCategory}}, and I always recommend quality brands like yours.

Why I'd be a great ambassador:
• Authentic user and advocate (not just a paid promotion)
• {{followerCount}} engaged followers in your target demographic
• {{engagementRate}}% engagement rate
• Long-term partnership focus

Media kit with ambassador case studies: {{mediaPackUrl}}

Is your ambassador program still accepting applications?

Thanks,
{{creatorName}}`,
    variables: [`contactFirstName`, `brandName`, `productName`, `timeUsing`, `productCategory`, `followerCount`, `engagementRate`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `When applying for brand ambassador programs'
  },

  {
    id: `event-coverage`,
    category: `pitch`,
    name: `Event Coverage Offer`,
    subject: `Content Coverage for {{eventName}}`,
    body: `Hi {{contactFirstName}},

I saw that {{brandName}} is hosting {{eventName}} on {{eventDate}} - looks incredible!

I'd love to provide content coverage for the event:
📸 Live social media coverage
🎥 Professional photo/video content
📱 Real-time posting and stories
✨ Post-event recap content

My {{followerCount}} followers would love behind-the-scenes access, and you'd get high-quality content for your channels.

Past event coverage examples: {{mediaPackUrl}}

Any media passes available?

{{creatorName}}`,
    variables: [`contactFirstName`, `brandName`, `eventName`, `eventDate`, `followerCount`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `When a brand is hosting an event'
  },

  {
    id: `affiliate-partnership`,
    category: `pitch`,
    name: `Affiliate Partnership Pitch`,
    subject: `Affiliate Partnership Opportunity`,
    body: `Hi {{contactFirstName}},

I'm interested in becoming an affiliate partner for {{brandName}}.

My audience profile:
- {{followerCount}} followers highly engaged with {{niche}}
- Average {{clickRate}}% click-through rate on product recommendations
- {{conversionRate}}% conversion rate on affiliate links
- Located in {{topMarkets}} (your key markets)

I typically generate {{averageRevenue}} in affiliate revenue per campaign for similar brands.

Media kit with affiliate performance data: {{mediaPackUrl}}

What are your affiliate program terms?

{{creatorName}}`,
    variables: [`contactFirstName`, `brandName`, `followerCount`, `niche`, `clickRate`, `conversionRate`, `topMarkets`, `averageRevenue`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `When interested in affiliate/performance partnerships'
  },

  {
    id: `reactivation`,
    category: `follow-up`,
    name: `Reactivation (Old Contact)`,
    subject: "Let's reconnect - {{creatorName}}",
    body: `Hi {{contactFirstName}},

It's been a while since we last connected! Hope things are going well at {{brandName}}.

I've grown a lot since we last spoke:
- Audience grew from {{oldFollowerCount}} to {{followerCount}}
- Engagement rate improved to {{engagementRate}}%
- Expanded to {{newPlatforms}}

I'd love to explore partnership opportunities again, especially with {{newFocus}}.

Updated media kit: {{mediaPackUrl}}

Interested in reconnecting?

{{creatorName}}`,
    variables: [`contactFirstName`, `brandName`, `creatorName`, `oldFollowerCount`, `followerCount`, `engagementRate`, `newPlatforms`, `newFocus`, `mediaPackUrl`],
    tone: `friendly`,
    whenToUse: `When reaching back out to a past contact'
  },

  {
    id: `competition-response`,
    category: `pitch`,
    name: `Competitive Alternative`,
    subject: `Better Results Than {{competitorName}} Partnership`,
    body: `Hi {{contactFirstName}},

I noticed {{brandName}}'s recent partnership with {{competitorName}}. Great campaign!

I work in the same {{niche}} space, but with some key advantages:
✓ {{advantage1}}
✓ {{advantage2}}
✓ {{advantage3}}

My audience has {{differentiator}} which could complement or expand your current creator strategy.

Media kit with competitive analysis: {{mediaPackUrl}}

Worth a conversation?

{{creatorName}}`,
    variables: [`contactFirstName`, `brandName`, `competitorName`, `niche`, `advantage1`, `advantage2`, `advantage3`, `differentiator`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `When you see a competitor working with the brand'
  },

  {
    id: `geographic-focus`,
    category: `pitch`,
    name: `Geographic Market Pitch`,
    subject: `Reaching {{targetMarket}} Audience for {{brandName}}`,
    body: `Hi {{contactFirstName}},

I'm a creator based in {{creatorLocation}} with a strong following in {{targetMarket}} - exactly where {{brandName}} is looking to expand.

{{marketPercentage}}% of my {{followerCount}} followers are located in {{targetMarket}}, with particularly strong engagement in {{topCities}}.

I understand the local culture, trends, and consumer behavior in {{targetMarket}}, which helps create content that resonates authentically.

Media kit with market demographics: {{mediaPackUrl}}

Want to discuss expanding into {{targetMarket}}?

{{creatorName}}`,
    variables: [`contactFirstName`, `targetMarket`, `brandName`, `creatorLocation`, `marketPercentage`, `followerCount`, `topCities`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `When you have strong geographic alignment'
  },

  {
    id: `content-gap`,
    category: `pitch`,
    name: `Content Gap Solution`,
    subject: "I noticed a gap in {{brandName}}'s {{platform}} strategy",
    body: `Hi {{contactFirstName}},

I've been following {{brandName}} on {{platform}} and noticed you're not leveraging {{contentType}} content yet.

This format is killing it right now - my recent {{contentType}} posts average:
- {{avgViews}} views
- {{engagementRate}}% engagement
- {{shareRate}}% share rate

I could help {{brandName}} break into this format with authentic, high-performing content that fits your brand voice.

Examples and media kit: {{mediaPackUrl}}

Interested in exploring this content format?

{{creatorName}}`,
    variables: [`contactFirstName`, `brandName`, `platform`, `contentType`, `avgViews`, `engagementRate`, `shareRate`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `When you identify a content gap in their strategy'
  },

  {
    id: `bulk-content`,
    category: `pitch`,
    name: `Bulk Content Package`,
    subject: `Content Package Proposal for {{brandName}}`,
    body: `Hi {{contactFirstName}},

I'm offering a special content package that might be perfect for {{brandName}}'s {{campaignFocus}}.

PACKAGE INCLUDES:
📦 {{packageSize}} pieces of content
🎬 {{contentFormats}}
📅 Delivered over {{timeframe}}
💰 {{packagePrice}} ({{discount}}% savings vs individual pricing)

This approach gives you:
- Consistent presence across {{timeframe}}
- Diverse content formats
- Volume pricing
- Dedicated creator focus

Portfolio and package details: {{mediaPackUrl}}

Want to discuss a package deal?

{{creatorName}}`,
    variables: [`contactFirstName`, `brandName`, `campaignFocus`, `packageSize`, `contentFormats`, `timeframe`, `packagePrice`, `discount`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `When pitching bulk/retainer arrangements'
  },

  {
    id: `testimonial-offer`,
    category: `introduction`,
    name: `Authentic Testimonial Offer`,
    subject: `Real {{productName}} User Story`,
    body: `Hi {{contactFirstName}},

I'm not pitching - I'm already a happy {{productName}} customer!

I've been using {{productName}} for {{timeUsing}} and it's genuinely improved {{problemSolved}}. My audience always asks about {{productCategory}}, and I've been recommending you organically.

Thought: What if we made this official? I could create authentic testimonial content showing my real experience, reaching {{followerCount}} potential customers.

No sales pitch, just genuine advocacy backed by actual results.

Media kit (but honestly, my real results speak louder): {{mediaPackUrl}}

Interested in turning an organic fan into a brand partner?

{{creatorName}}`,
    variables: [`contactFirstName`, `productName`, `timeUsing`, `problemSolved`, `productCategory`, `followerCount`, `mediaPackUrl`, `creatorName`],
    tone: `friendly`,
    whenToUse: `When you're genuinely already a customer`
  },

  {
    id: `niche-expert`,
    category: `introduction`,
    name: `Niche Expert Introduction`,
    subject: `{{niche}} Expert - {{brandName}} Partnership`,
    body: `Hi {{contactFirstName}},

I'm one of the leading voices in the {{niche}} space, and I think {{brandName}} would be a perfect fit for my audience.

My credentials:
🏆 {{expertiseProof1}}
🏆 {{expertiseProof2}}
🏆 {{expertiseProof3}}

Audience:
- {{followerCount}} highly engaged followers
- {{nichePercentage}}% specifically interested in {{niche}}
- {{engagementRate}}% engagement (vs {{industryAverage}}% industry average)

Media kit: {{mediaPackUrl}}

Let's discuss how niche expertise can drive results for {{brandName}}.

{{creatorName}}`,
    variables: [`contactFirstName`, `niche`, `brandName`, `expertiseProof1`, `expertiseProof2`, `expertiseProof3`, `followerCount`, `nichePercentage`, `engagementRate`, `industryAverage`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `When you have specialized expertise in a niche'
  },

  {
    id: `quick-wins`,
    category: `pitch`,
    name: `Quick Wins Proposal`,
    subject: `Fast Results for {{brandName}} - Start This Week`,
    body: `Hi {{contactFirstName}},

Want to see results quickly? I can deliver immediate impact for {{brandName}}.

QUICK WIN PACKAGE:
⚡ Content live within {{quickTimeline}}
⚡ Immediate reach to {{followerCount}} followers
⚡ {{contentPieces}} pieces of content
⚡ Guaranteed {{deliveryDate}} delivery

No long negotiations, no complex contracts - just fast, quality content that drives awareness.

Pricing and samples: {{mediaPackUrl}}

Ready to move fast?

{{creatorName}}`,
    variables: [`contactFirstName`, `brandName`, `quickTimeline`, `followerCount`, `contentPieces`, `deliveryDate`, `mediaPackUrl`, `creatorName`],
    tone: `professional`,
    whenToUse: `For brands that need fast results or are testing creators'
  }
];

// Template categories
export const TEMPLATE_CATEGORIES = [
  { id: `introduction`, name: `Introduction`, icon: `👋`, description: `First-time outreach to brands` },
  { id: `follow-up`, name: `Follow-up`, icon: `🔄`, description: `Nudge non-responders` },
  { id: `pitch`, name: `Pitch`, icon: `🎯`, description: `Value-focused proposals` },
  { id: `value-prop`, name: `Value Proposition`, icon: `💎`, description: `Data-driven pitches` },
  { id: `custom`, name: `Custom`, icon: `✍️`, description: `Write your own` }
];

// Helper function to get template by ID
export function getTemplateById(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find(t => t.id === id);
}

// Helper function to get templates by category
export function getTemplatesByCategory(category: EmailTemplate[`category`]): EmailTemplate[] {
  return EMAIL_TEMPLATES.filter(t => t.category === category);
}

// Helper function to get all variable names used across all templates
export function getAllVariables(): string[] {
  const vars = new Set<string>();
  EMAIL_TEMPLATES.forEach(t => t.variables.forEach(v => vars.add(v)));
  return Array.from(vars).sort();
}

// Variable descriptions for UI hints
export const VARIABLE_DESCRIPTIONS: Record<string, string> = {
  // Contact variables
  contactFirstName: 'Contact\'s first name`,
  contactName: 'Contact\'s full name`,
  
  // Creator variables
  creatorName: 'Your name`,
  niche: 'Your content niche`,
  followerCount: 'Your follower count (formatted)`,
  engagementRate: 'Your engagement rate`,
  
  // Brand variables
  brandName: 'Brand name`,
  brandFocus: 'What the brand is known for`,
  brandCategory: 'Brand industry category`,
  productName: 'Specific product name`,
  targetAudience: 'Brand\'s target audience`,
  
  // Social proof variables
  metric1: 'Key achievement #1`,
  metric2: 'Key achievement #2`,
  metric3: 'Key achievement #3`,
  caseStudyResult1: 'Case study result #1`,
  caseStudyResult2: 'Case study result #2`,
  caseStudyResult3: 'Case study result #3`,
  
  // Audience variables
  ageRange: 'Primary age range`,
  gender: 'Gender distribution`,
  topMarkets: 'Top geographic markets`,
  
  // Media pack
  mediaPackUrl: 'Link to your media pack`,
  
  // Context variables
  season: 'Season/holiday (e.g., "Summer", "Black Friday")`,
  mutualContact: 'Name of mutual connection`,
  previousCollab: 'Previous collaboration reference`,
  competitorName: 'Competitor creator name`,
  
  // Timing
  quickTimeline: 'Fast delivery timeline`,
  turnaroundTime: 'Typical turnaround time`,
  deliveryDate: 'Specific delivery date'
};

