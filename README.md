# ReSell Hub — Server (Backend API)

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)

## Live URL

| Service | URL |
|---------|-----|
| **API (Render)** | `https://your-api-name.onrender.com` |
| **Frontend (Vercel)** | `https://your-app-name.vercel.app` |

> Update these URLs after deployment and before submission.

---

## Project Purpose

REST API backend for **ReSell Hub** — a second-hand marketplace. Handles user authentication, product CRUD, orders, payments (Stripe), wishlists, reviews, admin moderation, and platform statistics.

---

## Key Features

- JWT authentication (register, login, protected routes)
- Google OAuth sync endpoint
- Role-based authorization (buyer, seller, admin)
- Product CRUD with admin moderation (approve / reject)
- Order management with status workflow and buyer cancel
- Stripe Payment Intent creation and payment records
- Wishlist, contact form, product reviews
- Public stats and category listings
- Admin user management (block, delete)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| Payments | Stripe |
| OAuth | google-auth-library |

---

## NPM Packages Used

| Package | Purpose |
|---------|---------|
| `express` | Web server and routing |
| `mongoose` | MongoDB ODM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT sign and verify |
| `cors` | Cross-origin requests from Vercel frontend |
| `dotenv` | Environment variable loading |
| `stripe` | Payment intent creation |
| `google-auth-library` | Google OAuth token verification |

---

## Data Collections

| Collection | Description |
|------------|-------------|
| `users` | name, email, role, photo, phone, location, status |
| `products` | title, category, condition, price, stock, images, sellerId, status |
| `orders` | buyerId, sellerId, productId, paymentStatus, orderStatus |
| `payments` | orderId, transactionId, amount, paymentStatus, paymentMethod |
| `reviews` | reviewerId, productId, rating, comment |
| `wishlists` | userId, productIds |
| `contacts` | Contact form submissions |

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (free tier works)
- Stripe test account
- Google OAuth credentials

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/mehediScriptDev/resellApi.git
cd resellApi

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Fill in all values in .env

# 5. Seed the admin account
npm run seed:admin

# 6. Start the server
npm run dev
```

Server runs at **http://localhost:5000**

Test: open `http://localhost:5000` — you should see `ReSell Hub API is running...`

---

## Environment Variables

Create `.env` in the project root:

| Variable | Example | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `5000` | No | Server port (Render sets this automatically) |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/resellhub` | Yes | MongoDB connection string |
| `JWT_SECRET` | `super_secret_jwt_key_here` | Yes | Secret for signing JWT tokens |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Yes | Stripe secret key |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Yes | Google OAuth client secret |
| `FRONTEND_URL` | `http://localhost:3000` | Yes | Frontend URL for CORS and OAuth redirects |
| `API_URL` | `http://localhost:5000` | Yes | This API's public URL (no `/api` suffix) |

---

## Admin Credentials

After running `npm run seed:admin`:

| Field | Value |
|-------|-------|
| Email | `admin@resellhub.com` |
| Password | `admin123` |

---

## API Endpoints

### Auth — `/api/auth`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/register` | Public | Register with email/password |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Private | Get current user profile |
| GET | `/google` | Public | Start Google OAuth flow |
| GET | `/google/callback` | Public | Google OAuth callback |
| POST | `/google-sync` | Public | Sync Better Auth user to JWT |

### Products — `/api/products`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Public | List products (search, filter, pagination) |
| GET | `/:id` | Public | Get single product |
| POST | `/` | Seller | Create product |
| PUT | `/:id` | Seller | Update product |
| DELETE | `/:id` | Seller | Delete product |
| PUT | `/:id/moderate` | Admin | Approve or reject product |
| GET | `/seller/mine` | Seller | Seller's own products |
| GET | `/admin/all` | Admin | All products for moderation |

### Orders — `/api/orders`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | Buyer | Create order |
| GET | `/buyer` | Buyer | Buyer's orders |
| GET | `/seller` | Seller | Seller's orders |
| GET | `/admin` | Admin | All orders |
| PUT | `/:id/status` | Seller/Admin | Update order status |
| PUT | `/:id/cancel` | Buyer | Cancel order before shipment |

