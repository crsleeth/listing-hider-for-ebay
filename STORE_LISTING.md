# Store listing text

Copy-paste text for the Chrome Web Store and Firefox Add-ons forms. Upload `dist/listing-hider-for-ebay-<version>.zip` (made by `./build.sh`); screenshots and icon are in `dist/store/`.

## Name
Listing Hider for eBay

## Summary (short description, max 132 characters)
Hide eBay listings you never want to see again: one click per listing, by seller, or by keyword. Not affiliated with eBay.

## Description
Tired of the same damaged or unwanted listings cluttering your eBay searches? Listing Hider for eBay lets you remove them for good.

• ✕ Hide: one click hides a listing from every future search.
• Block seller: hide every listing from a seller.
• Keywords: hide any listing containing words you choose, like "dent", "scratch" or "for parts". Useful when sellers call a damaged item "Good" but mention the damage in the title.
• A counter shows how many listings are hidden on the page. Click Show to see them faded, with the reason each was hidden, and unhide any of them.

Everything you hide is stored only in your browser. The extension collects no data, makes no network requests, and has no ads or tracking.

Works on eBay.com, .ca, .co.uk, .com.au, .de, .fr, .it, .es and .ie.

Listing Hider for eBay is an independent project and is not affiliated with, endorsed by, or sponsored by eBay Inc.

## Category
- Chrome: Shopping
- Firefox: Shopping

## Privacy policy URL
https://github.com/crsleeth/listing-hider-for-ebay/blob/main/PRIVACY.md

## Homepage / support URL
https://github.com/crsleeth/listing-hider-for-ebay

---

## Chrome: Privacy practices tab

**Single purpose**
Hides eBay search result listings that the user chooses to hide, by individual listing, by seller, or by keyword.

**Permission justification: storage**
Saves the user's hidden listings, blocked sellers and keywords locally so they stay hidden across searches and browser restarts.

**Permission justification: host permissions (eBay sites)**
The content script runs on eBay pages to add Hide and Block seller buttons to search results and hide the listings the user has chosen. It does not run on any other site.

**Remote code**
No, I am not using remote code.

**Data usage**
Check none of the data types. Certify all three statements (no selling data, no unrelated use, no creditworthiness use).

## Firefox: submission notes

- Distribution: **On this site** (listed).
- Source code: not required (no minified or generated code).
- Data collection: declared in the manifest as `none`.
- Notes to reviewer: "No build step; the uploaded zip is the `extension/` folder as-is."
