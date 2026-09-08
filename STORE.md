# Chrome Web Store listing — copy/paste

## Name
Fill It — Job Application Autofill

## Short description (132 char max)
Fills job applications with details you saved yourself. No AI, no servers, no account. Your data never leaves your browser.
<!-- 128 chars -->

## Category
Productivity / Workflow & Planning

## Detailed description

Stop retyping your name, email and phone on every job application.

Fill It stores your details once and writes them into application forms with a single click.
It works on Greenhouse, Lever, Ashby, Workday, iCIMS, Workable, SmartRecruiters, Jobvite,
BambooHR, Breezy and Recruitee — and the manual fill button works on any site at all.

HOW IT WORKS
1. Add your details once — name, email, phone, LinkedIn, GitHub, address, or any custom field.
2. On an application, click the icon and press "Fill this page".
3. Green outline means filled. Amber means it didn't recognise that field, so fill it yourself.
4. Fill something in by hand and submit — Fill It notices and offers to remember it for next
   time. You review every answer before anything is saved.

WHAT MAKES IT DIFFERENT
• No AI. It never invents an answer. It only ever writes values you gave it yourself.
• No servers. The extension contains no network code — it literally cannot send your data
  anywhere.
• No account, no sign-up, no paywall, no redirect to another website.
• Open source. Read exactly what it does: github.com/cruspy2004/fill-it-extension

PRIVACY
Your details are kept in Chrome's own storage and sync through the Google account you're
already signed into, the same way your bookmarks do. Passwords are never read or stored.
Payment fields are never touched. There is no analytics, no telemetry, and nothing is sold.

KNOWN LIMITS
The phone country-code selector isn't filled automatically. Work-experience entries and resume
file upload aren't supported yet.

## Permission justifications (dashboard asks for each)

storage
  Saves the fields the user entered so they persist between sessions and sync across devices.

activeTab + scripting
  Used only when the user clicks "Fill this page" — injects the fill script into the tab the
  user is actively looking at. No background access to any page.

Host permissions (job board domains)
  Needed so the extension can notice when the user has filled in an application form and offer
  to remember the new answers. Limited to a fixed list of applicant tracking systems.

Optional host permissions
  Never requested at install. Only requested if the user explicitly presses "Enable auto-detect
  here" on a site of their choosing.

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
  https://cruspy2004.github.io/fill-it-extension/

## Assets still needed
- [ ] Screenshot 1280x800 — the welcome page
- [ ] Screenshot 1280x800 — a real form mid-fill, showing green/amber outlines
- [ ] Screenshot 1280x800 — the options page with fields filled in
- [ ] (optional) 440x280 small promo tile
