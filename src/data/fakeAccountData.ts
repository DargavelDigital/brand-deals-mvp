/**
 * Comprehensive fake Instagram account data for admin testing
 * 
 * This allows admins to test the full audit → brand matching → contacts workflow
 * without connecting a real Instagram account.
 */

export const FAKE_INSTAGRAM_SNAPSHOT = {
  instagram: {
    igUserId: 'fake_ig_user_12345',
    username: 'demo_creator',
    followers: 50000,
    avgEngagementRate: 0.045, // 4.5%
    
    posts: [
      // High performing fashion post
      {
        id: 'fake_post_1',
        caption: 'New season essentials 🍂 Loving these autumn vibes! Which piece is your favorite? #fallfashion #ootd #styleinspo',
        like_count: 4850,
        comments_count: 142,
        timestamp: '2025-10-10T14:30:00Z',
        media_type: 'IMAGE'
      },
      // Moderate performing lifestyle post
      {
        id: 'fake_post_2',
        caption: 'Sunday morning routine ☕️ Taking time to slow down and appreciate the little things #selfcare #sundayvibes #lifestyle',
        like_count: 3200,
        comments_count: 89,
        timestamp: '2025-10-08T09:15:00Z',
        media_type: 'CAROUSEL_ALBUM'
      },
      // High performing travel video
      {
        id: 'fake_post_3',
        caption: 'Exploring hidden gems in the city 🌆 Who else loves finding new spots? #travel #citylife #explore',
        like_count: 5200,
        comments_count: 167,
        timestamp: '2025-10-05T18:45:00Z',
        media_type: 'VIDEO'
      },
      // Creator tips post
      {
        id: 'fake_post_4',
        caption: '5 tips for better Instagram engagement 💡 Save this for later! What works best for you? #creatortips #instagramgrowth #socialmedia',
        like_count: 3800,
        comments_count: 124,
        timestamp: '2025-10-02T12:00:00Z',
        media_type: 'CAROUSEL_ALBUM'
      },
      // Fashion collaboration
      {
        id: 'fake_post_5',
        caption: 'Partnering with @sustainablefashion for this amazing collection 🌿 Use code DEMO15 for 15% off! #ad #sustainable #fashion',
        like_count: 4200,
        comments_count: 98,
        timestamp: '2025-09-28T16:20:00Z',
        media_type: 'IMAGE'
      },
      // Behind the scenes
      {
        id: 'fake_post_6',
        caption: 'BTS of today\'s photoshoot 📸 It takes a village! Swipe to see the final shots #bts #photoshoot #creator',
        like_count: 2900,
        comments_count: 76,
        timestamp: '2025-09-25T11:30:00Z',
        media_type: 'CAROUSEL_ALBUM'
      },
      // Product review
      {
        id: 'fake_post_7',
        caption: 'Honest review of my favorite skincare products ✨ Link in bio for full routine #skincare #beauty #review',
        like_count: 3600,
        comments_count: 112,
        timestamp: '2025-09-22T10:00:00Z',
        media_type: 'VIDEO'
      },
      // Lifestyle vlog
      {
        id: 'fake_post_8',
        caption: 'A day in my life as a content creator 🎥 The reality vs the highlight reel #dayinthelife #creator #vlog',
        like_count: 4100,
        comments_count: 134,
        timestamp: '2025-09-19T15:45:00Z',
        media_type: 'VIDEO'
      },
      // Fashion haul
      {
        id: 'fake_post_9',
        caption: 'Fall fashion haul! 🛍️ So excited to style these pieces #haul #fashion #shopping',
        like_count: 3400,
        comments_count: 91,
        timestamp: '2025-09-16T13:20:00Z',
        media_type: 'VIDEO'
      },
      // Inspirational
      {
        id: 'fake_post_10',
        caption: 'Reminder: Your journey is unique. Don\'t compare your chapter 1 to someone else\'s chapter 20 💫 #motivation #mindset',
        like_count: 5100,
        comments_count: 156,
        timestamp: '2025-09-13T08:00:00Z',
        media_type: 'IMAGE'
      },
      // Travel guide
      {
        id: 'fake_post_11',
        caption: 'Your ultimate guide to weekend getaways 🗺️ Saved the best spots for you! #travel #guide #weekend',
        like_count: 2800,
        comments_count: 68,
        timestamp: '2025-09-10T17:30:00Z',
        media_type: 'CAROUSEL_ALBUM'
      },
      // Wellness content
      {
        id: 'fake_post_12',
        caption: 'Morning wellness routine that changed my life 🧘‍♀️ Comment your favorite wellness tip! #wellness #health #routine',
        like_count: 3900,
        comments_count: 118,
        timestamp: '2025-09-07T07:15:00Z',
        media_type: 'VIDEO'
      },
      // Fashion trend
      {
        id: 'fake_post_13',
        caption: 'This fall trend is everywhere! How are you styling it? 🍁 #fashiontrends #fall2025 #style',
        like_count: 3300,
        comments_count: 87,
        timestamp: '2025-09-04T14:00:00Z',
        media_type: 'IMAGE'
      },
      // Creator collaboration
      {
        id: 'fake_post_14',
        caption: 'Amazing collab with @fellow_creator! Check out their page for more inspo 🤝 #collaboration #creator #community',
        like_count: 2600,
        comments_count: 73,
        timestamp: '2025-09-01T12:45:00Z',
        media_type: 'IMAGE'
      },
      // Beauty tutorial
      {
        id: 'fake_post_15',
        caption: '10-minute makeup tutorial perfect for busy mornings ⏰ Save for later! #makeup #beauty #tutorial',
        like_count: 4400,
        comments_count: 145,
        timestamp: '2025-08-28T10:30:00Z',
        media_type: 'VIDEO'
      },
      // Personal story
      {
        id: 'fake_post_16',
        caption: 'The truth about being a content creator... it\'s not always glamorous but it\'s worth it 💪 #real #creator #journey',
        like_count: 4700,
        comments_count: 189,
        timestamp: '2025-08-25T19:00:00Z',
        media_type: 'IMAGE'
      },
      // Product launch
      {
        id: 'fake_post_17',
        caption: 'LAUNCHING SOMETHING SPECIAL 🎉 Been working on this for months! Link in bio #launch #exciting #new',
        like_count: 5500,
        comments_count: 201,
        timestamp: '2025-08-22T16:00:00Z',
        media_type: 'VIDEO'
      },
      // Casual lifestyle
      {
        id: 'fake_post_18',
        caption: 'Simple pleasures: good coffee, good music, good vibes ☕️🎵 #mood #lifestyle #simple',
        like_count: 2700,
        comments_count: 64,
        timestamp: '2025-08-19T09:30:00Z',
        media_type: 'IMAGE'
      },
      // Q&A
      {
        id: 'fake_post_19',
        caption: 'You asked, I answered! Q&A about my content creation journey 💬 Drop more questions below! #qa #creator #community',
        like_count: 3100,
        comments_count: 156,
        timestamp: '2025-08-16T20:15:00Z',
        media_type: 'CAROUSEL_ALBUM'
      },
      // Inspirational quote
      {
        id: 'fake_post_20',
        caption: 'Start where you are. Use what you have. Do what you can. 🌟 #motivation #inspiration #growth',
        like_count: 4600,
        comments_count: 138,
        timestamp: '2025-08-13T08:00:00Z',
        media_type: 'IMAGE'
      }
    ]
  },
  derived: {
    contentThemes: ['Fashion', 'Lifestyle', 'Travel', 'Creator Tips', 'Wellness', 'Beauty'],
    globalEngagementRate: 0.045
  }
};

/**
 * Fake aggregated audit data to match what aggregateAuditData() returns
 */
export const FAKE_AUDIT_DATA = {
  audience: {
    totalFollowers: 50000,
    avgEngagement: 0.045, // 4.5%
    reachRate: 10.2,
    avgLikes: 3200,
    avgComments: 85,
    avgShares: 12
  },
  performance: {
    avgLikes: 3200,
    avgComments: 85,
    avgShares: 12
  },
  contentSignals: ['Fashion', 'Lifestyle', 'Travel', 'Creator Tips', 'Wellness', 'Beauty'],
  sources: ['INSTAGRAM']
};

