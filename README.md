# Fill It

A lightweight Chrome extension that fills job application forms using data you've already
given it. No AI, no network calls, no account, no redirect to another site.

## How it works

1. Click the extension icon.
2. **Fill this page** — scans the page's visible form fields, matches each one to a field
   you've saved (by label text), and fills it. Matched fields get a green outline;
   anything it doesn't recognize gets an amber outline so you can spot it and fill it by hand.
3. **Save this form** — reads whatever you just typed into the page, matches it against your
   saved fields, and shows you a review list before saving anything. Unmatched fields can be
   saved as new custom fields.
4. **Edit fields** — opens a simple table of your saved fields (name, email, phone, links,
   address, EEO answers, or anything custom you've added) where you can edit values, tweak
   the words the matcher looks for, or add/remove fields entirely.

Your data lives in `chrome.storage.sync`, which rides your existing Google account — no
separate login, no server.

## Install (unpacked)

1. `chrome://extensions`
2. Enable Developer mode
3. Load unpacked → select this folder

## Files

- `manifest.json` — MV3 manifest
- `popup.html` / `popup.js` — the toolbar popup
- `options.html` / `options.js` — the field editor
- `content.js` — injected on click; does the actual scan/match/fill/capture
- `lib/fields.js` — default field list
- `lib/match.js` — label resolution + scoring, shared by fill and capture

## Not included (by design)

Work experience entries, resume file upload, custom combobox handling (Workday-style),
shadow DOM / iframe traversal, AI-generated answers. This tool only ever writes values you
told it yourself.
