# Brenn Coffee — Storefront

A modern, premium e-commerce storefront for a specialty coffee roastery. Built with Next.js 14, Tailwind, Supabase, and Stripe. Phase 1 of 2 (admin dashboard coming next).

> **Slow burn. Bright finish.**

---

## What's in this build

**Pages**
- Homepage with cinematic hero, featured products, brewing methods, and brand story
- Shop listing with roast/origin filters and sorting
- Product detail pages with grind selector, size selector, subscription toggle, interactive flavor wheel, brewing recommendations, and origin story
- Cart drawer with free-shipping progress bar
- Checkout flow integrated with Stripe Checkout
- Order success page

**Tech**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS with the Brenn brand palette (charcoal + ember + bone)
- Framer Motion for animations
- Supabase for database (Postgres) + auth + RLS
- Stripe for payments + webhooks
- Zustand for cart state (with localStorage persistence)

---

## Setup — from zero to live in ~30 minutes

You'll need to create accounts on three services. All have generous free tiers.

### 1. Install Node.js (if you don't have it)

Download Node 20 or higher from [nodejs.org](https://nodejs.org). Verify it works:

```bash
node --version    # should show v20.x or higher
npm --version
```

### 2. Install dependencies

In this project folder, run:

```bash
npm install
```

This will take 1-2 minutes.

### 3. Set up Supabase (database + auth)

Supabase is free for hobby projects. Free tier includes 500MB database + 1GB file storage.

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click **"New Project"**
   - Project name: `brenn-coffee`
   - Database password: (pick a strong one and save it somewhere)
   - Region: pick the closest to you (e.g. `London`)
3. Wait ~2 min for the project to provision
4. Once ready, go to **SQL Editor** in the left sidebar
5. Click **"New query"**, paste in the contents of `supabase/schema.sql` from this project, click **Run**
   - You should see "Success" — this creates all your tables and seeds 3 starter products
6. Go to **Settings → API** and grab three values for your `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(keep this secret, never commit it)*

### 4. Set up Stripe (payments)

1. Go to [stripe.com](https://stripe.com) and create an account (UK business)
2. You'll start in **Test mode** (toggle top-right). Stay there until you're ready to take real payments.
3. Go to **Developers → API keys**:
   - `Publishable key` (starts with `pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` (starts with `sk_test_...`) → `STRIPE_SECRET_KEY`
4. **Don't worry about the webhook secret yet** — we'll set that up after deploying.

### 5. Configure environment variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Open `.env.local` and paste in the values you got from Supabase and Stripe. For local dev, leave `NEXT_PUBLIC_SITE_URL` as `http://localhost:3000`.

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the Brenn homepage with three products (Ember, Aurora, Solstice).

Click around. Add a coffee to cart. Hit checkout. Use Stripe's test card to complete a purchase:

```
Card number:  4242 4242 4242 4242
Expiry:       any future date (e.g. 12/30)
CVC:          any 3 digits
Postcode:     any UK postcode (e.g. SW1A 1AA)
```

That's it — you have a working coffee store.

---

## Deploying to production (Vercel)

Vercel is free for personal projects and built for Next.js — it deploys in seconds.

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a new repo at [github.com/new](https://github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/brenn-coffee.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"Add New → Project"** → import your `brenn-coffee` repo
3. Before clicking Deploy: expand **Environment Variables** and add all 6 from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → set this to your Vercel URL once you have it (e.g. `https://brenn-coffee.vercel.app`)
4. Click **Deploy**. Wait ~2 minutes.

You're live! Vercel gives you a `your-project.vercel.app` URL.

### 3. Set up the Stripe webhook

Now that you have a live URL, configure the webhook so paid orders get saved to your database.

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **"Add endpoint"**
3. Endpoint URL: `https://YOUR-PROJECT.vercel.app/api/webhook/stripe`
4. Select events: `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Back in Vercel → **Settings → Environment Variables**:
   - Add `STRIPE_WEBHOOK_SECRET` with the value
8. Redeploy: **Deployments → ⋯ menu → Redeploy**

Now place a test order on your live site. Check Supabase → **Table Editor → orders** — you should see the order recorded.

### 4. Go live with real payments

When you're ready to accept real money:

1. In Stripe, complete business verification (takes 1-3 days for UK Ltd companies)
2. Switch the toggle from **Test** to **Live** mode (top-right)
3. Get new live API keys (`sk_live_...` and `pk_live_...`)
4. Update them in Vercel's environment variables
5. Set up a new live-mode webhook (same URL, new signing secret)
6. Redeploy

### 5. Add a custom domain (optional)

In Vercel → **Settings → Domains** → add your domain (e.g. `brenncoffee.com`). Vercel walks you through DNS setup. SSL is automatic and free.

---

## How to add new products

Two options. The full admin panel is coming in phase 2; for now:

### Option A — Supabase Table Editor (easiest)

1. Go to your Supabase project → **Table Editor → products**
2. Click **+ Insert row**
3. Fill in fields — required: `slug`, `name`, `origin`, `roast_level`, `price_pence`
4. Save
5. Then go to **product_variants** and add 4-8 rows for the new product (different sizes/grinds with prices)

### Option B — SQL

Open the SQL Editor and run something like:

```sql
insert into products (slug, name, origin, country, tagline, roast_level, price_pence, is_featured)
values ('forge', 'Forge', 'Cerrado, Brazil', 'Brazil', 'Bold and unflinching.', 4, 1700, true);
```

Either way, the new product appears on the site within 60 seconds (ISR cache).

---

## Project structure

```
brenn-coffee/
├── app/                      # Next.js pages (App Router)
│   ├── api/                  # Server endpoints
│   │   ├── checkout/         # Creates Stripe sessions
│   │   ├── webhook/stripe/   # Receives payment confirmations
│   │   └── orders/           # Order lookups
│   ├── shop/                 # Listing page
│   ├── product/[slug]/       # Product detail
│   ├── checkout/             # Checkout flow
│   ├── about/                # Static about page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── globals.css
├── components/
│   ├── home/                 # Homepage sections
│   ├── shop/                 # Shop grid + filters
│   ├── product/              # PDP components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── CartDrawer.tsx
│   └── ProductCard.tsx
├── lib/
│   ├── supabase/             # DB clients
│   ├── stripe.ts             # Stripe client
│   ├── cart-store.ts         # Cart state (Zustand)
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Helpers
├── supabase/
│   └── schema.sql            # Database schema
└── ...config files
```

---

## What's coming in phase 2

The admin dashboard. You'll be able to:
- Add, edit, archive products from a UI (no SQL)
- View and manage orders (mark shipped, add tracking, refund)
- See live revenue/orders/visitors charts
- Manage inventory with low-stock alerts
- View customers and their order history
- Manage subscriptions
- Run discount codes
- Edit content (journal posts, brewing guides)

---

## Common issues

**"Could not load variants" on checkout**
→ The Supabase service role key isn't set, or RLS is blocking. Double-check `SUPABASE_SERVICE_ROLE_KEY` in your env vars.

**Webhook isn't firing**
→ Check Stripe Dashboard → Webhooks → click the endpoint → look at "Recent events" tab. Status should be 200. If it's 400, your `STRIPE_WEBHOOK_SECRET` is wrong.

**Products don't appear**
→ Check that products have `is_active = true` in the database.

**Card declined in test mode**
→ Use exactly `4242 4242 4242 4242` with any future expiry and any CVC. Other cards are for testing specific failures.

---

## Help

Email questions to wherever — or in dev, just inspect the Network tab of your browser to see what API calls are returning. The error messages are designed to be informative.

Brewed with intention. Built to scale.
