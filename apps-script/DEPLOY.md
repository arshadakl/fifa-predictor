# Deploying the Google Apps Script backend

This Web App receives JSON requests from the Next.js API routes and reads/writes
rows in a Google Sheet. No service account or private key is needed — just a
deployed Web App URL and a shared secret.

## 1. Create / open the target Google Sheet

Create a new Google Sheet (or use an existing one) — this will store all
prediction submissions. You don't need to add any headers manually; the script
creates these tabs automatically on first use:

- **`Predictions`** — one row per participant submission.
- **`Config`** — app settings as `Key` / `Value` rows (registration window,
  results publishing, closed/results messages, last-disabled timestamp). Managed
  from the admin **Event Controls** tab; you never edit it by hand.
- **`Actuals`** — the actual tournament results entered in the admin, stored as
  `Key` / `Value` rows so they persist across browsers.

## 2. Open the Apps Script editor

In the Sheet: **Extensions > Apps Script**.

This opens a script bound to the spreadsheet (so `SpreadsheetApp.getActiveSpreadsheet()`
always refers to this Sheet).

## 3. Paste the code

Delete the default contents of `Code.gs` and paste in the contents of
`apps-script/Code.gs` from this project.

## 4. Set the shared secret

In the Apps Script editor: **Project Settings (gear icon) > Script Properties >
Add script property**.

- Property: `SHARED_SECRET`
- Value: any long random string (e.g. generate one with `openssl rand -hex 32`)

Keep this value safe — you'll put it in `.env.local` as `APPS_SCRIPT_SECRET`.

## 5. Deploy as a Web App

In the Apps Script editor: **Deploy > New deployment**.

- Select type: **Web app**
- Description: anything, e.g. "FWC26 Predictions API"
- Execute as: **Me**
- Who has access: **Anyone**

Click **Deploy**, authorize the requested permissions (it needs access to the
Sheet), then copy the **Web app URL**.

## 6. Configure the Next.js app

In `fifa-world-cup-2026-next/.env.local` (create it from `.env.example`):

```
APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXX/exec
APPS_SCRIPT_SECRET=<the SHARED_SECRET value from step 4>
```

## 7. Re-deploying after edits

If you edit `Code.gs` later, you must create a **new deployment** (or use
**Manage deployments > Edit > New version**) for the changes to take effect —
the Web App URL stays the same when you create a new version of an existing
deployment.

> **Upgrading an existing deployment:** the registration window, results
> publishing, late-entry check, and stored actuals features require the updated
> `Code.gs` (it adds the `readConfig` / `writeConfig` / `readActuals` /
> `writeActuals` actions and the `Config` / `Actuals` tabs). Re-paste `Code.gs`
> and deploy a **new version** — existing `Predictions` data is untouched.
>
> **`submit` action (atomic prediction submit):** `POST /api/predict` now calls
> a single `submit` action that runs the registration gate + duplicate check +
> ID generation + append under a `LockService` lock (one round-trip instead of
> read-then-append, and no duplicate race). You **must re-paste `Code.gs` and
> deploy a new version** for this — until then submissions fail with
> `Unknown action: submit`.
