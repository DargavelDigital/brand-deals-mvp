# Hyper by Hype & Swagger

The ultimate platform for creators to discover brand partnerships and grow their business.

## 🚀 Features

- **AI-Powered Brand Discovery**: Find perfect brand matches using advanced algorithms
- **Multi-Platform Social Media Audits**: Analyze performance across YouTube, TikTok, X, Facebook, LinkedIn, and Instagram
- **Automated Outreach**: Streamlined communication with potential brand partners
- **Media Pack Generation**: Professional presentation materials for brand negotiations
- **Workflow Automation**: End-to-end brand partnership management

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.0, React, TypeScript
- **Styling**: Tailwind CSS with custom OKLCH color system
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe integration
- **Email**: SendGrid for automated outreach
- **Social APIs**: YouTube, TikTok, X, Facebook, LinkedIn, Instagram

## 🎨 Design System

Hyper features a modern, light UI refresh pack with:
- Clean, professional aesthetic
- Consistent color tokens and spacing
- Responsive design across all devices
- Accessibility-first approach

## 🚦 Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hyper-by-hype-swagger
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Fill in your API keys and configuration
   ```

4. **Set up the database**
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

## 📱 Platform Support

- **YouTube**: Channel analytics and content insights
- **TikTok**: Account performance and audience data
- **X (Twitter)**: Profile analytics and engagement metrics
- **Facebook**: Page insights and audience demographics
- **LinkedIn**: Company analytics and professional insights
- **Instagram**: Profile performance and content analysis

## 🔧 Development

- **Type Checking**: `pnpm type-check`
- **Linting**: `pnpm lint`
- **Testing**: `pnpm test`
- **Build**: `pnpm build`

## 📄 License

This project is proprietary software developed by Hype & Swagger.

---

Built with ❤️ by the Hype & Swagger team
