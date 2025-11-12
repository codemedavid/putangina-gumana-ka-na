# Real-Time Sync Fix Guide

## Problem Fixed ✅

Changes made in the Admin Dashboard were not appearing on the main website until the page was manually refreshed. This happened because the admin dashboard and main website are separate components that didn't communicate with each other about database changes.

## Solution Implemented

I've added **real-time database subscriptions** using Supabase's real-time features. Now, whenever you make changes in the admin dashboard, those changes will automatically appear on the main website **instantly** without needing to refresh the page!

## Changes Made

### 1. Updated Hooks with Real-Time Subscriptions

The following hooks now listen for database changes in real-time:

- ✅ **useMenu.ts** - Listens for product and product variation changes
- ✅ **useCategories.ts** - Listens for category changes
- ✅ **usePaymentMethods.ts** - Listens for payment method changes
- ✅ **useSiteSettings.ts** - Listens for site settings changes

### 2. Created Database Migration

A new migration file was created to enable real-time replication on all necessary tables:
- `supabase/migrations/20250113000000_enable_realtime.sql`

## How to Apply the Migration

You need to run the migration to enable real-time on your Supabase database. Choose one of these methods:

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Enable real-time for these tables:
   - ✅ products
   - ✅ product_variations
   - ✅ categories
   - ✅ payment_methods
   - ✅ site_settings

### Option 2: Using SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Paste and run this SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE product_variations;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_methods;
ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;
```

### Option 3: Using Supabase CLI

If you have the Supabase CLI installed and linked to your project:

```bash
supabase db push
```

This will apply all pending migrations including the new real-time migration.

## How to Test

1. **Apply the migration** using one of the methods above
2. **Open two browser windows/tabs:**
   - Window 1: Your main website (e.g., `http://localhost:5173/`)
   - Window 2: Admin dashboard (e.g., `http://localhost:5173/admin`)

3. **Test Product Changes:**
   - In the admin dashboard, add, edit, or delete a product
   - Watch Window 1 - the changes should appear automatically!
   - Check the browser console - you should see logs like "Products changed, refetching..."

4. **Test Category Changes:**
   - In the admin dashboard, add or edit a category
   - The category menu should update automatically on the main site

5. **Test Payment Methods:**
   - Update payment methods in the admin dashboard
   - Changes should reflect immediately in the checkout page

## Technical Details

### How It Works

Each hook now subscribes to Postgres changes using Supabase's real-time API:

```typescript
const productsSubscription = supabase
  .channel('products_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'products' }, 
    () => {
      console.log('Products changed, refetching...');
      fetchProducts();
    }
  )
  .subscribe();
```

When any change (INSERT, UPDATE, DELETE) happens in the database:
1. Supabase detects the change
2. Sends a real-time notification to all subscribed clients
3. The hook automatically refetches the data
4. React re-renders the components with the new data

### Console Logs

You'll see these helpful logs in the browser console when changes are detected:
- "Products changed, refetching..."
- "Variations changed, refetching..."
- "Categories changed, refetching..."
- "Payment methods changed, refetching..."
- "Site settings changed, refetching..."

## Benefits

✨ **No more manual page refreshes!**
✨ **Instant updates across all devices**
✨ **Real-time collaboration** - Multiple admins can work simultaneously
✨ **Better user experience** - Customers always see the latest products and prices
✨ **Automatic sync** - Changes propagate instantly to all connected clients

## Troubleshooting

### If real-time updates aren't working:

1. **Check if migration was applied:**
   - Go to Supabase Dashboard → Database → Replication
   - Verify that the tables are enabled for replication

2. **Check browser console:**
   - Open Developer Tools (F12)
   - Look for the "changed, refetching..." messages
   - If you see errors, check your Supabase connection

3. **Verify Supabase credentials:**
   - Make sure your `.env` file has the correct:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **Check network connection:**
   - Real-time features require WebSocket connections
   - Ensure your firewall/network allows WebSocket connections

## Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify the migration was applied successfully
3. Test with a simple change (like editing a product name)
4. Make sure you're not blocking WebSocket connections

---

**That's it!** Your admin changes will now sync in real-time to your website! 🎉

