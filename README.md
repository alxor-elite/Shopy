# SHOPY - Bold Streetwear E-Commerce

A full-stack fashion e-commerce platform built with React + Vite + Tailwind CSS and Supabase as the backend.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4, React Router, Lucide Icons
- **Backend**: Supabase (PostgreSQL, Auth, Storage, REST API)
- **Payments**: Stripe Elements (test mode)
- **State**: React Context (Cart, Auth)

---

## Setup Instructions (Step by Step)

### Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign up / log in
2. Click **"New Project"**
3. Give it a name (e.g. `shopy`), set a database password (save it somewhere), pick a region close to you
4. Wait ~2 minutes for the project to finish creating

### Step 2: Get Your API Keys

1. In your Supabase project dashboard, click **"Project Settings"** (gear icon in the left sidebar)
2. Click **"API"** in the settings menu
3. You'll see two things you need:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public key** — a long string starting with `eyJ...`
4. Keep this page open, you'll need these values in Step 6

### Step 3: Run the Database SQL

This creates all the tables, security rules, and adds 12 sample products to your store.

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** (top-left button)
3. Open the file `supabase/schema.sql` from this project in any text editor
4. **Select ALL** the contents of that file (Ctrl+A) and **copy** it (Ctrl+C)
5. **Paste** it into the Supabase SQL Editor (Ctrl+V)
6. Click the green **"Run"** button (or press Ctrl+Enter)
7. You should see "Success. No rows returned" — that means it worked!

**What this SQL does:**
- Creates a `products` table (stores product name, price, category, images)
- Creates a `product_sizes` table (stores sizes like S/M/L/XL with stock count per size)
- Creates an `orders` table (stores customer info when they place an order)
- Creates an `order_items` table (stores which products were in each order)
- Sets up Row Level Security (RLS) so products are publicly viewable but orders are admin-only
- Inserts 12 sample products (cargos, t-shirts, shirts, jeans) with realistic prices and stock

### Step 4: Create an Admin User

This is the login you'll use to access the admin panel at `/admin`.

1. In your Supabase dashboard, click **"Authentication"** in the left sidebar
2. Click the **"Users"** tab
3. Click **"Add User"** button (top-right) → select **"Create New User"**
4. Fill in:
   - Email: `admin@store.com` (or any email you prefer)
   - Password: choose something you'll remember (e.g. `Admin123!`)
   - Toggle **"Auto Confirm User"** to ON
5. Click **"Create User"**

### Step 5: Set Up Image Storage

This lets the admin panel upload product images.

1. In your Supabase dashboard, click **"Storage"** in the left sidebar
2. Click **"New Bucket"**
3. Bucket name: `product-images`
4. Toggle **"Public bucket"** to ON
5. Click **"Create Bucket"**
6. Now click on the `product-images` bucket you just created
7. Click **"Policies"** tab (near the top)
8. Under **"Other policies under storage.objects"**, click **"New Policy"**
9. Select **"For full customization"**
10. Set up these policies:

**Policy 1 — Allow public to view images:**
- Policy name: `Public can view images`
- Allowed operation: SELECT
- Target roles: leave empty (means everyone)
- USING expression: `true`
- Click "Review" → "Save policy"

**Policy 2 — Allow admin to upload images:**
- Click "New Policy" again → "For full customization"
- Policy name: `Authenticated users can upload`
- Allowed operation: INSERT
- Target roles: `authenticated`
- WITH CHECK expression: `true`
- Click "Review" → "Save policy"

**Policy 3 — Allow admin to delete images:**
- Click "New Policy" again → "For full customization"
- Policy name: `Authenticated users can delete`
- Allowed operation: DELETE
- Target roles: `authenticated`
- USING expression: `true`
- Click "Review" → "Save policy"

### Step 6: Set Up Environment Variables

1. In this project folder, open the file called `.env`
2. Replace the placeholder values with your real keys from Step 2:

```env
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-full-key-here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
```

**For Stripe (optional):**
- Go to https://dashboard.stripe.com/test/apikeys
- Copy your "Publishable key" (starts with `pk_test_`)
- If you skip this, card payments won't process but the rest of the app still works

### Step 7: Install Dependencies and Run

Open a terminal in this project folder and run:

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser — you should see the store!

---

## How to Use

### As a Customer
- Browse products on the homepage or `/products`
- Filter by category, size, or price
- Click a product → select size → Add to Cart
- Click cart icon → Checkout
- Fill in delivery details, choose payment method, place order

### As an Admin
- Go to http://localhost:5173/admin/login
- Log in with the email/password you created in Step 4
- **Dashboard**: See stats (total products, low stock alerts, recent orders)
- **Products**: Add/edit/delete products, upload images, set sizes & stock
- **Inventory**: Quick-edit stock levels for all sizes
- **Orders**: View orders, update status (pending → shipped → delivered)

---

## Project Structure

```
/src
  /components  → Navbar, ProductCard, Cart, StockBadge, Footer, ProtectedRoute
  /pages       → Home, Products, ProductDetail, Checkout, OrderConfirmation
  /pages/Admin → Login, Layout, Dashboard, Products, Inventory, Orders
  /lib         → supabase.js (DB client), stripe.js (payment client)
  /hooks       → useCart.jsx (cart state), useProducts.jsx (DB queries), useAuth.jsx (login state)
/supabase
  schema.sql   → The SQL you ran in Step 3
.env           → Your secret keys (never commit this to git)
```

---

## Stripe Test Cards

When testing card payments, use these fake card numbers:

| Card Number | Result |
|---|---|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Payment declined |

- Expiry: any future date (e.g. `12/34`)
- CVC: any 3 digits (e.g. `123`)
- ZIP: any 5 digits (e.g. `12345`)

---

## Troubleshooting

**"No products showing on the homepage"**
→ Make sure you ran the SQL in Step 3 successfully. Go to Supabase → Table Editor → check if the `products` table has 12 rows.

**"Error: supabaseUrl is required"**
→ Your `.env` file values are wrong or empty. Double-check they match what's in Supabase Settings → API.

**"Admin login not working"**
→ Make sure you toggled "Auto Confirm User" when creating the user in Step 4. If you forgot, go to Authentication → Users → click the user → confirm them manually.

**"Images not uploading in admin"**
→ Make sure the `product-images` bucket exists and has the storage policies from Step 5.
