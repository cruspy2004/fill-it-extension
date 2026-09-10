# Chrome Web Store listing — copy/paste

## Name
Fill It — Job Application Autofill

## Short description (132 char max)
Fills job applications with details you saved yourself. No AI, no servers, no account. Your data never leaves your browser.

## Category
Productivity / Workflow & Planning

## Detailed description

Stop retyping your name, email and phone on every job application.

Fill It stores your details once and writes them into any application form with a single
click — Greenhouse, Lever, Ashby, Workday, your own company's careers page, anywhere.

HOW IT WORKS
1. Fill out one form to teach it, then click the icon. It offers to remember what you typed —
   tick what you want kept, click Save.
2. Every application after that: click the icon → "Fill this page."
3. Green outline means filled. Anything it didn't recognise shows up right in the popup as a
   small box to type into — click Save & fill and it lands on the page and gets remembered.

WHAT MAKES IT DIFFERENT
• No AI. It never invents an answer. It only ever writes values you gave it yourself.
• No servers. The extension contains no network code — it literally cannot send your data
  anywhere.
• No account, no sign-up, no paywall, no redirect to another website.
• Installs with no special permission warning — it only ever touches the tab you're looking at,
  and only when you click the button.
• Open source. Read exactly what it does: github.com/cruspy2004/fill-it-extension

PRIVACY
Your details are kept in Chrome's own storage and sync through the Google account you're
already signed into, the same way your bookmarks do. Passwords are never read or stored.
Payment fields are never touched. There is no analytics, no telemetry, and nothing is sold.

KNOWN LIMITS
The phone country-code selector isn't filled automatically. Cover letters and other long
free-text boxes stay unfilled by design.

## Permission justifications (dashboard asks for each)

storage
  Saves the fields the user entered so they persist between sessions and sync across devices.

activeTab + scripting
  Used only when the user clicks "Fill this page" — reads and fills the tab the user is
  actively looking at. No background access to any page, no host permissions requested.

## Data disclosure form answers

Does your extension collect personally identifiable information?
  YES — name, email address, phone number, postal address (entered by the user themselves).

Does it collect health / financial / authentication / personal communications / location /
web history / user activity?
  NO to all.

I certify that:
  [x] I do not sell or transfer user data to third parties, outside of approved use cases
  [x] I do not use or transfer user data for purposes unrelated to my item's single purpose
  [x] I do not use or transfer user data to determine creditworthiness or for lending purposes

Privacy policy URL
  https://cruspy2004.github.io/fill-it-extension/   (live, verified 200)

## Build

Run ./build.sh -> fill-it-v1.0.0.zip (upload this).

## Assets still needed
- [ ] Screenshot 1280x800 — the welcome page's practice form
- [ ] Screenshot 1280x800 — a real form mid-fill, showing green/amber outlines and the
      unmatched-field table in the popup
- [ ] Screenshot 1280x800 — the options page with fields filled in
- [ ] (optional) 440x280 small promo tile

## Chrome Web Store account — your question
The $5 fee is one-time, per developer account, not per extension. It covers up to 20
published items on that account; you can request a higher limit if you ever need it. No
renewal, no per-extension charge.
