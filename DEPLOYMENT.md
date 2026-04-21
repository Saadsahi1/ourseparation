# Deployment Guide

This guide covers deploying the application to production.

## Overview

The application consists of:
1. **Frontend** - React/Vite application (static files)
2. **Database** - Supabase PostgreSQL
3. **Edge Functions** - Supabase serverless functions
4. **Authentication** - Supabase Auth
5. **Storage** - Supabase Storage (for document uploads)

## Prerequisites

- Supabase project (production)
- Stripe account (live mode)
- Hosting platform account (Vercel, Netlify, etc.)

## Step 1: Supabase Setup

### Create Production Project

1. Go to https://supabase.com/dashboard
2. Create new project (choose production tier)
3. Note the project URL and keys

### Apply Migrations

Migrations are in `supabase/migrations/`. Apply them in order:

**Option A: Via Dashboard**
1. Go to Database → SQL Editor
2. Run each migration file in chronological order

**Option B: Via CLI**
```bash
supabase link --project-ref your-project-ref
supabase db push
```

### Configure Authentication

1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates (optional)
4. Set site URL to your production domain

### Configure Storage

1. Go to Storage → Buckets
2. Bucket `income-documents` should exist from migration
3. Set up RLS policies (already in migrations)

### Deploy Edge Functions

```bash
# Install Supabase CLI if not already
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy stripe-checkout
supabase functions deploy stripe-webhook
```

### Set Edge Function Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

## Step 2: Stripe Setup

### Create Products

1. Go to Stripe Dashboard → Products
2. Create product: "Separation Agreement"
   - Price: $250.00 CAD
   - One-time payment
   - Add metadata: `agreement_type = separation`
3. Note the product ID and price ID

### Configure Webhook

1. Go to Developers → Webhooks
2. Add endpoint: `https://[your-project].supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Note the webhook signing secret

### Update Product Configuration

Update `src/stripe-config.ts` with production price IDs:

```typescript
export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_XXXXX',
    priceId: 'price_XXXXX',
    name: 'Our Separation Agreement',
    description: 'Ontario Separation Agreement',
    price: 250.00,
    currency: 'CAD',
    mode: 'payment',
    agreementType: 'separation'
  }
];
```

## Step 3: Environment Variables

### Production Environment Variables

Create these in your hosting platform:

```env
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Important:**
- Use production Supabase keys
- Use Stripe live (not test) keys
- Never commit these to Git

## Step 4: Frontend Deployment

### Option A: Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard
4. Connect to Git repository for automatic deployments

### Option B: Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

3. Build command: `npm run build`
4. Publish directory: `dist`

### Option C: Cloudflare Pages

1. Go to Cloudflare Pages dashboard
2. Connect Git repository
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Set environment variables

### Option D: Custom Server

Build locally and deploy:
```bash
npm run build
```

Upload `dist/` folder contents to your web server.

## Step 5: Post-Deployment Checks

### Test Authentication
1. Sign up with test email
2. Verify email functionality
3. Test login/logout
4. Check profile creation

### Test Database Access
1. Create test agreement
2. Verify data saves correctly
3. Check RLS policies working
4. Test as different users

### Test Payments
1. Use Stripe test cards in test mode first
2. Switch to live mode
3. Complete test purchase with real card
4. Verify webhook receives event
5. Check entitlement granted
6. Verify user can create agreement

### Test Agreement Creation
1. Verify only purchased types accessible
2. Test each section of agreement editor
3. Verify PDF export works
4. Test document uploads

## Step 6: Configure Domain

### Custom Domain Setup

1. Add CNAME record: `www.yourdomain.com → your-deployment-url`
2. Add A record: `yourdomain.com → deployment-ip`
3. Update Supabase Auth site URL
4. Update Stripe redirect URLs

### SSL Certificate

Most hosting platforms handle this automatically. If not:
- Use Let's Encrypt
- Configure through hosting provider

