# Fill It

A Chrome extension that fills job applications with details you saved yourself.

No AI. No servers. No account. No redirect to somebody else's website. It only ever writes
values you gave it.

---

## How to use it

**1. Pin it.** Click the puzzle-piece icon in Chrome's toolbar and pin Fill It.

**2. Fill out one form to teach it.** Type your details into any form — a real application,
or the practice one on the welcome page — then click the Fill It icon. It offers to remember
what you typed. Tick what you want kept, click Save. You need to do this once before there's
anything to fill with.

**3. Every application after that: click the icon → Fill this page.**

- 🟢 **Green outline** — filled from what you saved.
- 🟠 **Amber outline** — didn't recognise it. It also shows up as a blank in the popup —
  type the answer there, click **Save & fill**, and it lands on the page and gets remembered
  for next time.

To edit or delete a saved value later: extension icon → **Edit fields**.

---

## How it works

```
   click [ Fill this page ]
        │
        ├─ 1. read what's already typed        (catches values you pre-filled by hand)
        ├─ 2. fill what it knows               green outlines
        │
        └─ 3. what it couldn't fill, right in the popup:
               ☑ How did you hear about us?  [___________]
               ☑ Years of experience         [___________]
                                              [ Save & fill ]
```

Matching is plain text comparison — no AI, nothing sent anywhere. For each field it works out
the label (`aria-labelledby` → `<label for>` → parent `<label>` → `aria-label` →
`placeholder` → `name`), normalises it, and scores it against the aliases on each of your
saved fields. Best score above the threshold wins. Read it yourself in
[`lib/match.js`](lib/match.js).

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

Full policy: **https://cruspy2004.github.io/fill-it-extension/** ([source](PRIVACY.md))

---

## Files

| File | Does |
|---|---|
| `manifest.json` | MV3 manifest |
| `popup.html` / `popup.js` | Toolbar popup — Fill, unmatched-field table |
| `options.html` / `options.js` | Field editor |
| `welcome.html` | Onboarding + practice form |
| `content.js` | Injected on click — scan, match, fill, combobox handling, write-back |
| `background.js` | Service worker — seeds defaults, opens onboarding on install |
| `lib/fields.js` | Default field list |
| `lib/match.js` | Label resolution + scoring |

## Known limits

- The phone **country-code** selector (the `+92` flag) isn't filled — it ignores synthetic mouse
  events. One click to set manually, and it usually infers correctly from your number anyway.
- Cover letters and other long free-text boxes stay amber — typing a paragraph into a small
  popup isn't useful, and it's never reusable anyway.
- Fields inside iframes aren't handled yet.

## Licence

MIT
