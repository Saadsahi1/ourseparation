# Team Setup Guide

This guide will help your team get the project running locally and understand the codebase.

## Quick Start for New Team Members

### Prerequisites

1. **Node.js** - Version 18 or higher
2. **npm** - Comes with Node.js
3. **Supabase Account** - For database access
4. **Stripe Account** - For payment processing (optional for development)

### Initial Setup

1. **Clone the repository** (or receive the project files)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**

   Create a `.env` file in the root directory with the following:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

   **Get these values from:**
   - Supabase: Project Settings → API
   - Stripe: Developers → API keys

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**

   Open http://localhost:5173 in your browser

## Project Structure

```
project/
├── src/
│   ├── components/          # React components
│   │   ├── Agreement/       # Agreement editor components
│   │   ├── Homepage/        # Landing page components
│   │   └── ui/             # Reusable UI components
│   ├── engines/            # Calculation engines (SSAG, tax, benefits)
│   ├── lib/                # Utility functions and helpers
│   ├── pages/              # Page components (routes)
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── supabase/
│   ├── migrations/         # Database migrations
│   └── functions/          # Edge functions (webhooks, etc.)
└── public/                 # Static assets
```

## Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Supabase** - Database and authentication
- **Stripe** - Payment processing
- **React Router** - Client-side routing

## Development Workflow

### Running Tests
```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Run tests with UI
```

### Building for Production
```bash
npm run build         # Creates dist/ folder
npm run preview       # Preview production build
```

### Type Checking
```bash
npm run typecheck     # Check TypeScript types
```

### Linting
```bash
npm run lint          # Check code quality
```

## Database Access

### Local Development

The project uses Supabase for the database. Team members need:

1. Access to the Supabase project
2. API keys (URL and anon key)
3. Understanding of Row Level Security (RLS) policies

### Database Schema

See `supabase/migrations/` for the complete schema. Key tables:
- `profiles` - User profiles
- `agreements` - Separation agreements
- `agreement_entitlements` - User permissions for agreement types
- `stripe_orders` - Payment records
- `children`, `property_items`, etc. - Agreement components

### Running Migrations

Migrations are automatically applied in the hosted Supabase instance. For local development, use the Supabase CLI or apply through the dashboard.

## Authentication

The app uses Supabase Auth with email/password authentication:

- Sign up creates a profile automatically
- RLS policies ensure users only see their own data
- Admin users have elevated permissions (see `is_admin` field)

## Payment Integration

### Stripe Setup

1. **Products** are defined in `src/stripe-config.ts`
2. **Webhook** endpoint: `supabase/functions/stripe-webhook/`
3. **Checkout** flow: User → Pricing page → Stripe → Success page
4. **Entitlements** granted automatically via webhook

### Testing Payments

Use Stripe test mode with test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Key Features to Understand

### 1. Agreement Types
- Separation Agreement
- Cohabitation Agreement
- Prenuptial Agreement
- Postnuptial Agreement
- Amendment Agreement

### 2. Entitlements System
Users must purchase each agreement type separately. See `AGREEMENT_ENTITLEMENTS.md` for details.

### 3. SSAG Calculations
Spousal Support Advisory Guidelines calculations are in `src/engines/`:
- Tax calculations
- Benefit calculations (CCB, GST/HST, etc.)
- Child support table lookups

### 4. PDF Export
Agreements can be exported as PDFs with schedules and calculations.

## Common Tasks

### Adding a New Agreement Section
1. Create component in `src/components/Agreement/`
2. Add database table in new migration
3. Update `AgreementEditor.tsx` to include section
4. Add validation in `src/lib/agreementValidation.ts`

### Adding a New Product
1. Create product in Stripe dashboard
2. Add metadata: `agreement_type = separation|cohabitation|etc`
3. Update `src/stripe-config.ts`
4. Update pricing page content

### Debugging Calculations
Test files are in `src/tests/`. Run specific tests:
```bash
npm test -- ssag                    # Run SSAG tests
npm test -- tax                     # Run tax tests
npm test -- benefits                # Run benefits tests
```

## Troubleshooting

### "Module not found" errors
```bash
npm install
```

### Database connection errors
- Check `.env` file has correct Supabase credentials
- Verify network access to Supabase project
- Check RLS policies aren't blocking access

### Build errors
```bash
npm run typecheck                   # Check for type errors
npm run lint                        # Check for code issues
```

### Stripe webhook not receiving events
- Ensure webhook URL is configured in Stripe dashboard
- Check `STRIPE_WEBHOOK_SECRET` environment variable
- Review Stripe webhook logs in dashboard

## Getting Help

### Documentation
- `README.md` - Project overview
- `AGREEMENT_ENTITLEMENTS.md` - Entitlements system
- `README_SSAG.md` - SSAG calculation details
- Migration files - Database schema documentation

### Code Comments
Key calculations and complex logic have inline comments.

### Team Communication
- Questions about calculations → Check test files for examples
- Questions about UI → Check component files
- Questions about database → Check migration files

## Security Notes

- Never commit `.env` file
- Never commit API keys or secrets
- Use environment variables for all sensitive data
- Service role key should only be used in edge functions
- Test with Stripe test mode before production

## Deployment

### Frontend
Built with Vite, can deploy to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting service

Build command: `npm run build`
Output directory: `dist/`

### Edge Functions
Deployed to Supabase automatically when pushed.

### Database
Hosted on Supabase. Migrations applied through Supabase dashboard or CLI.

## Next Steps for New Team Members

1. ✅ Get local environment running
2. ✅ Create test account and explore UI
3. ✅ Review database schema in Supabase dashboard
4. ✅ Run test suite to understand calculations
5. ✅ Read through one agreement component to understand patterns
6. ✅ Make a small change and see it work
7. ✅ Review open issues/tasks with team lead

## Questions?

If you're stuck:
1. Check this documentation
2. Review the specific file's comments
3. Run relevant tests to see expected behavior
4. Ask team lead for clarification

Welcome to the team!
