# ShopBangla

Bengali-first ecommerce starter built with Next.js and Supabase.

## Features
- Public storefront and product catalogue
- Customer email/password signup and login
- Customer account page
- Separate supervisor login and protected dashboard
- Product creation and order status management
- Supabase Row Level Security policies
- PWA manifest for installable mobile web experience

## Setup
1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` using the Supabase project URL and publishable key.
3. Run `npm install` then `npm run dev`.

## Supabase Auth settings
To avoid signup confirmation emails, open Authentication > Sign In / Providers > Email and turn off **Confirm email**. This means email addresses are not verified; people can register using an address they do not own. Do not grant admin privileges based on an email string alone.

## Admin bootstrap
1. Create the owner account in Supabase Auth before opening public signup.
2. After the owner account exists, promote its UUID in SQL Editor:
   `update public.profiles set role = 'admin' where id = 'OWNER_AUTH_USER_UUID';`
3. Never expose a service-role key in browser code.

## Routes
- `/` storefront
- `/signup` customer registration
- `/login` customer login
- `/account` customer account
- `/supervisor/login` admin login
- `/supervisor` protected admin dashboard

## MVP limitations
Checkout/order creation, payment gateway, image upload, shipping integration, and production hardening are not included yet.
