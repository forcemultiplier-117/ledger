# Ledger — a budget app built from your Excel

A single-user budgeting app: manual entry (no bank sync), one base amount +
frequency per line item, fixed/flexible tagging, per-property breakdowns, and
a forward-looking view of what's due next.

Stack: React + Vite, Supabase (Postgres + Auth), deployed to Vercel — same
pattern as macro-tracker.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Once it's provisioned, open the **SQL Editor** and run `supabase/schema.sql` in full.
3. Then run `supabase/seed.sql` — this loads your Excel data (70 expense line
   items + 3 income lines) as a starting point. Everything seeds with
   `base_frequency = 'monthly'`; go into **Line items** in the app afterward
   and switch anything you'd rather track annually/quarterly (e.g. the credit
   card annual fees, RE taxes) to its native frequency — the monthly figure
   will still be correct either way, but the "Upcoming" view only makes sense
   once frequency matches reality.
4. Go to **Authentication → Users** → Add user, and create yourself an
   email/password login. This is the only account the app expects — RLS
   policies allow any authenticated user full access, since it's single-user.
5. Go to **Project settings → API** and copy the **Project URL** and **anon
   public key**.

## 2. Configure the app locally

```bash
cp .env.local.example .env.local
# paste your Project URL and anon key into .env.local
npm install
npm run dev
```

Sign in with the email/password you created in step 4.

## 3. Deploy

Push this repo to GitHub, then import it in Vercel. Add the two environment
variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel
project settings, same as macro-tracker. Add to your phone's home screen for
the same app-like feel.

## Data model

- **entities** — Primary Home, Rental Condo, Personal
- **categories** — expense and income categories, self-referencing for sub-categories
- **line_items** — every recurring income/expense: one base amount + frequency,
  fixed/flexible tag, entity, category, payment method, last-paid date, notes.
  Monthly/quarterly/annual views are all derived from the base amount —
  nothing is double-entered.
- **incidentals** — one-off, non-recurring spend. A simple log, no forecasting.

## Pages

- **Dashboard** — monthly income/expense/net, fixed vs. flexible split, category run-rate
- **Line items** — the full CRUD table, filterable by entity and fixed/flexible
- **By entity** — Primary Home / Rental Condo / Personal side by side
- **Upcoming** — renewals due in the next 30/60/90 days, projected from last-paid + frequency
- **Incidentals** — the one-off log, with a year-to-date total

## Notes on the seed data

The seed script infers a fixed/flexible tag per line based on what kind of
expense it is (subscriptions and insurance = fixed, metered utilities =
flexible) — since you asked for manual tagging, treat these as a starting
guess and adjust in the Line items page as you go. Payment method is carried
over as whatever was in the "How Paid" column of your Excel (mostly card last-
4s); nothing else about your card accounts is stored beyond that label.