### Payments — `/api/payments`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/create-intent` | Private | Create Stripe payment intent |
| POST | `/save` | Private | Save payment after success |
| GET | `/` | Buyer | Payment history |
| GET | `/admin` | Admin | All payments |

### Reviews — `/api/reviews`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/product/:productId` | Public | Get product reviews |
| POST | `/` | Buyer | Submit a review |

### Other
| Prefix | Description |
|--------|-------------|
| `/api/users` | Profile update, become seller, admin user management |
| `/api/wishlist` | Add, remove, list wishlist items |
| `/api/stats` | Public stats, categories, seller/admin analytics |
| `/api/contact` | Contact form submission |

---

## Deploy to Render (Backend)

> **Why not Vercel?** Vercel is designed for frontend and serverless functions. This Express API runs as a **persistent Node.js server** and must be hosted on **Render** (free tier), Railway, or similar. Your **Next.js frontend** goes on **Vercel**.

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: ReSell Hub API ready for deployment"
git branch -M main
git remote add origin https://github.com/mehediScriptDev/resellApi.git
git push -u origin main
```

> Make sure `.env` is in `.gitignore` and never committed.

### Step 2 — Create Render Web Service

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **New +** → **Web Service**
3. Connect your GitHub account and select the `resellApi` repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `resell-hub-api` (or any name) |
| **Region** | Singapore (closest to Bangladesh) |
| **Branch** | `main` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Instance Type** | Free |

### Step 3 — Add Environment Variables

In Render → your service → **Environment**, add:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret string |
| `STRIPE_SECRET_KEY` | `sk_test_...` from Stripe dashboard |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth client secret |
| `FRONTEND_URL` | `https://your-app-name.vercel.app` |
| `API_URL` | `https://your-api-name.onrender.com` |

> `PORT` is set automatically by Render — do not add it manually.

### Step 4 — Deploy

Click **Create Web Service**. Render builds and deploys. Your API URL will be:
```
https://resell-hub-api.onrender.com
```

### Step 5 — Seed Admin on Production

After first deploy, open Render → **Shell** tab and run:
```bash
node scripts/seedAdmin.js
```

### Step 6 — MongoDB Atlas Network Access

In MongoDB Atlas → **Network Access** → add:
```
0.0.0.0/0
```
(This allows Render's servers to connect. Required for cloud deployment.)

### Step 7 — Connect Frontend

In your Vercel frontend env vars, set:
```
NEXT_PUBLIC_API_URL=https://resell-hub-api.onrender.com/api
```

---

## Full Deployment Flow (Both Apps)

```
┌─────────────────┐         ┌──────────────────┐         ┌───────────────┐
│  User Browser   │ ──────► │  Vercel          │ ──────► │  Render API   │
│                 │         │  (Next.js UI)    │  REST   │  (Express)    │
└─────────────────┘         └──────────────────┘         └───────┬───────┘
                                                               │
                                                       ┌───────▼───────┐
                                                       │ MongoDB Atlas │
                                                       └───────────────┘
```

**Order of deployment:**
1. Deploy **backend** on Render first → get API URL
2. Deploy **frontend** on Vercel → set `NEXT_PUBLIC_API_URL` to Render URL
3. Update `FRONTEND_URL` on Render to Vercel URL
4. Update Google OAuth URIs with both production URLs
5. Run `seed:admin` on Render shell
6. Test everything on live URLs

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoDB connection error` | Check `MONGO_URI`, whitelist `0.0.0.0/0` in Atlas |
| CORS errors from frontend | Set `FRONTEND_URL` to exact Vercel URL (no trailing slash) |
| API slow on first request | Render free tier sleeps after 15 min — first request wakes it (~30s) |
| Stripe payment fails | Replace placeholder `STRIPE_SECRET_KEY` with real test key |
| Google OAuth mismatch | Add Render callback URL to Google Console if using Express OAuth |
| 502 on Render | Check logs in Render dashboard; verify `node index.js` starts without errors |

---

## Author

ReSell Hub — Programming Hero Assignment Project  
GitHub: [mehediScriptDev/resellApi](https://github.com/mehediScriptDev/resellApi)
