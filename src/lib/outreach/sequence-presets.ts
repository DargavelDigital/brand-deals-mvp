export interface SequencePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  bestFor: string;
  totalSteps: number;
  estimatedDuration: string;
  stopOnReply: boolean;
  steps: SequencePresetStep[];
}

export interface SequencePresetStep {
  stepNumber: number;
  templateId: string;
  delayDays: number;
  subject: string;
  body: string;
  stopOnReply: boolean;
}

export const SEQUENCE_PRESETS: SequencePreset[] = [
  {
    id: `first-contact-3step`,
    name: `First Contact (3-Step)`,
    description: `Perfect for initial brand outreach with gentle follow-ups`,
    icon: `👋`,
    bestFor: `New brands you've never contacted`,
    totalSteps: 3,
    estimatedDuration: `7-10 days`,
    stopOnReply: true,
    steps: [
      {
        stepNumber: 1,
        templateId: `intro-media-kit`,
        delayDays: 0,
        subject: `Partnership Opportunity - {{brandName}}`,
        body: `Hi {{contactFirstName}},

I'm {{creatorName}}, a content creator in the {{niche}} space with {{followerCount}} engaged followers.

I've been following {{brandName}} and love what you're doing with {{brandFocus}}. I think there's a great opportunity for us to collaborate.

I've put together a media kit that shows my audience demographics, engagement rates, and previous brand partnerships: {{mediaPackUrl}}

Would you be open to a quick chat about potential collaboration opportunities?

Best regards,
{{creatorName}}`,
        stopOnReply: true
      },
      {
        stepNumber: 2,
        templateId: `followup-no-response`,
        delayDays: 3,
        subject: `Re: Partnership with {{brandName}}`,
        body: `Hi {{contactFirstName}},

I wanted to follow up on my previous email about partnering with {{brandName}}.

I know you're busy, so I'll keep this brief. My audience of {{followerCount}} in the {{niche}} space aligns perfectly with your target demographic.

Here's my media kit again: {{mediaPackUrl}}

Would love to connect for 15 minutes this week if you're interested.

Thanks,
{{creatorName}}`,
        stopOnReply: true
      },
      {
        stepNumber: 3,
        templateId: `final-attempt`,
        delayDays: 4,
        subject: `Last try - {{brandName}} x {{creatorName}}`,
        body: `Hi {{contactFirstName}},

This is my last email about partnering with {{brandName}} - I don't want to be that person who keeps emailing! 😊

But I genuinely think there's a great fit here:
- My audience matches your demographic perfectly
- {{followerCount}} engaged followers with {{engagementRate}}% engagement
- Strong track record with similar brands

Media kit: {{mediaPackUrl}}

If you're interested, I'd love to chat. If not, no worries - I'll stop bothering you!

{{creatorName}}`,
        stopOnReply: true
      }
    ]
  },

  {
    id: `cold-outreach-pro-5step`,
    name: `Cold Outreach Pro (5-Step)`,
    description: `Comprehensive outreach campaign for maximum conversions`,
    icon: `🎯`,
    bestFor: `High-value brands worth persistent effort`,
    totalSteps: 5,
    estimatedDuration: `15-20 days`,
    stopOnReply: true,
    steps: [
      {
        stepNumber: 1,
        templateId: `intro-media-kit`,
        delayDays: 0,
        subject: `Quick intro - {{creatorName}} x {{brandName}}`,
        body: `Hi {{contactFirstName}},

I'm {{creatorName}}, creating content for {{followerCount}} people in the {{niche}} space.

I've noticed {{brandName}} is focused on reaching {{targetAudience}}. That's exactly my audience.

Quick stats: {{followerCount}} followers, {{engagementRate}}% engagement rate.

Would you be interested in learning more?

{{creatorName}}`,
        stopOnReply: true
      },
      {
        stepNumber: 2,
        templateId: `value-prop-pitch`,
        delayDays: 3,
        subject: `How I can help {{brandName}} reach your audience`,
        body: `Hi {{contactFirstName}},

Following up on my previous email - I wanted to share specifically how I could help {{brandName}}.

My audience breakdown:
• {{followerCount}} followers with {{engagementRate}}% engagement
• {{ageRange}} years old
• {{gender}} split
• Top markets: {{topMarkets}}

Full media kit: {{mediaPackUrl}}

Free for a call this week?

{{creatorName}}`,
        stopOnReply: true
      },
      {
        stepNumber: 3,
        templateId: `case-study-proof`,
        delayDays: 3,
        subject: `Results I've driven for similar brands`,
        body: `Hi {{contactFirstName}},

Wanted to share some quick wins from recent brand partnerships:

✓ 2.5M impressions for lifestyle brand
✓ 8.2% click-through rate for tech product
✓ 45% increase in brand awareness

I specialize in helping brands like {{brandName}} reach engaged {{niche}} audiences.

Happy to share detailed case studies if you're interested in partnering.

Media kit: {{mediaPackUrl}}

{{creatorName}}`,
        stopOnReply: true
      },
      {
        stepNumber: 4,
        templateId: `value-prop-pitch`,
        delayDays: 4,
        subject: `Still interested in {{brandName}} partnership`,
        body: `Hi {{contactFirstName}},

I know I've reached out a few times - just wanted to check one more time if there's interest in collaborating.

My offer still stands: {{followerCount}} engaged followers who would love {{brandName}}.

I think we could create something really special together.

Media kit: {{mediaPackUrl}}

Let me know!
{{creatorName}}`,
        stopOnReply: true
      },
      {
        stepNumber: 5,
        templateId: `final-attempt`,
        delayDays: 5,
        subject: `Final check-in - {{brandName}}`,
        body: `Hi {{contactFirstName}},

Last email, I promise! 

Just wanted to see if there's any interest in partnering with {{creatorName}}. If not, no worries - I'll stop reaching out.

If yes - I'd love to make something great together with {{brandName}}.

Best,
{{creatorName}}
{{mediaPackUrl}}`,
        stopOnReply: true
      }
    ]
  },

  {
    id: `warm-intro-2step`,
    name: `Warm Introduction (2-Step)`,
    description: `For brands you have some connection with`,
    icon: `🤝`,
    bestFor: `Brands you've interacted with or mutual connections`,
    totalSteps: 2,
    estimatedDuration: `5-7 days`,
    stopOnReply: true,
    steps: [
      {
        stepNumber: 1,
        templateId: `casual-intro`,
        delayDays: 0,
        subject: `Love what {{brandName}} is doing!`,
        body: `Hey {{contactFirstName}}!

I'm {{creatorName}} - I've been following {{brandName}} for a while and genuinely love what you're doing with {{brandFocus}}.

I create content in the {{niche}} space for {{followerCount}} people, and I think my audience would really connect with your brand.

I'd love to explore a partnership. Here's my media kit: {{mediaPackUrl}}

Can we chat?

{{creatorName}}`,
        stopOnReply: true
      },
      {
        stepNumber: 2,
        templateId: `followup-no-response`,
        delayDays: 5,
        subject: `Re: Partnership with {{brandName}}`,
        body: `Hey {{contactFirstName}},

Just wanted to follow up on my email from last week about potentially working together.

I know things get busy - no pressure! But if you're interested in a collaboration, I'd love to make it happen.

My media kit: {{mediaPackUrl}}

Thanks!
{{creatorName}}`,
        stopOnReply: true
      }
    ]
  },

  {
    id: `quick-pitch-1step`,
    name: `Quick Pitch (1-Step)`,
    description: `Single powerful email, no follow-ups`,
    icon: `⚡`,
    bestFor: `Quick opportunities or casual inquiries`,
    totalSteps: 1,
    estimatedDuration: `Immediate`,
    stopOnReply: false,
    steps: [
      {
        stepNumber: 1,
        templateId: `intro-media-kit`,
        delayDays: 0,
        subject: `{{brandName}} x {{creatorName}} - Partnership Inquiry`,
        body: `Hi {{contactFirstName}},

Quick pitch: I'm {{creatorName}} with {{followerCount}} engaged followers in the {{niche}} space.

I think there's a great fit between my audience and {{brandName}}. 

Everything you need to know: {{mediaPackUrl}}

Interested? Let's talk.

{{creatorName}}`,
        stopOnReply: false
      }
    ]
  }
];

// Helper function to load a preset into the sequence builder
export function loadPresetIntoSequence(presetId: string): SequencePresetStep[] | null {
  const preset = SEQUENCE_PRESETS.find(p => p.id === presetId);
  if (!preset) return null;
  return preset.steps;
}

// Get preset by ID
export function getPresetById(presetId: string): SequencePreset | null {
  return SEQUENCE_PRESETS.find(p => p.id === presetId) || null;
}

