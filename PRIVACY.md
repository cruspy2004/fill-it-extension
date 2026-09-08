# Privacy Policy — Fill It

**Effective date:** 8 September 2026
**Contact:** h1grow.copy@gmail.com

## Short version

Fill It does not have a server. It cannot send your data anywhere, because it never makes a
network request. Everything you enter stays inside your own browser.

## What is collected

Fill It stores only the information you type into it, or explicitly approve when it offers to
remember something. That typically includes:

- Name (first, middle, last, preferred)
- Email address and phone number
- Links you choose to save (LinkedIn, GitHub, portfolio)
- Postal address
- Voluntary equal-opportunity answers, if you choose to save them
- Any custom field you create yourself

## What is never collected

- **Passwords.** Fields of type `password` are excluded from filling, reading, and saving.
- Payment or credit card fields (any field marked `autocomplete="cc-*"`).
- Browsing history, page content, analytics, telemetry, or crash reports.

## How it is stored

Saved fields are held in `chrome.storage.sync`, which is Chrome's own storage. If you are
signed into Chrome, Chrome syncs it between your devices under your Google account, the same
way it syncs your bookmarks. Draft snapshots used by the auto-detect feature are held in
`chrome.storage.local` and never leave the device.

The developer has no access to any of it.

## How it is shared

It isn't. There are no third parties, no analytics providers, no advertising, and no sale of
data. Fill It contains no network code of any kind.

## Permissions and why

| Permission | Why |
|---|---|
| `storage` | Save your fields |
| `activeTab` + `scripting` | Fill the page you're looking at, only when you click the button |
| Host access to job sites | Notice when you've filled a form so it can offer to remember it |
| `optional_host_permissions` | Only requested if you press "Enable auto-detect here" on a site |

## Your control

Open the extension's options page to view, edit, or delete any saved field. Removing the
extension deletes everything it stored.

## Changes

Any change to this policy will be published at this URL with an updated effective date.
