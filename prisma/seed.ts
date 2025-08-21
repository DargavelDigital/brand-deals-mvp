import { PrismaClient } from '@prisma/client';
import { seedBrands } from './seed-data/brands';
import { seedEmailTemplates } from './seed-data/templates';
import { resolveBrandColors } from '../src/services/brand/colorResolver';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting BrandDeals MVP seeding...');

  // 1. Create or upsert demo workspace
  console.log('📁 Creating demo workspace...');
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace'
    }
  });

  // 2. Create or upsert demo user
  console.log('👤 Creating demo user...');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@branddeals.test' },
    update: {},
    create: {
      name: 'Demo Creator',
      email: 'demo@branddeals.test',
      workspaceId: workspace.id
    }
  });

  // 3. Create or upsert subscription
  console.log('💳 Creating subscription...');
  await prisma.subscription.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: {
      workspaceId: workspace.id,
      plan: 'STARTER',
      status: 'ACTIVE'
    }
  });

  // 4. Seed credits
  console.log('💰 Seeding credits...');
  const creditTypes = [
    { type: 'AUDIT', amount: 200, description: 'Initial audit credits' },
    { type: 'MEDIA_PACK', amount: 50, description: 'Initial media pack credits' },
    { type: 'OUTREACH', amount: 100, description: 'Initial outreach credits' }
  ];

  for (const credit of creditTypes) {
    await prisma.creditLedger.create({
      data: {
        workspaceId: workspace.id,
        type: credit.type as any,
        amount: credit.amount,
        description: credit.description
      }
    });
  }

  // 5. Seed brands and brand profiles
  console.log('🏢 Seeding brands...');
  let brandCount = 0;
  for (const seedBrand of seedBrands) {
    try {
      const brand = await prisma.brand.upsert({
        where: {
          workspaceId_name: {
            workspaceId: workspace.id,
            name: seedBrand.name
          }
        },
        update: {},
        create: {
          name: seedBrand.name,
          description: `${seedBrand.name} - ${seedBrand.categories.join(', ')}`,
          website: `https://${seedBrand.domain}`,
          industry: seedBrand.categories[0],
          workspaceId: workspace.id
        }
      });

      // Create brand profile
      const brandProfile = await prisma.brandProfile.upsert({
        where: { brandId: brand.id },
        update: {},
        create: {
          brandId: brand.id,
          logoUrl: `https://logo.clearbit.com/${seedBrand.domain}`,
          categories: seedBrand.categories,
          domain: seedBrand.domain
        }
      });

      // Resolve brand colors with rate limiting
      try {
        // Add delay to avoid overwhelming external sites
        if (brandCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
        
        const colors = await resolveBrandColors(seedBrand.domain);
        
        if (colors.primary || colors.secondary) {
          await prisma.brandProfile.update({
            where: { id: brandProfile.id },
            data: {
              brandPrimaryColor: colors.primary,
              brandSecondaryColor: colors.secondary
            }
          });
          
          console.log(`🎨 Seeded Brand + Colors → ${seedBrand.name}: ${colors.primary || 'N/A'}, ${colors.secondary || 'N/A'}`);
        } else {
          console.log(`🎨 Seeded Brand → ${seedBrand.name} (no colors detected)`);
        }
      } catch (error) {
        console.warn(`⚠️  Color resolution failed for ${seedBrand.name}:`, error);
        console.log(`🎨 Seeded Brand → ${seedBrand.name} (color detection failed)`);
      }

      brandCount++;
    } catch (error) {
      console.warn(`⚠️  Failed to seed brand ${seedBrand.name}:`, error);
    }
  }

  // 6. Seed email templates
  console.log('📧 Seeding email templates...');
  let templateCount = 0;
  for (const seedTemplate of seedEmailTemplates) {
    try {
      await prisma.emailTemplate.upsert({
        where: {
          workspaceId_key: {
            workspaceId: workspace.id,
            key: seedTemplate.key
          }
        },
        update: {
          name: seedTemplate.name,
          subject: seedTemplate.subject,
          body: seedTemplate.body,
          variables: seedTemplate.variables
        },
        create: {
          key: seedTemplate.key,
          name: seedTemplate.name,
          subject: seedTemplate.subject,
          body: seedTemplate.body,
          variables: seedTemplate.variables,
          workspaceId: workspace.id
        }
      });
      templateCount++;
    } catch (error) {
      console.warn(`⚠️  Failed to seed template ${seedTemplate.key}:`, error);
    }
  }

  // 7. Create sample deals
  console.log('🤝 Creating sample deals...');
  const sampleBrands = await prisma.brand.findMany({
    where: { workspaceId: workspace.id },
    take: 3
  });

  const dealStages = ['PENDING', 'ACTIVE', 'COMPLETED'] as const;
  let dealCount = 0;

  for (let i = 0; i < Math.min(sampleBrands.length, 3); i++) {
    const brand = sampleBrands[i];
    const status = dealStages[i];
    
    try {
      await prisma.deal.create({
        data: {
          title: `Sample ${status.toLowerCase()} deal with ${brand.name}`,
          description: `This is a sample ${status.toLowerCase()} deal to demonstrate the CRM functionality.`,
          value: Math.floor(Math.random() * 5000) + 1000,
          status: status as any,
          brandId: brand.id,
          workspaceId: workspace.id
        }
      });
      dealCount++;
    } catch (error) {
      console.warn(`⚠️  Failed to create deal for ${brand.name}:`, error);
    }
  }

  // 8. Print summary
  console.log('\n🎉 Seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   • Workspace: ${workspace.name} (${workspace.slug})`);
  console.log(`   • Demo User: ${demoUser.name} (${demoUser.email})`);
  console.log(`   • Brands: ${brandCount} created/updated`);
  console.log(`   • Email Templates: ${templateCount} created/updated`);
  console.log(`   • Sample Deals: ${dealCount} created`);
  console.log(`   • Credits: AUDIT(200), MEDIA_PACK(50), OUTREACH(100)`);
  console.log('\n🚀 Your BrandDeals MVP is ready for demo!');
  console.log(`   • Visit: http://localhost:3000`);
  console.log(`   • Demo user: demo@branddeals.test`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
