/**
 * Demo Brand Database
 * 
 * Real-looking brands for demo workspace to showcase platform capabilities.
 * These brands align with the demo creator profile (156K followers, lifestyle/wellness niche).
 */

export interface DemoBrand {
  id: string;
  name: string;
  domain: string;
  industry: string;
  description: string;
  logo?: string;
  website?: string;
  score: number;
  rationale: string;
  pitchIdea: string;
  partnershipBudget?: string;
  audienceMatch?: string;
  categories?: string[];
}

export const DEMO_BRANDS: DemoBrand[] = [
  // Wellness & Fitness (Top matches for demo profile)
  {
    id: 'demo-nike',
    name: 'Nike',
    domain: 'nike.com',
    industry: 'Sports & Fitness',
    description: 'Global leader in athletic footwear, apparel, and equipment',
    website: 'https://nike.com',
    score: 92,
    rationale: 'Perfect fit for your active lifestyle content and fitness-focused audience. Their sustainability initiatives align with your values.',
    pitchIdea: 'Create a "Training Essentials" series showcasing Nike\'s sustainable activewear line during your workout routines',
    partnershipBudget: '$15,000-25,000',
    audienceMatch: '95%',
    categories: ['Activewear', 'Footwear', 'Sports Equipment']
  },
  {
    id: 'demo-lululemon',
    name: 'Lululemon',
    domain: 'lululemon.com',
    industry: 'Wellness & Athleisure',
    description: 'Premium yoga and athletic apparel brand',
    website: 'https://lululemon.com',
    score: 90,
    rationale: 'Your wellness-focused audience (25-34, 65% female) perfectly matches their core demographic. High engagement on lifestyle content.',
    pitchIdea: '"Mindful Movement" campaign featuring their yoga and meditation apparel in your daily routine content',
    partnershipBudget: '$12,000-20,000',
    audienceMatch: '93%',
    categories: ['Yoga', 'Athleisure', 'Wellness']
  },
  {
    id: 'demo-whoop',
    name: 'WHOOP',
    domain: 'whoop.com',
    industry: 'Fitness Tech',
    description: 'Performance optimization wearable and health platform',
    website: 'https://whoop.com',
    score: 88,
    rationale: 'Tech-savvy audience interested in data-driven fitness. Your behind-the-scenes content style perfect for showcasing recovery insights.',
    pitchIdea: '30-day performance optimization journey tracking sleep, recovery, and training with WHOOP data',
    partnershipBudget: '$10,000-18,000',
    audienceMatch: '89%',
    categories: ['Wearables', 'Health Tech', 'Performance']
  },

  // Beauty & Personal Care
  {
    id: 'demo-glossier',
    name: 'Glossier',
    domain: 'glossier.com',
    industry: 'Beauty & Skincare',
    description: 'Modern beauty brand focused on natural, effortless looks',
    website: 'https://glossier.com',
    score: 87,
    rationale: 'Appeals to your millennial female audience interested in minimalist beauty and self-care. Strong visual storytelling alignment.',
    pitchIdea: '"Effortless Morning Routine" featuring their skincare essentials with authentic, no-filter content',
    partnershipBudget: '$8,000-15,000',
    audienceMatch: '91%',
    categories: ['Skincare', 'Makeup', 'Beauty']
  },
  {
    id: 'demo-theordinary',
    name: 'The Ordinary',
    domain: 'theordinary.com',
    industry: 'Skincare',
    description: 'Clinical skincare formulations at accessible prices',
    website: 'https://theordinary.com',
    score: 85,
    rationale: 'Educational content style perfect for explaining their science-backed products. Audience values transparency and effectiveness.',
    pitchIdea: '"Skincare Science Made Simple" educational series explaining actives and building custom routines',
    partnershipBudget: '$6,000-12,000',
    audienceMatch: '88%',
    categories: ['Clinical Skincare', 'Serums', 'Science-backed']
  },

  // Sustainable Fashion
  {
    id: 'demo-patagonia',
    name: 'Patagonia',
    domain: 'patagonia.com',
    industry: 'Sustainable Fashion',
    description: 'Outdoor apparel committed to environmental responsibility',
    website: 'https://patagonia.com',
    score: 89,
    rationale: 'Your audience values sustainability and ethical brands. Adventure content and environmental focus align perfectly.',
    pitchIdea: '"Worn Wear Stories" showcasing sustainable outdoor adventures and Patagonia\'s repair/reuse program',
    partnershipBudget: '$15,000-25,000',
    audienceMatch: '90%',
    categories: ['Outdoor Gear', 'Sustainable Fashion', 'Adventure']
  },
  {
    id: 'demo-everlane',
    name: 'Everlane',
    domain: 'everlane.com',
    industry: 'Sustainable Fashion',
    description: 'Transparent pricing and ethically-made modern basics',
    website: 'https://everlane.com',
    score: 83,
    rationale: 'Millennial audience appreciates transparent pricing and ethical production. Minimalist aesthetic matches your visual style.',
    pitchIdea: '"Capsule Wardrobe Essentials" building versatile looks with their sustainable basics',
    partnershipBudget: '$7,000-14,000',
    audienceMatch: '87%',
    categories: ['Basics', 'Sustainable Fashion', 'Minimalist']
  },

  // Nutrition & Wellness
  {
    id: 'demo-athletic-greens',
    name: 'Athletic Greens (AG1)',
    domain: 'athleticgreens.com',
    industry: 'Nutrition & Supplements',
    description: 'All-in-one daily nutrition supplement',
    website: 'https://athleticgreens.com',
    score: 86,
    rationale: 'Health-conscious audience seeking simple wellness solutions. Your morning routine content perfect for product integration.',
    pitchIdea: '"Morning Ritual" series showing AG1 as part of your daily wellness routine with energy tracking',
    partnershipBudget: '$8,000-16,000',
    audienceMatch: '88%',
    categories: ['Supplements', 'Wellness', 'Nutrition']
  },
  {
    id: 'demo-vital-proteins',
    name: 'Vital Proteins',
    domain: 'vitalproteins.com',
    industry: 'Nutrition',
    description: 'Collagen peptides and wellness supplements',
    website: 'https://vitalproteins.com',
    score: 84,
    rationale: 'Female-skewed audience interested in beauty-from-within and wellness. Product showcases perform well with your audience.',
    pitchIdea: '"Glow From Within" content series featuring collagen recipes and wellness benefits',
    partnershipBudget: '$7,000-13,000',
    audienceMatch: '86%',
    categories: ['Collagen', 'Supplements', 'Beauty Wellness']
  },

  // Tech & Lifestyle
  {
    id: 'demo-apple',
    name: 'Apple',
    domain: 'apple.com',
    industry: 'Technology',
    description: 'Consumer electronics and digital services',
    website: 'https://apple.com',
    score: 81,
    rationale: 'Your tech-savvy audience uses Apple products. Behind-the-scenes content creation workflows showcase ecosystem.',
    pitchIdea: '"Creator Tech Stack" featuring how you use Apple devices for content creation and productivity',
    partnershipBudget: '$20,000-40,000',
    audienceMatch: '85%',
    categories: ['Consumer Electronics', 'Tech', 'Productivity']
  },
  {
    id: 'demo-notion',
    name: 'Notion',
    domain: 'notion.so',
    industry: 'Productivity Software',
    description: 'All-in-one workspace for notes, tasks, and collaboration',
    website: 'https://notion.so',
    score: 80,
    rationale: 'Audience includes creators and professionals seeking organization tools. Educational content style perfect for showcasing features.',
    pitchIdea: '"Content Planning System" tutorial showing your Notion setup for managing brand partnerships and content calendar',
    partnershipBudget: '$5,000-10,000',
    audienceMatch: '82%',
    categories: ['Productivity', 'Software', 'Organization']
  },

  // Travel & Lifestyle
  {
    id: 'demo-away',
    name: 'Away',
    domain: 'awaytravel.com',
    industry: 'Travel & Luggage',
    description: 'Modern luggage designed for travel and adventure',
    website: 'https://awaytravel.com',
    score: 82,
    rationale: 'Travel content performs well with your audience. Aesthetic product photography aligns with your visual storytelling style.',
    pitchIdea: '"Travel Essentials" series featuring Away luggage on weekend getaways and content creation trips',
    partnershipBudget: '$8,000-15,000',
    audienceMatch: '84%',
    categories: ['Luggage', 'Travel', 'Lifestyle']
  },
  {
    id: 'demo-airbnb',
    name: 'Airbnb',
    domain: 'airbnb.com',
    industry: 'Travel & Hospitality',
    description: 'Vacation rentals and unique travel experiences',
    website: 'https://airbnb.com',
    score: 79,
    rationale: 'Your travel and lifestyle content reaches adventure-seeking millennials. High engagement on destination content.',
    pitchIdea: '"Creator Retreats" showcasing unique Airbnb spaces perfect for content creation and inspiration',
    partnershipBudget: '$12,000-22,000',
    audienceMatch: '83%',
    categories: ['Travel', 'Hospitality', 'Experiences']
  },

  // Food & Beverage
  {
    id: 'demo-oatly',
    name: 'Oatly',
    domain: 'oatly.com',
    industry: 'Food & Beverage',
    description: 'Sustainable oat milk and plant-based products',
    website: 'https://oatly.com',
    score: 78,
    rationale: 'Sustainability-conscious audience interested in plant-based lifestyle. Quirky brand personality matches your authentic style.',
    pitchIdea: '"Morning Coffee Rituals" featuring creative oat milk recipes and sustainable living tips',
    partnershipBudget: '$6,000-11,000',
    audienceMatch: '81%',
    categories: ['Plant-based', 'Sustainable Food', 'Beverages']
  },
  {
    id: 'demo-liquid-death',
    name: 'Liquid Death',
    domain: 'liquiddeath.com',
    industry: 'Beverages',
    description: 'Mountain water in eco-friendly aluminum cans',
    website: 'https://liquiddeath.com',
    score: 76,
    rationale: 'Fun, irreverent brand aligns with your authentic personality. Environmentally-conscious packaging resonates with audience values.',
    pitchIdea: '"Hydration Challenge" with humorous content showing Liquid Death as your gym and content creation companion',
    partnershipBudget: '$5,000-9,000',
    audienceMatch: '79%',
    categories: ['Beverages', 'Sustainability', 'Lifestyle']
  },

  // Home & Wellness
  {
    id: 'demo-dyson',
    name: 'Dyson',
    domain: 'dyson.com',
    industry: 'Home Tech',
    description: 'Premium home appliances and personal care technology',
    website: 'https://dyson.com',
    score: 81,
    rationale: 'Audience invests in quality home products. Your aesthetic content style perfect for showcasing premium design.',
    pitchIdea: '"Home Refresh" series featuring Dyson air purifier and Airwrap in your morning routine',
    partnershipBudget: '$10,000-18,000',
    audienceMatch: '84%',
    categories: ['Home Appliances', 'Personal Care', 'Tech']
  },
  {
    id: 'demo-casper',
    name: 'Casper',
    domain: 'casper.com',
    industry: 'Sleep & Wellness',
    description: 'Premium mattresses and sleep products',
    website: 'https://casper.com',
    score: 77,
    rationale: 'Wellness-focused audience values quality sleep. Your lifestyle content naturally integrates sleep optimization themes.',
    pitchIdea: '"Better Sleep Journey" documenting 30 days of improved sleep with Casper products and sleep tracking',
    partnershipBudget: '$8,000-14,000',
    audienceMatch: '80%',
    categories: ['Sleep', 'Wellness', 'Home']
  },

  // Sustainable Living
  {
    id: 'demo-allbirds',
    name: 'Allbirds',
    domain: 'allbirds.com',
    industry: 'Sustainable Footwear',
    description: 'Eco-friendly shoes made from natural materials',
    website: 'https://allbirds.com',
    score: 83,
    rationale: 'Sustainability values align perfectly. Casual, everyday content style matches their brand aesthetic.',
    pitchIdea: '"Everyday Essentials" featuring Allbirds as your go-to comfortable, sustainable footwear for daily activities',
    partnershipBudget: '$7,000-13,000',
    audienceMatch: '86%',
    categories: ['Footwear', 'Sustainable Fashion', 'Comfort']
  },
  {
    id: 'demo-blueland',
    name: 'Blueland',
    domain: 'blueland.com',
    industry: 'Sustainable Home',
    description: 'Eco-friendly cleaning products without plastic waste',
    website: 'https://blueland.com',
    score: 75,
    rationale: 'Eco-conscious audience seeking sustainable swaps. Educational content style great for showing environmental impact.',
    pitchIdea: '"Plastic-Free Home" transition series replacing conventional cleaners with Blueland refillable system',
    partnershipBudget: '$5,000-9,000',
    audienceMatch: '78%',
    categories: ['Home Cleaning', 'Sustainability', 'Eco-friendly']
  },

  // Beauty & Self-Care
  {
    id: 'demo-drunk-elephant',
    name: 'Drunk Elephant',
    domain: 'drunkelephant.com',
    industry: 'Clean Beauty',
    description: 'Biocompatible skincare free from suspicious ingredients',
    website: 'https://drunkelephant.com',
    score: 84,
    rationale: 'Beauty-conscious audience values clean ingredients. Your visual storytelling showcases products beautifully.',
    pitchIdea: '"Clean Beauty Routine" showing morning and evening skincare with ingredient education',
    partnershipBudget: '$8,000-15,000',
    audienceMatch: '87%',
    categories: ['Clean Beauty', 'Skincare', 'Premium']
  },
  {
    id: 'demo-summer-fridays',
    name: 'Summer Fridays',
    domain: 'summerfridays.com',
    industry: 'Beauty',
    description: 'Vegan skincare focused on hydration and glow',
    website: 'https://summerfridays.com',
    score: 79,
    rationale: 'Young female audience loves their signature Jet Lag Mask. Your authentic product integration style fits their brand voice.',
    pitchIdea: '"Self-Care Sunday" featuring Summer Fridays skincare as part of relaxation and reset routine',
    partnershipBudget: '$6,000-11,000',
    audienceMatch: '82%',
    categories: ['Skincare', 'Vegan Beauty', 'Self-care']
  },

  // Food & Nutrition
  {
    id: 'demo-factor',
    name: 'Factor',
    domain: 'factormeals.com',
    industry: 'Meal Delivery',
    description: 'Fresh, prepared meals designed by dietitians',
    website: 'https://factormeals.com',
    score: 76,
    rationale: 'Busy professionals in audience seek convenient, healthy meal solutions. Your time management content aligns with their value prop.',
    pitchIdea: '"Busy Creator Meal Prep" showing how Factor meals support your content creation schedule',
    partnershipBudget: '$7,000-12,000',
    audienceMatch: '79%',
    categories: ['Meal Delivery', 'Nutrition', 'Convenience']
  },
  {
    id: 'demo-daily-harvest',
    name: 'Daily Harvest',
    domain: 'daily-harvest.com',
    industry: 'Health Food',
    description: 'Organic smoothies, bowls, and plant-based meals',
    website: 'https://daily-harvest.com',
    score: 77,
    rationale: 'Health-focused audience interested in plant-based nutrition. Your morning routine content perfect for showcasing breakfast options.',
    pitchIdea: '"Plant-Powered Mornings" featuring Daily Harvest smoothie bowls in your pre-workout routine',
    partnershipBudget: '$6,000-10,000',
    audienceMatch: '80%',
    categories: ['Plant-based', 'Smoothies', 'Health Food']
  },

  // Fashion & Accessories
  {
    id: 'demo-mejuri',
    name: 'Mejuri',
    domain: 'mejuri.com',
    industry: 'Jewelry',
    description: 'Everyday fine jewelry at accessible prices',
    website: 'https://mejuri.com',
    score: 80,
    rationale: 'Female audience loves affordable luxury. Your lifestyle content naturally showcases jewelry in everyday settings.',
    pitchIdea: '"Everyday Elegance" featuring Mejuri pieces styled for different occasions from coffee runs to content shoots',
    partnershipBudget: '$7,000-13,000',
    audienceMatch: '83%',
    categories: ['Jewelry', 'Accessories', 'Affordable Luxury']
  },
  {
    id: 'demo-warby-parker',
    name: 'Warby Parker',
    domain: 'warbyparker.com',
    industry: 'Eyewear',
    description: 'Designer eyewear at revolutionary prices',
    website: 'https://warbyparker.com',
    score: 74,
    rationale: 'Audience values both style and affordability. Home try-on program perfect for engaging product showcase content.',
    pitchIdea: '"Frame Your Face" trying Warby Parker\'s Home Try-On with audience polls choosing their favorite styles',
    partnershipBudget: '$5,000-9,000',
    audienceMatch: '76%',
    categories: ['Eyewear', 'Fashion', 'Affordable']
  },

  // Wellness Tech
  {
    id: 'demo-oura',
    name: 'Oura Ring',
    domain: 'ouraring.com',
    industry: 'Health Tech',
    description: 'Sleep and health tracking ring with advanced insights',
    website: 'https://ouraring.com',
    score: 85,
    rationale: 'Tech-forward audience interested in health optimization. Your data-driven content style showcases metrics effectively.',
    pitchIdea: '"Sleep Optimization Challenge" tracking sleep quality, HRV, and recovery with Oura Ring insights',
    partnershipBudget: '$9,000-16,000',
    audienceMatch: '87%',
    categories: ['Wearables', 'Sleep Tech', 'Health Tracking']
  },
  {
    id: 'demo-headspace',
    name: 'Headspace',
    domain: 'headspace.com',
    industry: 'Mental Wellness',
    description: 'Meditation and mindfulness app for everyday use',
    website: 'https://headspace.com',
    score: 78,
    rationale: 'Wellness-focused audience interested in stress management. Your authentic vulnerability connects with mental health topics.',
    pitchIdea: '"Mindful Moments" integrating 5-minute Headspace meditations into your daily routine with stress management tips',
    partnershipBudget: '$6,000-11,000',
    audienceMatch: '81%',
    categories: ['Mental Health', 'Meditation', 'Apps']
  },

  // Home & Organization
  {
    id: 'demo-container-store',
    name: 'The Container Store',
    domain: 'containerstore.com',
    industry: 'Home Organization',
    description: 'Storage and organization solutions for every space',
    website: 'https://containerstore.com',
    score: 72,
    rationale: 'Organization content performs well with your audience. Home office and studio setup content natural fit.',
    pitchIdea: '"Studio Organization Makeover" transforming your content creation space with Container Store solutions',
    partnershipBudget: '$5,000-8,000',
    audienceMatch: '74%',
    categories: ['Organization', 'Home', 'Storage']
  },

  // Personal Development
  {
    id: 'demo-masterclass',
    name: 'MasterClass',
    domain: 'masterclass.com',
    industry: 'Education',
    description: 'Online classes taught by world-renowned instructors',
    website: 'https://masterclass.com',
    score: 79,
    rationale: 'Audience values continuous learning and skill development. Your educational content style aligns with their platform.',
    pitchIdea: '"Skills That Scale" showcasing MasterClass courses you\'re taking to level up content creation and business',
    partnershipBudget: '$8,000-14,000',
    audienceMatch: '80%',
    categories: ['Education', 'Online Learning', 'Personal Growth']
  },

  // Sustainable Beauty
  {
    id: 'demo-ilia-beauty',
    name: 'ILIA Beauty',
    domain: 'iliabeauty.com',
    industry: 'Clean Makeup',
    description: 'Clean, conscious beauty with high performance',
    website: 'https://iliabeauty.com',
    score: 81,
    rationale: 'Clean beauty audience seeking performance without compromise. Your no-filter content style showcases true product quality.',
    pitchIdea: '"No-Filter Beauty" day-to-day makeup looks with ILIA clean formulas',
    partnershipBudget: '$6,000-12,000',
    audienceMatch: '84%',
    categories: ['Clean Makeup', 'Beauty', 'Sustainable']
  },

  // Wellness Services
  {
    id: 'demo-classpass',
    name: 'ClassPass',
    domain: 'classpass.com',
    industry: 'Fitness Services',
    description: 'Flexible access to fitness studios and wellness experiences',
    website: 'https://classpass.com',
    score: 75,
    rationale: 'Fitness-engaged audience values variety in workouts. Your workout content and studio visits drive class interest.',
    pitchIdea: '"Try Everything Month" exploring different fitness classes via ClassPass with honest reviews',
    partnershipBudget: '$7,000-13,000',
    audienceMatch: '77%',
    categories: ['Fitness', 'Wellness', 'Experiences']
  },

  // Personal Finance
  {
    id: 'demo-acorns',
    name: 'Acorns',
    domain: 'acorns.com',
    industry: 'Fintech',
    description: 'Micro-investing app for everyday savers',
    website: 'https://acorns.com',
    score: 73,
    rationale: 'Young professionals interested in financial wellness. Your transparency around creator business resonates with money-conscious audience.',
    pitchIdea: '"Creator Finance 101" showing how you use Acorns to invest income from brand deals',
    partnershipBudget: '$5,000-10,000',
    audienceMatch: '75%',
    categories: ['Investing', 'Finance', 'Apps']
  },

  // Coffee & Beverages
  {
    id: 'demo-trade-coffee',
    name: 'Trade Coffee',
    domain: 'drinktrade.com',
    industry: 'Coffee & Beverages',
    description: 'Personalized coffee subscription matching your taste',
    website: 'https://drinktrade.com',
    score: 74,
    rationale: 'Coffee culture resonates with your morning routine content. Audience appreciates discovery and quality.',
    pitchIdea: '"Coffee Journey" taste-testing personalized Trade recommendations with morning content creation rituals',
    partnershipBudget: '$4,000-8,000',
    audienceMatch: '76%',
    categories: ['Coffee', 'Subscription', 'Specialty Beverages']
  },

  // Skincare Tech
  {
    id: 'demo-foreo',
    name: 'FOREO',
    domain: 'foreo.com',
    industry: 'Beauty Tech',
    description: 'Smart skincare devices for cleansing and anti-aging',
    website: 'https://foreo.com',
    score: 78,
    rationale: 'Tech-savvy beauty audience interested in innovative skincare tools. Your product demo content drives high engagement.',
    pitchIdea: '"Skincare Tech Review" showing before/after results with FOREO Luna cleansing device over 30 days',
    partnershipBudget: '$6,000-11,000',
    audienceMatch: '81%',
    categories: ['Beauty Tech', 'Skincare Devices', 'Innovation']
  },

  // Activewear
  {
    id: 'demo-outdoor-voices',
    name: 'Outdoor Voices',
    domain: 'outdoorvoices.com',
    industry: 'Activewear',
    description: 'Activewear for doing things, not just working out',
    website: 'https://outdoorvoices.com',
    score: 76,
    rationale: 'Active lifestyle audience loves versatile athleisure. Your everyday content shows real-world wearability.',
    pitchIdea: '"Recreation > Exercise" campaign showing OV pieces worn for hiking, coffee runs, and content creation',
    partnershipBudget: '$6,000-12,000',
    audienceMatch: '79%',
    categories: ['Athleisure', 'Activewear', 'Lifestyle']
  },

  // Wellness Subscriptions
  {
    id: 'demo-sakara',
    name: 'Sakara Life',
    domain: 'sakara.com',
    industry: 'Wellness & Nutrition',
    description: 'Organic meal delivery focused on plant-based nutrition',
    website: 'https://sakara.com',
    score: 80,
    rationale: 'High-income female audience interested in premium wellness. Your lifestyle content fits their aspirational brand positioning.',
    pitchIdea: '"Nourish & Glow" week featuring Sakara meals with energy levels and wellness tracking',
    partnershipBudget: '$8,000-15,000',
    audienceMatch: '83%',
    categories: ['Meal Delivery', 'Plant-based', 'Wellness']
  },

  // Sustainable Fashion #2
  {
    id: 'demo-reformation',
    name: 'Reformation',
    domain: 'thereformation.com',
    industry: 'Sustainable Fashion',
    description: 'Sustainable women\'s clothing and accessories',
    website: 'https://thereformation.com',
    score: 82,
    rationale: 'Fashion-forward audience values sustainability. Your aesthetic content style showcases their pieces perfectly.',
    pitchIdea: '"Sustainable Style" capsule wardrobe featuring Reformation pieces for versatile, eco-friendly looks',
    partnershipBudget: '$7,000-14,000',
    audienceMatch: '85%',
    categories: ['Women\'s Fashion', 'Sustainable', 'Contemporary']
  },

  // Wellness Apps
  {
    id: 'demo-calm',
    name: 'Calm',
    domain: 'calm.com',
    industry: 'Mental Wellness',
    description: 'Sleep, meditation, and relaxation app',
    website: 'https://calm.com',
    score: 77,
    rationale: 'Wellness audience struggles with stress and sleep. Your vulnerability and authenticity resonate with mental health topics.',
    pitchIdea: '"Better Sleep Series" integrating Calm\'s sleep stories and meditations into evening wind-down routine',
    partnershipBudget: '$6,000-12,000',
    audienceMatch: '80%',
    categories: ['Sleep', 'Meditation', 'Mental Health']
  }
];

/**
 * Get demo brands for demo workspace
 * Returns realistic brand matches for demonstration purposes
 */
export function getDemoBrands(limit: number = 24): DemoBrand[] {
  return DEMO_BRANDS.slice(0, limit);
}

/**
 * Get a specific demo brand by ID
 */
export function getDemoBrand(brandId: string): DemoBrand | undefined {
  return DEMO_BRANDS.find(b => b.id === brandId);
}

/**
 * Filter demo brands by industry
 */
export function getDemoBrandsByIndustry(industry: string, limit: number = 10): DemoBrand[] {
  return DEMO_BRANDS
    .filter(b => b.industry.toLowerCase().includes(industry.toLowerCase()))
    .slice(0, limit);
}

/**
 * Get top-scoring demo brands
 */
export function getTopDemoBrands(limit: number = 10): DemoBrand[] {
  return [...DEMO_BRANDS]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

