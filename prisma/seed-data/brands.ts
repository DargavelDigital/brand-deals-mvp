export interface SeedBrand {
  name: string;
  domain: string;
  categories: string[];
}

// Base brands across different verticals
const baseBrands: SeedBrand[] = [
  // Fitness & Wellness
  { name: "Nike", domain: "nike.com", categories: ["Fitness", "Fashion", "Sports"] },
  { name: "Adidas", domain: "adidas.com", categories: ["Fitness", "Fashion", "Sports"] },
  { name: "Lululemon", domain: "lululemon.com", categories: ["Fitness", "Fashion", "Wellness"] },
  { name: "Peloton", domain: "onepeloton.com", categories: ["Fitness", "Technology", "Wellness"] },
  { name: "Planet Fitness", domain: "planetfitness.com", categories: ["Fitness", "Wellness"] },
  { name: "Equinox", domain: "equinox.com", categories: ["Fitness", "Luxury", "Wellness"] },
  { name: "24 Hour Fitness", domain: "24hourfitness.com", categories: ["Fitness", "Wellness"] },
  { name: "LA Fitness", domain: "lafitness.com", categories: ["Fitness", "Wellness"] },
  { name: "CrossFit", domain: "crossfit.com", categories: ["Fitness", "Sports", "Wellness"] },
  { name: "Gold's Gym", domain: "goldsgym.com", categories: ["Fitness", "Wellness"] },

  // Beauty & Personal Care
  { name: "Sephora", domain: "sephora.com", categories: ["Beauty", "Retail", "Luxury"] },
  { name: "Ulta Beauty", domain: "ulta.com", categories: ["Beauty", "Retail"] },
  { name: "MAC Cosmetics", domain: "maccosmetics.com", categories: ["Beauty", "Makeup", "Luxury"] },
  { name: "L'Oréal", domain: "loreal.com", categories: ["Beauty", "Personal Care", "CPG"] },
  { name: "Estée Lauder", domain: "esteelauder.com", categories: ["Beauty", "Luxury", "Skincare"] },
  { name: "Clinique", domain: "clinique.com", categories: ["Beauty", "Skincare", "Luxury"] },
  { name: "Neutrogena", domain: "neutrogena.com", categories: ["Beauty", "Skincare", "CPG"] },
  { name: "Dove", domain: "dove.com", categories: ["Beauty", "Personal Care", "CPG"] },
  { name: "Aveeno", domain: "aveeno.com", categories: ["Beauty", "Skincare", "CPG"] },
  { name: "Clean & Clear", domain: "cleanandclear.com", categories: ["Beauty", "Skincare", "CPG"] },

  // Gaming & Entertainment
  { name: "Nintendo", domain: "nintendo.com", categories: ["Gaming", "Entertainment", "Technology"] },
  { name: "PlayStation", domain: "playstation.com", categories: ["Gaming", "Entertainment", "Technology"] },
  { name: "Xbox", domain: "xbox.com", categories: ["Gaming", "Entertainment", "Technology"] },
  { name: "Epic Games", domain: "epicgames.com", categories: ["Gaming", "Technology", "Entertainment"] },
  { name: "Riot Games", domain: "riotgames.com", categories: ["Gaming", "Technology", "Entertainment"] },
  { name: "Blizzard Entertainment", domain: "blizzard.com", categories: ["Gaming", "Entertainment"] },
  { name: "Electronic Arts", domain: "ea.com", categories: ["Gaming", "Entertainment"] },
  { name: "Ubisoft", domain: "ubisoft.com", categories: ["Gaming", "Entertainment"] },
  { name: "Activision", domain: "activision.com", categories: ["Gaming", "Entertainment"] },
  { name: "Valve", domain: "valvesoftware.com", categories: ["Gaming", "Technology", "Entertainment"] },

  // Technology
  { name: "Apple", domain: "apple.com", categories: ["Technology", "Consumer Electronics", "Luxury"] },
  { name: "Google", domain: "google.com", categories: ["Technology", "Software", "Internet"] },
  { name: "Microsoft", domain: "microsoft.com", categories: ["Technology", "Software", "Enterprise"] },
  { name: "Amazon", domain: "amazon.com", categories: ["Technology", "E-commerce", "Internet"] },
  { name: "Meta", domain: "meta.com", categories: ["Technology", "Social Media", "Internet"] },
  { name: "Netflix", domain: "netflix.com", categories: ["Technology", "Entertainment", "Streaming"] },
  { name: "Spotify", domain: "spotify.com", categories: ["Technology", "Entertainment", "Music"] },
  { name: "Uber", domain: "uber.com", categories: ["Technology", "Transportation", "Mobility"] },
  { name: "Airbnb", domain: "airbnb.com", categories: ["Technology", "Travel", "Hospitality"] },
  { name: "Tesla", domain: "tesla.com", categories: ["Technology", "Automotive", "Clean Energy"] },

  // Fashion & Apparel
  { name: "Zara", domain: "zara.com", categories: ["Fashion", "Retail", "Apparel"] },
  { name: "H&M", domain: "hm.com", categories: ["Fashion", "Retail", "Apparel"] },
  { name: "Uniqlo", domain: "uniqlo.com", categories: ["Fashion", "Retail", "Apparel"] },
  { name: "Gap", domain: "gap.com", categories: ["Fashion", "Retail", "Apparel"] },
  { name: "Old Navy", domain: "oldnavy.com", categories: ["Fashion", "Retail", "Apparel"] },
  { name: "Banana Republic", domain: "bananarepublic.com", categories: ["Fashion", "Retail", "Apparel"] },
  { name: "Forever 21", domain: "forever21.com", categories: ["Fashion", "Retail", "Apparel"] },
  { name: "Urban Outfitters", domain: "urbanoutfitters.com", categories: ["Fashion", "Retail", "Lifestyle"] },
  { name: "Anthropologie", domain: "anthropologie.com", categories: ["Fashion", "Retail", "Lifestyle"] },
  { name: "Free People", domain: "freepeople.com", categories: ["Fashion", "Retail", "Lifestyle"] },

  // Food & Beverage
  { name: "Starbucks", domain: "starbucks.com", categories: ["Food & Drink", "Coffee", "Retail"] },
  { name: "McDonald's", domain: "mcdonalds.com", categories: ["Food & Drink", "Fast Food", "Retail"] },
  { name: "Subway", domain: "subway.com", categories: ["Food & Drink", "Fast Food", "Retail"] },
  { name: "Domino's", domain: "dominos.com", categories: ["Food & Drink", "Fast Food", "Pizza"] },
  { name: "Pizza Hut", domain: "pizzahut.com", categories: ["Food & Drink", "Fast Food", "Pizza"] },
  { name: "KFC", domain: "kfc.com", categories: ["Food & Drink", "Fast Food", "Chicken"] },
  { name: "Taco Bell", domain: "tacobell.com", categories: ["Food & Drink", "Fast Food", "Mexican"] },
  { name: "Burger King", domain: "burgerking.com", categories: ["Food & Drink", "Fast Food", "Burgers"] },
  { name: "Wendy's", domain: "wendys.com", categories: ["Food & Drink", "Fast Food", "Burgers"] },
  { name: "Chipotle", domain: "chipotle.com", categories: ["Food & Drink", "Fast Casual", "Mexican"] },

  // Finance & Banking
  { name: "Chase", domain: "chase.com", categories: ["Finance", "Banking", "Financial Services"] },
  { name: "Bank of America", domain: "bankofamerica.com", categories: ["Finance", "Banking", "Financial Services"] },
  { name: "Wells Fargo", domain: "wellsfargo.com", categories: ["Finance", "Banking", "Financial Services"] },
  { name: "Citibank", domain: "citibank.com", categories: ["Finance", "Banking", "Financial Services"] },
  { name: "American Express", domain: "americanexpress.com", categories: ["Finance", "Credit Cards", "Financial Services"] },
  { name: "Visa", domain: "visa.com", categories: ["Finance", "Payment Processing", "Financial Services"] },
  { name: "Mastercard", domain: "mastercard.com", categories: ["Finance", "Payment Processing", "Financial Services"] },
  { name: "PayPal", domain: "paypal.com", categories: ["Finance", "Payment Processing", "Financial Services"] },
  { name: "Square", domain: "square.com", categories: ["Finance", "Payment Processing", "Technology"] },
  { name: "Robinhood", domain: "robinhood.com", categories: ["Finance", "Investment", "Technology"] },

  // Travel & Hospitality
  { name: "Marriott", domain: "marriott.com", categories: ["Travel", "Hospitality", "Hotels"] },
  { name: "Hilton", domain: "hilton.com", categories: ["Travel", "Hospitality", "Hotels"] },
  { name: "Hyatt", domain: "hyatt.com", categories: ["Travel", "Hospitality", "Hotels"] },
  { name: "Expedia", domain: "expedia.com", categories: ["Travel", "Online Travel", "Technology"] },
  { name: "Booking.com", domain: "booking.com", categories: ["Travel", "Online Travel", "Technology"] },
  { name: "TripAdvisor", domain: "tripadvisor.com", categories: ["Travel", "Reviews", "Technology"] },
  { name: "Delta Airlines", domain: "delta.com", categories: ["Travel", "Airlines", "Transportation"] },
  { name: "American Airlines", domain: "aa.com", categories: ["Travel", "Airlines", "Transportation"] },
  { name: "United Airlines", domain: "united.com", categories: ["Travel", "Airlines", "Transportation"] },
  { name: "Southwest Airlines", domain: "southwest.com", categories: ["Travel", "Airlines", "Transportation"] },

  // Home & Lifestyle
  { name: "IKEA", domain: "ikea.com", categories: ["Home", "Furniture", "Retail"] },
  { name: "Home Depot", domain: "homedepot.com", categories: ["Home", "Hardware", "Retail"] },
  { name: "Lowe's", domain: "lowes.com", categories: ["Home", "Hardware", "Retail"] },
  { name: "Target", domain: "target.com", categories: ["Home", "Retail", "General Merchandise"] },
  { name: "Walmart", domain: "walmart.com", categories: ["Home", "Retail", "General Merchandise"] },
  { name: "Costco", domain: "costco.com", categories: ["Home", "Retail", "Wholesale"] },
  { name: "Bed Bath & Beyond", domain: "bedbathandbeyond.com", categories: ["Home", "Retail", "Household"] },
  { name: "Williams-Sonoma", domain: "williams-sonoma.com", categories: ["Home", "Retail", "Kitchen"] },
  { name: "Pottery Barn", domain: "potterybarn.com", categories: ["Home", "Retail", "Furniture"] },
  { name: "West Elm", domain: "westelm.com", categories: ["Home", "Retail", "Furniture"] },

  // Education & Learning
  { name: "Coursera", domain: "coursera.org", categories: ["Education", "Online Learning", "Technology"] },
  { name: "Udemy", domain: "udemy.com", categories: ["Education", "Online Learning", "Technology"] },
  { name: "edX", domain: "edx.org", categories: ["Education", "Online Learning", "Technology"] },
  { name: "Khan Academy", domain: "khanacademy.org", categories: ["Education", "Online Learning", "Non-profit"] },
  { name: "Duolingo", domain: "duolingo.com", categories: ["Education", "Language Learning", "Technology"] },
  { name: "Rosetta Stone", domain: "rosettastone.com", categories: ["Education", "Language Learning", "Technology"] },
  { name: "MasterClass", domain: "masterclass.com", categories: ["Education", "Online Learning", "Entertainment"] },
  { name: "Skillshare", domain: "skillshare.com", categories: ["Education", "Online Learning", "Creative"] },
  { name: "LinkedIn Learning", domain: "linkedin.com/learning", categories: ["Education", "Online Learning", "Professional"] },
  { name: "Pluralsight", domain: "pluralsight.com", categories: ["Education", "Online Learning", "Technology"] }
];

