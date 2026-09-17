# Threadline — Clothing E-Commerce (MIS & E-Business project)

A simple, working e-commerce web app for a clothing brand, built for the
**MIS and E-Business (CACS301)** lab project: "individually implementing a
fully functioning e-commerce web application along with payment system."

Stack: **Next.js** (storefront + API in one codebase) + **Supabase**
(hosted PostgreSQL database) + **eSewa** (sandbox payment gateway) +
**Vercel** (free hosting). Nothing needs to be installed on the machine you
demo from — you just open the live URL in a browser.

## What's included

- Product catalog (10 sample clothing items across T-Shirts, Hoodies,
  Jackets, Jeans, Dresses, Footwear) with category filtering
- Product detail page with size selection
- Cart (persists in the browser via localStorage)
- Checkout form that creates a real order in the database
- eSewa sandbox payment integration (HMAC-signed redirect + signature
  verification + a server-to-server status check on return)
- A simple password-gated `/admin` page to view orders and their payment
  status

## 1. Set up the database (Supabase — free, no install)

1. Go to [supabase.com](https://supabase.com), sign up (free), and create a
   new project. Save the database password it asks you to set.
2. Once the project is ready, open **SQL Editor → New query**.
3. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql)
   and click **Run**. This creates the `products`, `orders` and
   `order_items` tables and inserts 10 sample products.
4. Go to **Project Settings → API**. Copy:
   - **Project URL** → this is `SUPABASE_URL`
   - **service_role key** (under "Project API keys", NOT the `anon` key)
     → this is `SUPABASE_SERVICE_ROLE_KEY`

   The service role key is powerful (it bypasses row-level security) and is
   only ever used on the server side in this app — never expose it in
   client-side code.

## 2. Push this code to GitHub

From this project folder:

```bash
git init
git add .
git commit -m "Initial commit: Threadline e-commerce project"
```

Then create a new empty repository on [github.com/new](https://github.com/new)
(don't initialize it with a README), and run the two commands GitHub shows
you, e.g.:

```bash
git remote add origin https://github.com/<your-username>/threadline.git
git branch -M main
git push -u origin main
```

## 3. Deploy on Vercel (free, no install)

1. Go to [vercel.com](https://vercel.com) and sign up/log in with your
   GitHub account.
2. Click **Add New → Project**, and import the `threadline` repo you just
   pushed.
3. Before deploying, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | from step 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from step 1 |
   | `ESEWA_MERCHANT_CODE` | `EPAYTEST` |
   | `ESEWA_SECRET_KEY` | `8gBm/:&EnhH.1/q` |
   | `ESEWA_PAYMENT_URL` | `https://rc-epay.esewa.com.np/api/epay/main/v2/form` |
   | `ESEWA_STATUS_CHECK_URL` | `https://rc.esewa.com.np/api/epay/transaction/status/` |
   | `NEXT_PUBLIC_BASE_URL` | leave blank for now, see step 4 |
   | `ADMIN_PASSWORD` | pick your own password |

4. Click **Deploy**. Once it finishes, Vercel gives you a URL like
   `https://threadline-yourname.vercel.app`. Go back into
   **Settings → Environment Variables**, set `NEXT_PUBLIC_BASE_URL` to that
   exact URL, then **Deployments → ⋯ → Redeploy** (this URL is needed so
   eSewa knows where to redirect the customer back to after payment).

That's it — the same URL works from any browser, including the office
laptop, with nothing installed.

## 4. Testing a payment (eSewa sandbox)

The `EPAYTEST` merchant code and secret key above are eSewa's **public
test/sandbox credentials** — safe to use for a demo, not for real money.
When checkout redirects you to eSewa, log in with:

- eSewa ID: `9711111111` (or `9711111112` / `...113` / `...114`)
- Password: `Nepal@123`
- MPIN: `1122`
- Token/OTP: `123456`

Complete the payment and you'll be redirected back to `/payment/success`,
which verifies the transaction with eSewa (signature check + a
server-to-server status check) and marks the order `COMPLETE` in the
database. Cancel instead, and you'll land on `/payment/failure` with the
order marked `FAILED`. Check `/admin` (password from `ADMIN_PASSWORD`) to
see all orders and their status.

## Why this design (useful for your report/viva)

- **Server-authoritative pricing**: the checkout API re-reads prices from
  the database rather than trusting whatever the browser sends, so a
  tampered request can't buy things at a fake price.
- **Signature verification isn't enough for the sandbox key** — `EPAYTEST`'s
  secret is public, so anyone could forge a redirect. That's why, on top of
  verifying the signature, the success page also asks eSewa's own
  status-check API to independently confirm the transaction really
  completed before marking an order paid.
- **`service_role` key stays server-side only.** All database access goes
  through Next.js server components / API routes; nothing in the browser
  ever sees a Supabase key that could write to the database directly.

## Local development (optional)

If you ever want to run it on your own machine instead of only on Vercel:

```bash
npm install
cp .env.example .env.local   # fill in your Supabase + eSewa values
npm run dev
```

## Project structure

```
app/                  Pages and API routes (Next.js App Router)
  page.js             Storefront home / product grid
  products/[id]/       Product detail page
  cart/                Cart page
  checkout/            Checkout form -> creates order -> redirects to eSewa
  api/create-order/    Order creation API (server-side price recalculation)
  api/esewa/           (reserved for future use)
  payment/success/     eSewa success redirect handler (verifies + confirms)
  payment/failure/     eSewa failure/cancel redirect handler
  admin/               Password-gated orders view
components/           Reusable UI (Navbar, ProductCard, CartContext, etc.)
lib/
  supabaseClient.js    Server-only Supabase client (service_role key)
  esewa.js             HMAC signature build/verify + status-check helper
supabase/schema.sql    Database schema + sample product data
```
