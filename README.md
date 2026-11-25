# Pedirect

Affiliate redirect tracking and campaign routing platform.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Prisma + SQLite
- Auth.js (credentials)

## Quick start

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev -- -p 3002
```

Open [http://localhost:3002](http://localhost:3002)

**Demo login**
- Email: `demo@pedirect.com`
- Password: `demo@1226`

## Redirect links

Public tracking URL:

```
http://localhost:3002/r/{mappingKey}?geo=US
```

Optional query params: `geo`, `pub`, `type`, `ref`

Each hit is logged, an offer is chosen by weight (when linked), macros are applied, then a `302` redirect is issued.

## Pages

- `/login` — credentials auth
- `/dashboard` — live metrics
- `/campaigns` — CRUD + mapping keys + Test
- `/offers` — CRUD + duplicate/pause
- `/reports` — date-range aggregates
- `/click-logs` — explorer + CSV export
- `/notifications` — alerts
- `/r/[mappingKey]` — public redirect engine
