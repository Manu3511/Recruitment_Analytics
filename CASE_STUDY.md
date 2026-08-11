# Hire Flow — Recruitment CRM + Analytics Platform

**By Manuraj M** · [LinkedIn](https://www.linkedin.com/in/manuraj--/) · [GitHub](https://github.com/manu3511)

**Role:** Sole developer (working with Claude Code as pair-programmer)
**Stack:** React · Supabase (Postgres + Auth + RLS) · FastAPI (Python) · Render · Vercel · Vobiz (telephony)
**Status:** Live in production, actively used daily by an HR team

## The problem

A recruitment team was running outbound candidate screening manually — a mix of spreadsheets and ad-hoc calling, with no shared view of who'd been contacted, no funnel visibility, and no way to see conversion trends across recruiters, processes, or hiring positions. Cold-lead calling was already automated through a basic IVR dialer, but it wasn't connected to anything — a candidate could get called, respond, and then vanish into a spreadsheet nobody else could see.

## What I built

**Hire Flow** — a hiring-funnel CRM that sits on top of the existing IVR dialer and turns raw call data into an actual pipeline:

- **Candidate pipeline**: stage-based tracking (New → Contacted → Interview → Hired/Rejected), CSV bulk upload with round-robin assignment, manual and automatic reassignment/handoff between recruiters, activity timeline per candidate.
- **On-the-spot IVR integration**: a recruiter can trigger an automated follow-up call for any candidate directly from their record — scheduled, retried, and its outcome synced back onto the candidate's timeline automatically, without leaving the CRM.
- **Position Openings module**: separate requisition tracking (Company × Process × Position × target headcount) with auto-linking a hire to the right opening — or auto-creating one — so recruiters never lose a hire to a missing paperwork step. Headcount and closure logic run through an atomic Postgres RPC to eliminate a race condition where two near-simultaneous hires could both slip past a requisition's target.
- **Analytics dashboard**: funnel conversion rates, day-wise attempt/hire trend charts, recruiter performance leaderboards, average days-to-close by process/position, and an IVR-call-attempt metric that's deliberately isolated from manually-logged contact notes — so "how many times has this candidate actually been auto-dialed" is a real, trustworthy number instead of a guess.
- **Role-based access**: four roles (Admin/Manager/HR/CEO) with different visibility — HR sees only their own assigned candidates, Managers see their team, the CEO gets a read-only company-wide view.

## Interesting engineering problems

**Race condition on auto-close.** The original "close this position once its headcount target is hit" logic read the current fill count client-side, then wrote a status update — classic time-of-check-to-time-of-use gap. Two recruiters marking two different candidates "Hired" into the same opening within moments of each other could both read the same stale count and both proceed, silently overshooting the target. Fixed by moving the whole read-check-write sequence into a single Postgres function using `SELECT ... FOR UPDATE` to serialize concurrent calls on the same row.

**RLS was scoped by convenience, not by threat model.** Most tables used a blanket `USING (true)` policy for any authenticated Supabase user, with role enforcement living entirely in the frontend UI. That was a reasonable shortcut when "authenticated" only ever meant someone the team had explicitly provisioned — but it turned into a real gap once the frontend repo went public (the Supabase anon key ships in any client-side app's JS bundle by design, so that part's unavoidable) combined with open self-signup on the auth provider. I demonstrated the exploit end-to-end with a throwaway account — register with just the public anon key, confirm the email, and pull real candidate PII straight from the REST API, bypassing the UI's role checks entirely — then closed it two ways: disabled public signup, and rewrote the RLS policies to require an actual `user_roles` row (`current_role_name() IS NOT NULL`) rather than just a valid session. Verified the fix the same way I found the hole: a fresh authenticated-but-unprovisioned account now gets an empty result set instead of live data.

**Bulk operations that partially fail.** A CSV candidate upload is a single batch INSERT; `phone` is a unique constraint. One stale duplicate anywhere in a 100-row batch used to fail the *entire* insert — Postgres bulk inserts are all-or-nothing by default. Fixed with `Prefer: resolution=ignore-duplicates` + `on_conflict`, so PostgREST silently skips just the colliding rows instead of discarding every valid one alongside them.

## What I'd do differently

The reference-list tables (Processes, Position Types, Companies) started as simple lookup values and grew real usage patterns (rename, merge-and-migrate) that weren't designed in from the start — I'd model that as a proper versioned taxonomy from day one next time, rather than retrofitting rename/merge tooling after the fact.