// Regional variants to expand the list
const regionalVariants = [
  { suffix: " (EU)", domainPrefix: "eu." },
  { suffix: " (UK)", domainPrefix: "uk." },
  { suffix: " (CA)", domainPrefix: "ca." },
  { suffix: " (AU)", domainPrefix: "au." },
  { suffix: " (DE)", domainPrefix: "de." },
  { suffix: " (FR)", domainPrefix: "fr." },
  { suffix: " (JP)", domainPrefix: "jp." },
  { suffix: " (KR)", domainPrefix: "kr." },
  { suffix: " (IN)", domainPrefix: "in." },
  { suffix: " (BR)", domainPrefix: "br." }
];

// Generate regional variants for base brands
const generateRegionalVariants = (brands: SeedBrand[]): SeedBrand[] => {
  const variants: SeedBrand[] = [];
  
  brands.forEach(brand => {
    regionalVariants.forEach(variant => {
      variants.push({
        name: brand.name + variant.suffix,
        domain: variant.domainPrefix + brand.domain,
        categories: [...brand.categories]
      });
    });
  });
  
  return variants;
};

// Combine base brands with regional variants (disabled for now due to invalid domains)
export const seedBrands: SeedBrand[] = [
  ...baseBrands
  // ...generateRegionalVariants(baseBrands) // Disabled - creates invalid domains
];

