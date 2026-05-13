# ONE/OFF

> One design. One owner. Forever retired.

Premium limited-edition fashion platform where a single t-shirt design is released daily. Once purchased, the design is permanently retired and never printed again.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Backend | Supabase (Postgres + Auth + Storage) |
| Payments | Razorpay |
| Language | TypeScript |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/yourorg/oneoff
cd oneoff
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the SQL editor
3. Enable email auth in Auth settings
4. Create a `drops` storage bucket (public)

### 3. Set up Razorpay

1. Create account at [razorpay.com](https://razorpay.com)
2. Get your Key ID and Key Secret from the Dashboard
3. For testing, use test mode keys (`rzp_test_...`)

### 4. Configure environment

```bash
cp .env.example .env.local
# Fill in your Supabase and Razorpay credentials
```

### 5. Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Homepage
│   ├── drop/               # Today's drop
│   ├── archive/            # Past drops museum
│   ├── admin/              # Upload & manage drops
│   ├── auth/               # Login / register
│   └── api/
│       ├── drops/          # CRUD for drops
│       └── orders/         # Razorpay order + verify
│           └── verify/
├── components/
│   ├── layout/             # Navbar, Hero, Manifesto
│   ├── drop/               # Countdown, ClaimButton, DropDetail
│   ├── archive/            # ArchiveGrid, ArchivePreview
│   ├── admin/              # AdminDashboard
│   └── ui/                 # Loader, Ticker, shared
├── lib/
│   ├── supabase.ts         # DB queries + admin client
│   └── utils.ts            # Serial generator, helpers
├── hooks/
│   └── useCountdown.ts     # Live countdown timer
└── types/
    └── index.ts            # All TypeScript types
```

---

## Key Features

### Drop System
- **Daily drop**: One design goes live at midnight, expires at 11:59pm
- **One-click claim**: Size selection → Razorpay checkout → serial generation
- **Race condition protection**: DB-level uniqueness constraint on owners table
- **Auto status**: DB triggers handle live → sold → retired transitions

### Serial Numbers
Format: `ONE-OFF-047-A3F9XZ`
- Unique per purchase, generated at payment verification
- Stored on the owner record, order, and returned to buyer
- Never reused even if payment fails

### Archive Museum
- Every sold design is preserved with owner info and serial
- Hover interactions reveal design story and owner username
- Filterable by era, design type

### Admin Dashboard
- Upload new drops with image, story, price, schedule
- Live stats: revenue, drop count, current status
- Recent drops management table

---

## Database Schema

See `supabase-schema.sql` for the complete schema including:
- `drops` — design catalog with status machine
- `owners` — one-to-one with drops (enforces exclusivity)
- `orders` — Razorpay order tracking
- `users` — extended profile from Supabase auth
- DB triggers for auto-status-updates

---

## Deployment

```bash
npm run build
# Deploy to Vercel, Railway, or any Node.js host
# Set all .env.example variables in your hosting provider
```

---

## Design System

**Fonts**: Bebas Neue (display) · Barlow (body) · Courier Prime (mono)  
**Palette**: Pure black `#000` · Pure white `#fff` · Accent green `#4eff91`  
**Motion**: Framer Motion with `cubic-bezier(0.16, 1, 0.3, 1)` easing  
**Aesthetic**: Minimal brutalist luxury — no color, no decoration, only form

---

Made in Mumbai. ONE/OFF. © 2024
