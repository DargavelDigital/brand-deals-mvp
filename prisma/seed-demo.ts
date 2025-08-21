import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function seedDemo() {
  console.log('🌱 Starting demo seed...');

  // Ensure we have a demo workspace
  const demoWorkspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
    },
  });

  console.log(`✅ Demo workspace: ${demoWorkspace.name}`);

  // Create demo brands across categories
  const demoBrands = [
    // Fitness & Wellness
    { name: 'Gymshark', domain: 'gymshark.com', industry: 'Fitness', categories: ['Fitness', 'Athleisure', 'Wellness'] },
    { name: 'Lululemon', domain: 'lululemon.com', industry: 'Athleisure', categories: ['Fitness', 'Athleisure', 'Lifestyle'] },
    { name: 'Nike', domain: 'nike.com', industry: 'Sports', categories: ['Fitness', 'Sports', 'Athleisure'] },
    { name: 'Adidas', domain: 'adidas.com', industry: 'Sports', categories: ['Fitness', 'Sports', 'Athleisure'] },
    { name: 'Under Armour', domain: 'underarmour.com', industry: 'Sports', categories: ['Fitness', 'Sports', 'Athleisure'] },
    
    // Food & Beverage
    { name: 'Starbucks', domain: 'starbucks.com', industry: 'Food & Beverage', categories: ['Food', 'Beverages', 'Lifestyle'] },
    { name: 'Chipotle', domain: 'chipotle.com', industry: 'Food & Beverage', categories: ['Food', 'Fast Casual', 'Lifestyle'] },
    { name: 'Sweetgreen', domain: 'sweetgreen.com', industry: 'Food & Beverage', categories: ['Food', 'Health', 'Lifestyle'] },
    
    // Technology
    { name: 'Apple', domain: 'apple.com', industry: 'Technology', categories: ['Technology', 'Electronics', 'Lifestyle'] },
    { name: 'Samsung', domain: 'samsung.com', industry: 'Technology', categories: ['Technology', 'Electronics', 'Lifestyle'] },
    { name: 'Google', domain: 'google.com', industry: 'Technology', categories: ['Technology', 'Software', 'Lifestyle'] },
    
    // Beauty & Personal Care
    { name: 'Sephora', domain: 'sephora.com', industry: 'Beauty', categories: ['Beauty', 'Retail', 'Lifestyle'] },
    { name: 'Ulta Beauty', domain: 'ulta.com', industry: 'Beauty', categories: ['Beauty', 'Retail', 'Lifestyle'] },
    { name: 'Glossier', domain: 'glossier.com', industry: 'Beauty', categories: ['Beauty', 'D2C', 'Lifestyle'] },
    
    // Fashion & Retail
    { name: 'Zara', domain: 'zara.com', industry: 'Fashion', categories: ['Fashion', 'Retail', 'Lifestyle'] },
    { name: 'H&M', domain: 'hm.com', industry: 'Fashion', categories: ['Fashion', 'Retail', 'Lifestyle'] },
    { name: 'ASOS', domain: 'asos.com', industry: 'Fashion', categories: ['Fashion', 'E-commerce', 'Lifestyle'] },
    
    // Home & Lifestyle
    { name: 'IKEA', domain: 'ikea.com', industry: 'Home', categories: ['Home', 'Furniture', 'Lifestyle'] },
    { name: 'Target', domain: 'target.com', industry: 'Retail', categories: ['Retail', 'Home', 'Lifestyle'] },
    { name: 'West Elm', domain: 'westelm.com', industry: 'Home', categories: ['Home', 'Furniture', 'Lifestyle'] },
    
    // Travel & Hospitality
    { name: 'Airbnb', domain: 'airbnb.com', industry: 'Travel', categories: ['Travel', 'Hospitality', 'Lifestyle'] },
    { name: 'Uber', domain: 'uber.com', industry: 'Transportation', categories: ['Transportation', 'Technology', 'Lifestyle'] },
    { name: 'Lyft', domain: 'lyft.com', industry: 'Transportation', categories: ['Transportation', 'Technology', 'Lifestyle'] },
    
    // Finance & Services
    { name: 'Chase', domain: 'chase.com', industry: 'Finance', categories: ['Finance', 'Banking', 'Services'] },
    { name: 'American Express', domain: 'americanexpress.com', industry: 'Finance', categories: ['Finance', 'Credit Cards', 'Services'] },
    { name: 'PayPal', domain: 'paypal.com', industry: 'Finance', categories: ['Finance', 'Payments', 'Technology'] },
    
    // Entertainment & Media
    { name: 'Netflix', domain: 'netflix.com', industry: 'Entertainment', categories: ['Entertainment', 'Streaming', 'Media'] },
    { name: 'Spotify', domain: 'spotify.com', industry: 'Entertainment', categories: ['Entertainment', 'Music', 'Technology'] },
    { name: 'TikTok', domain: 'tiktok.com', industry: 'Technology', categories: ['Technology', 'Social Media', 'Entertainment'] }
  ];

  console.log(`📦 Creating ${demoBrands.length} demo brands...`);

  for (const brandData of demoBrands) {
    const brand = await prisma.brand.upsert({
      where: { 
        workspaceId_name: { 
          workspaceId: demoWorkspace.id, 
          name: brandData.name 
        } 
      },
      update: {},
      create: {
        name: brandData.name,
        description: `${brandData.name} is a leading ${brandData.industry.toLowerCase()} company.`,
        website: `https://www.${brandData.domain}`,
        industry: brandData.industry,
        workspaceId: demoWorkspace.id,
      },
    });

    // Create brand profile with logo and colors
    await prisma.brandProfile.upsert({
      where: { brandId: brand.id },
      update: {},
      create: {
        brandId: brand.id,
        logoUrl: `https://logo.clearbit.com/${brandData.domain}`,
        primaryColor: '#7C5CFF', // Default brand color
        secondaryColor: '#22D3EE', // Default secondary color
        categories: brandData.categories,
        domain: brandData.domain,
      },
    });

    console.log(`  ✅ ${brand.name} (${brandData.domain})`);
  }

  // Create demo media packs
  console.log('📄 Creating demo media packs...');
  
  const mediaPackVariants = ['default', 'brand'];
  for (const variant of mediaPackVariants) {
    await prisma.mediaPack.upsert({
      where: { 
        id: `demo-${variant}` 
      },
      update: {},
      create: {
        id: `demo-${variant}`,
        variant,
        htmlUrl: `/demo/media-packs/demo-${variant}.html`,
        pdfUrl: `/demo/media-packs/demo-${variant}.pdf`,
        workspaceId: demoWorkspace.id,
        creatorId: 'demo-creator',
        demo: true,
      },
    });
    console.log(`  ✅ Media Pack: ${variant}`);
  }

  // Create demo credit ledger with plenty of credits
  console.log('💰 Creating demo credits...');
  
  const creditTypes = ['AUDIT', 'MEDIA_PACK', 'OUTREACH'];
  for (const creditType of creditTypes) {
    await prisma.creditLedger.upsert({
      where: { 
        id: `demo-${creditType.toLowerCase()}` 
      },
      update: {},
      create: {
        id: `demo-${creditType.toLowerCase()}`,
        workspaceId: demoWorkspace.id,
        type: creditType as any,
        amount: 999,
        description: `Demo ${creditType.toLowerCase()} credits for testing`,
      },
    });
    console.log(`  ✅ Credits: ${creditType} (999)`);
  }

  // Create demo deals
  console.log('🤝 Creating demo deals...');
  
  const demoDeals = [
    { title: 'Summer Fitness Campaign', value: 5000, status: 'ACTIVE' },
    { title: 'Holiday Collection Launch', value: 8000, status: 'PENDING' },
    { title: 'Brand Awareness Partnership', value: 3500, status: 'COMPLETED' },
  ];

  for (const dealData of demoDeals) {
    const brand = await prisma.brand.findFirst({
      where: { workspaceId: demoWorkspace.id }
    });
    
    if (brand) {
      await prisma.deal.upsert({
        where: { 
          id: `demo-deal-${dealData.title.toLowerCase().replace(/\s+/g, '-')}` 
        },
        update: {},
        create: {
          id: `demo-deal-${dealData.title.toLowerCase().replace(/\s+/g, '-')}`,
          title: dealData.title,
          description: `Demo deal for ${dealData.title}`,
          value: dealData.value,
          status: dealData.status as any,
          brandId: brand.id,
          workspaceId: demoWorkspace.id,
        },
      });
      console.log(`  ✅ Deal: ${dealData.title} ($${dealData.value})`);
    }
  }

  console.log('🎉 Demo seed completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`  - Workspace: ${demoWorkspace.name}`);
  console.log(`  - Brands: ${demoBrands.length}`);
  console.log(`  - Media Packs: ${mediaPackVariants.length}`);
  console.log(`  - Credit Types: ${creditTypes.length}`);
  console.log(`  - Demo Deals: ${demoDeals.length}`);
  console.log('');
  console.log('🚀 You can now run the Brand Run wizard in demo mode!');
}

seedDemo()
  .catch((e) => {
    console.error('❌ Demo seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
