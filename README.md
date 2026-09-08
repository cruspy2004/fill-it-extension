# Fill It

A Chrome extension that fills job applications with details you saved yourself.

No AI. No servers. No account. No redirect to somebody else's website. It only ever writes
values you gave it.

---

## How to use it

**1. Add your details.** After installing, a welcome page opens — click **Add my details** and
fill in your name, email, phone, LinkedIn, GitHub. Add any field you like; it's just a list.

**2. Pin the extension.** Click the puzzle-piece icon in Chrome's toolbar and pin Fill It so
it's one click away.

**3. On an application, click the icon → Fill this page.**

- 🟢 **Green outline** — filled.
- 🟠 **Amber outline** — it didn't recognise that field, so fill it yourself.

**4. It learns as you go.** Fill something in by hand and submit. Fill It notices and asks
whether to remember it. You review every answer before anything is saved.

To fix a value or add a field later: extension icon → **Edit fields**.

---

## How it works

```
  install
     │
     ▼
  welcome page ──► add your details (options page)
     │
     ▼
  you go apply somewhere
     │
     ├─ on a known job site, Fill It watches quietly in the background
     ▼
  you fill by hand and submit
     │
     ▼
  "Save 6 answers to Fill It?"  [Review] [Not now]
     │
     ▼
  next application → icon → Fill → done
```

Matching is plain text comparison. For each field on the page it works out the label
(`aria-labelledby` → `<label for>` → parent `<label>` → `aria-label` → `placeholder` → `name`),
normalises it, and scores it against the aliases on each of your saved fields. Best score above
the threshold wins. That's the whole algorithm — you can read it in
[`lib/match.js`](lib/match.js).

Auto-detect runs on Greenhouse, Lever, Ashby, Workday, iCIMS, Workable, SmartRecruiters,
Jobvite, BambooHR, Breezy and Recruitee. On any other site, open the popup and press
**Enable auto-detect here**. The manual **Fill this page** button works everywhere regardless.

---

## Install

Not yet on the Chrome Web Store. To run it now:

1. Download or clone this repo
2. Go to `chrome://extensions`
3. Turn on **Developer mode** (top right)
4. **Load unpacked** → select this folder

---

## Privacy

Your data never leaves your browser. There is no server to send it to — the extension contains
no network code at all. Passwords are never read or stored.

Full policy: [PRIVACY.md](PRIVACY.md)

---

## Files

| File | Does |
|---|---|
| `manifest.json` | MV3 manifest |
| `popup.html` / `popup.js` | Toolbar popup — Fill, Save this form, review list |
| `options.html` / `options.js` | Field editor |
| `welcome.html` / `welcome.js` | Onboarding |
| `content.js` | Injected on click — scan, match, fill, combobox handling |
| `autodetect.js` | Runs on job sites — notices new answers, offers to save |
| `background.js` | Service worker — onboarding, badge, per-site opt-in |
| `lib/fields.js` | Default field list |
| `lib/match.js` | Label resolution + scoring |

## Known limits

- The phone **country-code** selector (the `+92` flag) isn't filled — it ignores synthetic mouse
  events. One click to set manually, and it usually infers correctly from your number anyway.
- Work-experience entries, resume file upload, and fields inside iframes aren't handled yet.

## Licence

MIT
