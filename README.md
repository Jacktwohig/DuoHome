# DuoHome

The all-in-one home management app for couples. Manage finances, chores, meals, goals, calendar, habits, notes, and activities — together.

## Tech Stack

- **Monorepo**: Turborepo with npm workspaces
- **Web**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Mobile**: Expo SDK 52 with Expo Router v4, React Native
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Realtime)
- **Billing**: Stripe (subscriptions, webhooks)
- **AI**: Anthropic Claude API (meal suggestions)

## Project Structure

```
DuoHome/
├── apps/
│   ├── web/          # Next.js 15 web app
│   └── mobile/       # Expo 52 mobile app
├── packages/
│   └── types/        # Shared TypeScript types
├── supabase/
│   └── migrations/   # Database schema
├── turbo.json
└── package.json
```

## Prerequisites

- Node.js 20+
- npm 10+
- A [Supabase](https://supabase.com) account
- A [Stripe](https://stripe.com) account
- An [Anthropic](https://anthropic.com) API key (for AI meal suggestions)
- (For mobile) Expo CLI: `npm install -g expo-cli`

## Setup

### 1. Clone and Install

```bash
git clone <your-repo>
cd DuoHome
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the contents of `supabase/migrations/001_initial_schema.sql`
4. Enable **Email Auth** in Authentication > Providers
5. (Optional) Enable **Google OAuth** for social login
6. Get your project URL and API keys from **Settings > API**

### 3. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create two products:
   - **Monthly Plan**: $5/month recurring
   - **Yearly Plan**: $50/year recurring
3. Copy the Price IDs for each
4. Get your publishable and secret API keys
5. Set up a webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
6. Copy the webhook signing secret

### 4. Environment Variables

#### Web app (`apps/web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

ANTHROPIC_API_KEY=sk-ant-...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Mobile app (`apps/mobile/.env.local`)

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 5. Run Development Servers

```bash
# Run everything (web + mobile)
npm run dev

# Run only web
cd apps/web && npm run dev

# Run only mobile
cd apps/mobile && npx expo start
```

## Features

### Web App (localhost:3000)

| Module | Description |
|--------|-------------|
| Dashboard | Overview of all modules with quick stats |
| Finance | Budget tracking, transactions, account management |
| Calendar | Shared calendar with event management |
| Chores | Gamified chore tracking with points scoreboard |
| Goals | Shared financial and personal goals with milestones |
| Meals | Weekly meal planner with AI suggestions (Claude) |
| Habits | Daily habit tracking with streaks |
| Notes | Notes and secure document storage |
| Activities | Date nights, travel, events wishlist and planner |

### Mobile App

- Dashboard with key stats
- Finance overview and transactions
- Calendar agenda view
- Chores with completion tracking
- Meal planner and grocery list

### Billing

- 14-day free trial for all features
- Monthly plan: $5/month
- Yearly plan: $50/year (2 months free)
- Managed by Stripe Checkout and Customer Portal

## Architecture Notes

### Authentication Flow
1. User signs up → Supabase Auth creates user
2. Household is created automatically for primary user
3. Partner is invited via unique invite link/token
4. Partner clicks link → joins same household
5. Both users share all household data via RLS policies

### Row Level Security
All database tables use Supabase RLS. The `get_household_id()` function returns the authenticated user's household, ensuring users only see their own household's data.

### AI Meal Suggestions
The `/api/meals/suggest` endpoint calls Claude via the Anthropic SDK. It takes dietary preferences, restrictions, and existing meals as context and returns 6 structured meal suggestions.

### Real-time (Future)
The app is architected to support Supabase Realtime subscriptions for live partner presence and collaborative updates. Look for `// TODO: Replace with Supabase Realtime` comments.

## Deployment

### Web (Vercel)

```bash
cd apps/web
vercel deploy
```

Set all environment variables in the Vercel dashboard. Update `NEXT_PUBLIC_APP_URL` to your production URL.

### Mobile (EAS Build)

```bash
cd apps/mobile
npx eas build --platform all
```

## Development Notes

- Mock data is used throughout when Supabase isn't configured. Look for `// TODO: Replace with Supabase` comments.
- Each module page is self-contained and can be developed independently.
- The design system uses custom Tailwind colors defined in `tailwind.config.ts`.

## License

MIT
