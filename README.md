# OC CRM

Internal CRM for an Organizing Committee: contact directory, activity logging,
role-scoped access for Logistics / Sales / PR-Marketing / Admin, an analytics
dashboard, and CSV/XLSX export.

**Stack:** Next.js 14 (App Router, TypeScript) + Tailwind CSS + Supabase
(Postgres + Auth + Row Level Security) + Recharts + SheetJS (`xlsx`).

## 1. Set up Supabase

1. Create a project at supabase.com.
2. Open the SQL editor and run `supabase/schema.sql` — it creates all tables,
   enums, the `profiles` auto-provisioning trigger, and every RLS policy.
3. In **Project Settings → API**, copy the Project URL and anon public key.

## 2. Configure the app

```bash
cp .env.example .env.local
# then fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

To let admins create accounts for teammates (see below), also set
`SUPABASE_SERVICE_ROLE_KEY` — find it in **Project Settings → API →
service_role secret key**. This key bypasses Row Level Security, so it's
server-only: it has no `NEXT_PUBLIC_` prefix and must never be imported into
a client component.

## 3. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` → you'll land on `/login`. Use "Sign up" to
create the first few accounts — pick a different department for each one
(Logistics, Sales, PR/Marketing, Admin/Board) so you can see how access
differs per role. Signing up auto-creates a matching row in `profiles` via
the `handle_new_user` trigger.

## How access control works

- **Middleware** (`middleware.ts`) refreshes the Supabase session on every
  request, redirects signed-out users to `/login`, and blocks non-admins from
  `/directory`.
- **Row Level Security** in `supabase/schema.sql` is the real enforcement
  layer: a Logistics user's queries can only ever return Logistics contacts
  (or their own profile), no matter what the UI does. Admin/Board bypasses
  the department check everywhere.
- **My Contacts** shows contacts you personally own (any role). **All
  Directory** is the org-wide view, only linked for Admin/Board.
- Admin/Board already had full read/write access to every department's
  contacts and logs via RLS (the `current_department() = 'admin'` clause on
  every policy). The one gap was provisioning logins for new members —
  **Settings** now has a "Create a team member account" form for
  Admin/Board that provisions the login directly (via the Supabase Admin API,
  `lib/supabase/admin.ts` + `app/(app)/settings/actions.ts`), instead of
  waiting for people to self-serve sign-up. It re-checks admin status
  server-side before touching anything, since the service-role client
  bypasses RLS. The same `handle_new_user` trigger fires either way, so the
  `profiles` row is created automatically.

## Dark mode

A toggle in the sidebar (and top-right of the login screen) flips a `.dark`
class on `<html>`, persisted in `localStorage`. Colors that need to flip
(`paper`, `surface`, `ink`, `muted`, `border`) are defined as CSS variables
in `app/globals.css` and referenced from `tailwind.config.ts`; everything
else (brand/status colors) stays fixed. An inline script in `app/layout.tsx`
sets the class before hydration so there's no flash of the wrong theme, and
falls back to the OS-level preference if nothing's been saved yet.

## What's simplified for this scaffold

- No password reset / email confirmation flows — Supabase's defaults apply.
- The "Settings" page covers your own profile plus a read-only team list for
  Admin/Board; it doesn't yet expose things like inviting users or renaming
  departments.
- Contact and log editing is minimal (status changes, new log entries) —
  there's no edit-in-place for a contact's core fields or log deletion yet.
- No automated tests.

## Project layout

```
app/
  login/                 sign in / sign up
  (app)/                 authenticated shell (sidebar layout)
    dashboard/            stats + charts
    contacts/              "My Contacts" + [id] detail & activity log
    directory/            "All Directory" (admin only)
    settings/
components/              ContactTable, ActivityLog, ExportMenu, dashboard/*
lib/
  supabase/              browser + server Supabase clients
  types.ts                shared enums/labels
  auth.ts                 role → nav / route permission helpers
  export.ts               CSV/XLSX export
supabase/schema.sql       tables, enums, RLS policies, trigger
```
