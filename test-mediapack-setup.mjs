// Test script to create a MediaPack record for testing
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestMediaPack() {
  try {
    // Create a test MediaPack with realistic data
    const testPack = await prisma.mediaPack.create({
      data: {
        id: 'test-pack-123',
        variant: 'classic',
        workspaceId: 'demo-workspace',
        creatorId: 'demo-creator',
        demo: true,
        brandIds: ['brand-1', 'brand-2'],
        shareToken: 'test-share-token-abc123',
        theme: {
          variant: 'classic',
          dark: false,
          brandColor: '#3b82f6',
          onePager: false
        },
        payload: {
          packId: 'test-pack-123',
          workspaceId: 'demo-workspace',
          brandContext: {
            name: 'Acme Corp',
            domain: 'acme.com'
          },
          creator: {
            name: 'Sarah Johnson',
            tagline: 'Lifestyle Creator • Tech Enthusiast • Storyteller',
            headshotUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            logoUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop',
            niche: ['Lifestyle', 'Technology', 'Fashion']
          },
          socials: [
            {
              platform: 'instagram',
              followers: 125000,
              avgViews: 45000,
              engagementRate: 0.045,
              growth30d: 0.08
            },
            {
              platform: 'tiktok',
              followers: 89000,
              avgViews: 120000,
              engagementRate: 0.062,
              growth30d: 0.15
            }
          ],
          audience: {
            age: [
              { label: '18-24', value: 0.35 },
              { label: '25-34', value: 0.42 },
              { label: '35-44', value: 0.18 },
              { label: '45-54', value: 0.05 }
            ],
            gender: [
              { label: 'Female', value: 0.68 },
              { label: 'Male', value: 0.28 },
              { label: 'Other', value: 0.04 }
            ],
            geo: [
              { label: 'United States', value: 0.45 },
              { label: 'United Kingdom', value: 0.18 },
              { label: 'Canada', value: 0.12 }
            ],
            interests: ['Technology', 'Fashion', 'Travel', 'Fitness', 'Food']
          },
          contentPillars: [
            'Tech Reviews & Unboxings',
            'Lifestyle & Fashion',
            'Travel & Adventure',
            'Behind-the-Scenes',
            'Product Recommendations'
          ],
          caseStudies: [
            {
              brand: {
                name: 'TechGear Pro',
                domain: 'techgear.com'
              },
              goal: 'Increase brand awareness among tech enthusiasts',
              work: 'Created 3 unboxing videos and 2 review posts',
              result: 'Generated 50K views and 2.5K new followers'
            }
          ],
          services: [
            { label: 'Instagram Post', price: 500, notes: 'High-quality content' },
            { label: 'TikTok Video', price: 800, notes: 'Trending format' },
            { label: 'YouTube Review', price: 1200, notes: 'Detailed analysis' }
          ],
          ai: {
            elevatorPitch: 'Sarah Johnson is a dynamic content creator specializing in lifestyle and technology with a proven track record of delivering results for brand partnerships.',
            highlights: [
              'High-quality content creation and brand collaboration',
              'Engaged audience across multiple platforms',
              'Professional partnership approach'
            ]
          },
          cta: {
            bookUrl: 'https://calendly.com/sarah-johnson',
            proposalUrl: 'https://sarahjohnson.com/proposal'
          },
          contact: {
            email: 'sarah@example.com',
            phone: '+1-555-0123',
            website: 'https://sarahjohnson.com'
          }
        }
      }
    });

    console.log('✅ Test MediaPack created:', testPack.id);
    console.log('📋 Pack ID:', testPack.id);
    console.log('🔗 Share Token:', testPack.shareToken);
    console.log('🎨 Theme:', JSON.stringify(testPack.theme, null, 2));
    
    return testPack;
  } catch (error) {
    console.error('❌ Error creating test MediaPack:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestMediaPack();
