# Listing Hider for eBay

*Not affiliated with or endorsed by eBay Inc.*

A browser extension that removes listings you never want to see from eBay search results:

- **✕ Hide** on any listing hides that one listing for good.
- **Block seller** hides every listing from that seller.
- **Keywords** (set in the toolbar popup) hide any listing whose text contains them, e.g. `dent`, `scratch`, `crack`, `for parts`. A keyword matches the start of a word, so `dent` catches "Dents" and "dented" but not "student".
- A counter in the bottom-right corner shows how many listings are hidden on the page. Click **Show** to see them faded, with the reason each was hidden.

Your lists are stored only in your browser.

## Install in Chrome (or Edge, Brave)

1. Go to `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the `extension` folder in this project.
4. Pin the extension from the puzzle-piece menu so the popup is one click away.

## Install in Firefox

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and pick `extension/manifest.json`.

Firefox removes temporary add-ons when it restarts. To keep it installed permanently, sign it (free) at addons.mozilla.org as an unlisted add-on.

## Caveats

- Keywords match the whole card, including the subtitle. A listing that says "no scratches" is hidden by `scratch`. Use **Show** to check what got caught.
- eBay changes its page layout from time to time. If the buttons stop appearing, the selectors at the top of `extension/content.js` need updating.