// Additional specialized brands for variety
const additionalBrands: SeedBrand[] = [
  // D2C & E-commerce
  { name: "Warby Parker", domain: "warbyparker.com", categories: ["Fashion", "D2C", "Eyewear"] },
  { name: "Casper", domain: "casper.com", categories: ["Home", "D2C", "Mattresses"] },
  { name: "Allbirds", domain: "allbirds.com", categories: ["Fashion", "D2C", "Footwear"] },
  { name: "Glossier", domain: "glossier.com", categories: ["Beauty", "D2C", "Skincare"] },
  { name: "Outdoor Voices", domain: "outdoorvoices.com", categories: ["Fitness", "D2C", "Activewear"] },
  { name: "Everlane", domain: "everlane.com", categories: ["Fashion", "D2C", "Apparel"] },
  { name: "Away", domain: "awaytravel.com", categories: ["Travel", "D2C", "Luggage"] },
  { name: "Bonobos", domain: "bonobos.com", categories: ["Fashion", "D2C", "Apparel"] },
  { name: "Harry's", domain: "harrys.com", categories: ["Beauty", "D2C", "Grooming"] },
  { name: "Quip", domain: "getquip.com", categories: ["Beauty", "D2C", "Oral Care"] },

  // Health & Wellness
  { name: "Headspace", domain: "headspace.com", categories: ["Wellness", "Mental Health", "Technology"] },
  { name: "Calm", domain: "calm.com", categories: ["Wellness", "Mental Health", "Technology"] },
  { name: "Noom", domain: "noom.com", categories: ["Wellness", "Weight Loss", "Technology"] },
  { name: "MyFitnessPal", domain: "myfitnesspal.com", categories: ["Wellness", "Fitness", "Technology"] },
  { name: "Fitbit", domain: "fitbit.com", categories: ["Wellness", "Fitness", "Technology"] },
  { name: "Whoop", domain: "whoop.com", categories: ["Wellness", "Fitness", "Technology"] },
  { name: "Oura", domain: "ouraring.com", categories: ["Wellness", "Fitness", "Technology"] },
  { name: "Eight Sleep", domain: "eightsleep.com", categories: ["Wellness", "Sleep", "Technology"] },
  { name: "Hims", domain: "forhims.com", categories: ["Wellness", "Healthcare", "D2C"] },
  { name: "Hers", domain: "forhers.com", categories: ["Wellness", "Healthcare", "D2C"] },

  // Automotive & Mobility
  { name: "Ford", domain: "ford.com", categories: ["Automotive", "Transportation", "Manufacturing"] },
  { name: "General Motors", domain: "gm.com", categories: ["Automotive", "Transportation", "Manufacturing"] },
  { name: "Toyota", domain: "toyota.com", categories: ["Automotive", "Transportation", "Manufacturing"] },
  { name: "Honda", domain: "honda.com", categories: ["Automotive", "Transportation", "Manufacturing"] },
  { name: "BMW", domain: "bmw.com", categories: ["Automotive", "Luxury", "Transportation"] },
  { name: "Mercedes-Benz", domain: "mercedes-benz.com", categories: ["Automotive", "Luxury", "Transportation"] },
  { name: "Audi", domain: "audi.com", categories: ["Automotive", "Luxury", "Transportation"] },
  { name: "Volkswagen", domain: "vw.com", categories: ["Automotive", "Transportation", "Manufacturing"] },
  { name: "Hyundai", domain: "hyundai.com", categories: ["Automotive", "Transportation", "Manufacturing"] },
  { name: "Kia", domain: "kia.com", categories: ["Automotive", "Transportation", "Manufacturing"] }
];

// Final combined list
export const allSeedBrands: SeedBrand[] = [
  ...seedBrands,
  ...additionalBrands
];
