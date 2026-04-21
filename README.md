# OurSeparation — Ontario SSAG Calculator

One Next.js project. One `npm install`. One command to run.

---

## Quick start (5 steps)

### 1 — Install Node.js
Download from **nodejs.org** (LTS version). Restart VS Code after installing.

### 2 — Open the project
Unzip and open the `ourseparation-next` folder in VS Code.

### 3 — Configure your environment
Rename `.env.local` — it's already there. Open it and fill in two values:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxx.supabase.co:5432/postgres
JWT_SECRET=any-random-string-at-least-32-characters-long
```

Get your `DATABASE_URL` from:  
**Supabase dashboard → Settings → Database → URI tab**

### 4 — Install and migrate
Open the VS Code terminal (`Ctrl + backtick`) and run:

```bash
npm install
node lib/db/migrate.js
```

You should see: `✅ Migration complete — tables created in Supabase`

### 5 — Run
```bash
npm run dev
```

Open **http://localhost:3000**

---

## Project structure

```
ourseparation-next/
│
├── app/                          # Everything Next.js serves
│   ├── layout.js                 # Root layout + global CSS
│   ├── globals.css               # Design system (violet/white theme)
│   ├── page.js                   # Landing page (server component)
│   ├── landing.css
│   ├── auth.css                  # Shared login/register styles
│   │
│   ├── login/page.js             # Sign in page
│   ├── register/page.js          # Create account page
│   ├── dashboard/page.js         # Saved calculations list
│   ├── calculator/page.js        # Multi-step SSAG calculator
│   └── calculations/[id]/page.js # Full calculation report
│   │
│   └── api/                      # Backend — runs on the server
│       ├── auth/
│       │   ├── register/route.js
│       │   ├── login/route.js
│       │   ├── me/route.js
│       │   ├── refresh/route.js
│       │   └── logout/route.js
│       └── calculations/
│           ├── without/route.js  # SSAG without child support
│           ├── with/route.js     # SSAG with child support
│           ├── history/route.js  # List user's calculations
│           └── [id]/route.js     # Get / delete one calculation
│
├── components/
│   ├── AuthProvider.js           # Auth state (login, logout, register)
│   └── Nav.js                    # Navigation bar
│
└── lib/
    ├── apiClient.js              # Fetch wrapper with JWT auto-refresh
    ├── auth.js                   # JWT sign/verify + requireAuth()
    ├── db/
    │   ├── pool.js               # Supabase PostgreSQL connection
    │   └── migrate.js            # Run once to create tables
    └── calc/
        ├── ssagWithout.js        # SSAG formula (no children)
        ├── ssagWith.js           # NDI iterative solver (with children)
        ├── ontarioTax.js         # Full T1 + ON428 tax engine
        └── childSupportTables.js # 2006/2011/2017/2025 CST tables
```

---

## How the calculation works

### Without child support
```
Annual support (High) = Income difference × 20%
Annual support (Mid)  = Income difference × 17.5%
Annual support (Low)  = Income difference × 15%
Monthly = Annual / 12
```
Support duration range = 0.5 to 1 year per year of relationship.

### With child support
1. **Child Support** — looks up Federal Child Support Guidelines table (auto-selects 2006/2011/2017/2025 based on separation date). Handles primary care (s.3) and shared parenting (s.9) per child.
2. **Tax Engine** — simulates full Ontario T1 General + ON428 for both parties including CCB, GST/HST, CAI, OTB, OCB, LIFT credit, CPP, EI.
3. **NDI Solver** — binary search over spousal support values until Net Disposable Income reaches target High/Mid/Low ratios.

---

## Tech stack

| Layer | What |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL via Supabase |
| Auth | bcrypt passwords + JWT access/refresh tokens |
| Frontend | React 18 — no UI library, all custom CSS |
| API | Next.js Route Handlers (replaces Express) |

---

## Troubleshooting

**`npm install` fails** — make sure Node.js 18+ is installed: `node --version`

**Migration fails** — check your `DATABASE_URL` in `.env.local`. Make sure the password is correct and there are no spaces.

**White screen or 401 errors** — open browser DevTools (F12) → Console tab to see the error.

**`Module not found: @/lib/...`** — make sure `jsconfig.json` is in the root folder (it should be).

**Changes not showing** — Next.js hot-reloads automatically. If it's stuck, stop the server (`Ctrl+C`) and run `npm run dev` again.

---

## Legal disclaimer

OurSeparation provides informational calculations only. Results are not legal advice.
Always consult a qualified Ontario family lawyer before making decisions about support.
SSAG calculations are estimates — actual court-ordered support depends on your specific
circumstances including special expenses, imputed income, lifestyle, and other factors.
