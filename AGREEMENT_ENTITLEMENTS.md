# Agreement Entitlements System

## Overview

The application now has a comprehensive entitlements system that restricts users to only create agreements they've purchased. Users who purchase a Separation Agreement cannot create Cohabitation Agreements or other types without purchasing them separately.

## How It Works

### 1. Database Schema

**New Table: `agreement_entitlements`**
- Stores which agreement types each user has access to
- Each record represents a single entitlement (e.g., "User X can create Separation Agreements")
- Fields:
  - `user_id`: References the user
  - `agreement_type`: Type of agreement (separation, cohabitation, prenuptial, postnuptial, amendment)
  - `granted_at`: When access was granted
  - `order_id`: The Stripe order that granted this access
  - `expires_at`: NULL for lifetime access (one-time purchases)

**Modified Table: `stripe_orders`**
- Added `agreement_type` column to track which agreement type was purchased
- Added `product_metadata` jsonb column to store additional product information

### 2. Purchase Flow

When a user purchases an agreement:

1. User clicks "Get Started" on pricing page
2. Redirects to Stripe checkout
3. User completes payment
4. Stripe webhook receives `checkout.session.completed` event
5. Webhook handler:
   - Retrieves full session details including product information
   - Extracts agreement type from product metadata (defaults to 'separation')
   - Creates order record in `stripe_orders`
   - Looks up user from customer record
   - **Grants entitlement** by inserting into `agreement_entitlements` table
6. User can now create agreements of that type

### 3. Authorization Enforcement

**Database Level (Primary Security):**
- RLS policy on `agreements` table prevents creation without entitlement
- Uses helper function `user_has_agreement_access()` to check permissions
- Database will reject INSERT if user lacks entitlement

**Application Level (UI/UX):**
- `AgreementTypeSelector` component fetches user's entitlements on load
- Shows locked state for types not purchased
- Displays "Not Purchased" badge and "View Pricing" button
- Prevents selection of locked types

**Error Handling:**
- If database rejects creation (policy violation), user sees alert
- Alert explains they need to purchase the agreement type
- Redirects to pricing page

### 4. Product Configuration

**Stripe Product Setup:**
- Each Stripe product should have metadata with `agreement_type` field
- Current product: `prod_TZLDyhj0XxN5GQ` (Separation Agreement)
  - Price ID: `price_1ScCWf417TVuT8meXhB8sBfs`
  - Agreement Type: `separation`

**To add new agreement types:**
1. Create product in Stripe dashboard
2. Add metadata field: `agreement_type` = one of:
   - `separation`
   - `cohabitation`
   - `prenuptial`
   - `postnuptial`
   - `amendment`
3. Add product to `src/stripe-config.ts`
4. Update pricing page content JSON

### 5. Key Files Modified

**Database:**
- `supabase/migrations/[timestamp]_add_agreement_entitlements.sql`
  - Creates `agreement_entitlements` table
  - Adds RLS policies
  - Creates helper function
  - Updates `agreements` INSERT policy

**Backend:**
- `supabase/functions/stripe-webhook/index.ts`
  - Grants entitlements on successful payment
  - Extracts agreement type from product metadata

**Frontend:**
- `src/lib/entitlements.ts` - New file with entitlement helper functions
- `src/stripe-config.ts` - Added `agreementType` to product interface
- `src/components/Agreement/AgreementTypeSelector.tsx` - Shows locked/unlocked states
- `src/pages/Dashboard.tsx` - Error handling for unauthorized creation

### 6. Testing the System

**To test without real payment:**
1. Manually insert entitlement record:
```sql
INSERT INTO agreement_entitlements (user_id, agreement_type, granted_at)
VALUES ('[user-id]', 'separation', now());
```

2. User should now see Separation Agreement as available
3. Other types should show as locked with "View Pricing" button
4. Attempting to create locked type should fail at database level

**To test with real payment:**
1. Complete checkout flow for Separation Agreement
2. Webhook automatically grants entitlement
3. User can immediately create Separation Agreements
4. Other types remain locked

### 7. Security Notes

- **Primary security is at database level** - RLS policies cannot be bypassed from client
- Frontend checks are for UX only - users cannot circumvent via API
- Service role credentials used in webhook to grant entitlements
- Entitlements are per-user and per-type (one record = one type access)
- Unique constraint prevents duplicate entitlements: `(user_id, agreement_type)`

### 8. Future Enhancements

Potential improvements:
- Subscription-based access with expiration dates
- Bulk packages (e.g., "All Agreement Types Bundle")
- Trial periods or limited-time access
- Admin panel to manually grant/revoke entitlements
- Usage tracking per entitlement
- Refund handling (revoke entitlement)

## Summary

Users can only create agreements they've paid for. The system enforces this at both database and UI levels, ensuring users must purchase each agreement type separately. When they complete payment via Stripe, they're automatically granted lifetime access to that specific agreement type.
