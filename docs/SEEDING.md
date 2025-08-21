# BrandDeals MVP Seeding Guide

This guide explains how to seed your BrandDeals MVP with demo data for end-to-end testing and demonstration.

## Quick Start

1. **Run database migration** (if not already done):
   ```bash
   pnpm prisma migrate dev -n init_mvp
   ```

2. **Seed the database**:
   ```bash
   pnpm db:seed
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   ```

## What Gets Created

### 🏢 Demo Workspace
- **Name**: Demo Workspace
- **Slug**: `demo-workspace`
- **Description**: A complete workspace for testing all features

### 👤 Demo User
- **Email**: `demo@branddeals.test`
- **Name**: Demo Creator
- **Role**: Workspace owner with full access

### 💳 Subscription & Credits
- **Plan**: STARTER
- **Status**: ACTIVE
- **Initial Credits**:
  - AUDIT: 200 credits
  - MEDIA_PACK: 50 credits
  - OUTREACH: 100 credits

### 🏪 Brands (~250+)
- **Categories**: Fitness, Beauty, Gaming, Tech, Fashion, Food & Drink, Finance, Travel, Home, Education, Entertainment, Wellness
- **Features**:
  - Each brand has a Clearbit logo URL
  - Categorized by industry
  - Includes regional variants (EU, UK, CA, AU, etc.)
  - D2C and traditional retail brands
  - **Brand Colors**: Automatically detected from homepage meta tags and favicons

### 📧 Email Templates
- **intro_v1**: Introduction email with media pack
- **proof_v1**: Follow-up with proof points
- **nudge_v1**: Final reminder with format options

**Template Variables**:
- `brandName`, `contactFirstName`, `creatorName`
- `creatorUSP`, `topStat`, `insightOne`, `insightTwo`
- `calendlyUrl`, `mediaPackUrl`, `pdfUrl`

### 📄 Media Pack Templates
- **Default Template**: Clean, responsive design
- **Brand Template**: Brand-themed with logo and colors
- **PDF Export**: Puppeteer-based HTML to PDF conversion

### 🎨 Brand Colors
- **Automatic Detection**: During seeding, the script attempts to auto-detect brand colors from:
  - `theme-color` meta tags
  - `msapplication-TileColor` meta tags
  - Favicon dominant colors using color quantization
  - Fallback color generation based on detected primary colors
- **Storage**: Colors are stored in `BrandProfile.brandPrimaryColor` and `BrandProfile.brandSecondaryColor`
- **Usage**: Applied to media pack templates when available, with neutral fallbacks if not set
- **Manual Override**: You can manually edit colors in Prisma Studio if needed

### 🤝 Sample Deals
- **3 deals** across different stages:
  - PENDING: Initial outreach
  - ACTIVE: Negotiation in progress
  - COMPLETED: Successful partnership

## File Structure

```
prisma/
├── seed.ts                    # Main seeding script
├── seed-data/
│   ├── brands.ts             # Brand definitions
│   └── templates.ts          # Email template definitions
└── schema.prisma             # Database schema

src/services/
├── templates.ts              # Template registry service
└── media/
    ├── templates/            # HTML templates
    │   ├── mediaPackDefault.html
    │   └── mediaPackBrand.html
    └── pdf.ts               # PDF export service
```

## Customization

### Adding More Brands
Edit `prisma/seed-data/brands.ts`:
```typescript
const additionalBrands: SeedBrand[] = [
  { name: "Your Brand", domain: "yourbrand.com", categories: ["Your Category"] }
];
```

### Modifying Email Templates
Edit `prisma/seed-data/templates.ts`:
```typescript
{
  key: "custom_template",
  name: "Custom Template",
  subject: "Your subject with {{variable}}",
  body: "Your HTML body...",
  variables: ["variable"]
}
```

### Updating Media Pack Design
Modify the HTML templates in `src/services/media/templates/`:
- `mediaPackDefault.html`: Base template
- `mediaPackBrand.html`: Brand-themed variant

## Troubleshooting

### Common Issues

1. **"Environment variable not found: DATABASE_URL"**
   - Ensure `.env.local` is properly configured
   - Check that `DATABASE_URL` points to your Neon database

2. **"Prisma schema validation error"**
   - Run `pnpm prisma generate` to update the client
   - Ensure schema changes are migrated

3. **"Failed to seed brand/template"**
   - Check database connection
   - Verify schema matches seed data structure

### Reset Database
If you need to start fresh:
```bash
pnpm db:reset
pnpm db:seed
```

## Development Notes

- **Idempotent**: Running `pnpm db:seed` multiple times is safe
- **Upsert Logic**: Existing records are updated, new ones are created
- **Error Handling**: Individual failures don't stop the entire process
- **Performance**: ~250 brands are seeded efficiently with batch operations

## Next Steps

After seeding:
1. Explore the demo workspace at `http://localhost:3000`
2. Test email template rendering with different variables
3. Generate media packs for various brands
4. Export PDFs to test the conversion pipeline
5. Customize templates and add your own brands

## Support

For issues with seeding:
1. Check the console output for specific error messages
2. Verify your database connection and schema
3. Ensure all dependencies are installed (`pnpm install`)
4. Check that Prisma client is generated (`pnpm prisma generate`)