## Monitoring

### Application Monitoring

Set up monitoring for:
- Uptime
- Error rates
- Performance metrics

Recommended tools:
- Sentry (error tracking)
- LogRocket (session replay)
- Vercel Analytics (if using Vercel)

### Database Monitoring

Supabase Dashboard provides:
- Query performance
- Connection stats
- Storage usage

### Payment Monitoring

Stripe Dashboard shows:
- Payment success rates
- Failed payments
- Webhook delivery status

## Maintenance

### Regular Tasks

**Weekly:**
- Check webhook delivery logs
- Review error logs
- Check payment success rates

**Monthly:**
- Update dependencies: `npm update`
- Review database performance
- Check storage usage
- Review Stripe reconciliation

**Quarterly:**
- Security audit
- Update calculation tables (if tax rates change)
- Review RLS policies

### Backup Strategy

**Supabase:**
- Daily automatic backups (Pro plan)
- Point-in-time recovery (Pro plan)
- Manual backups before major changes

**Stripe:**
- Data available through API
- Export reports monthly

## Rollback Procedure

If deployment fails:

1. **Frontend:** Revert to previous deployment in hosting dashboard
2. **Database:** Use Supabase point-in-time recovery
3. **Edge Functions:** Redeploy previous version
4. **Payments:** No rollback needed (Stripe is external)

## Security Checklist

- ✅ All API keys are environment variables
- ✅ No secrets in Git repository
- ✅ RLS policies enabled on all tables
- ✅ Stripe webhook signature verification enabled
- ✅ HTTPS enforced everywhere
- ✅ Email verification (optional, based on requirements)
- ✅ Rate limiting on auth endpoints
- ✅ CORS properly configured

## Performance Optimization

### Frontend
- Use CDN for static assets
- Enable compression
- Optimize images
- Lazy load routes

### Database
- Indexes on frequently queried columns (already in migrations)
- Connection pooling (Supabase handles this)
- Optimize heavy queries

### Edge Functions
- Minimize cold starts
- Cache frequently accessed data
- Keep functions small and focused

## Troubleshooting

### Users Can't Sign Up
- Check Supabase Auth is enabled
- Verify email templates configured
- Check rate limits not exceeded

### Payments Failing
- Verify Stripe keys are live keys
- Check webhook URL is correct
- Review Stripe webhook logs
- Ensure HTTPS on webhook endpoint

### Agreement Creation Fails
- Check entitlements granted after payment
- Verify RLS policies allow creation
- Check user has correct permissions
- Review database logs

### PDF Export Not Working
- Check jsPDF library loaded
- Verify browser compatibility
- Check for console errors
- Test in different browsers

## Support Contacts

- **Supabase Support:** support@supabase.com
- **Stripe Support:** https://support.stripe.com
- **Hosting Support:** (depends on provider)

## Scaling Considerations

As your application grows:

**Database:**
- Upgrade Supabase plan for more connections
- Add read replicas if needed
- Optimize expensive queries

**Frontend:**
- Use CDN for assets
- Implement code splitting
- Add caching headers

**Edge Functions:**
- Monitor execution time
- Optimize cold starts
- Consider dedicated compute if needed

## Compliance

Ensure compliance with:
- **Privacy:** PIPEDA (Canada)
- **Payment:** PCI DSS (handled by Stripe)
- **Data Residency:** Choose appropriate Supabase region
- **Terms of Service:** Update for your business

## Cost Estimates

**Supabase Pro:** ~$25 USD/month
- Database
- Auth
- Storage
- Edge Functions

**Stripe:** 2.9% + $0.30 per transaction

**Hosting:**
- Vercel: Free tier or $20/month
- Netlify: Free tier or $19/month
- Custom: Varies

Total: ~$45-75/month + transaction fees

---

**Deployment Complete!**

Your application is now live and ready to serve users. Monitor closely for the first few days and be ready to address any issues quickly.
