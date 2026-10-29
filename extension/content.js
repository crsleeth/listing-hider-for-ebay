// Runs on eBay pages. Hides search results that match the user's block rules.
(() => {
  const api = globalThis.browser ?? globalThis.chrome;
  const CARD_SELECTOR = "li.s-card[data-listingid], li.s-item";

  let rules = { hiddenIds: {}, sellers: [], keywords: [], showHidden: false };

  // ---- reading a card ----

  function listingId(card) {
    if (card.dataset.listingid) return card.dataset.listingid;
    const link = card.querySelector('a[href*="/itm/"]');
    const m = link && link.href.match(/\/itm\/(?:[^/?]+\/)?(\d+)/);
    return m ? m[1] : null;
  }

  function title(card) {
    const el = card.querySelector(".s-card__title .su-styled-text, .s-card__title, .s-item__title");
    return el ? el.textContent.trim() : "";
  }

  // Card text minus our own buttons, used for keyword matching.
  function cardText(card) {
    const clone = card.cloneNode(true);
    clone.querySelectorAll(".elh-controls").forEach((e) => e.remove());
    return clone.textContent.replace(/Opens in a new window or tab/g, " ");
  }

  // The seller shows as "name 99.6% positive (12K)", sometimes in one span,
  // sometimes split across two, so read the whole row around the rating.
  function seller(card) {
    for (const span of card.querySelectorAll("span")) {
      if (span.children.length || !/% positive/.test(span.textContent)) continue;
      const row = span.parentElement.textContent.trim();
      const m = row.match(/(\S+)\s+[\d.]+% positive/);
      if (m) return m[1].toLowerCase();
    }
    const legacy = card.querySelector(".s-item__seller-info-text");
    return legacy ? legacy.textContent.trim().split(/\s+/)[0].toLowerCase() : null;
  }

  // ---- matching ----

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // A keyword matches at the start of a word: "dent" hits "dent", "dents",
  // "dented" but not "student" or "accident".
  let keywordRegexes = [];
  function buildKeywordRegexes() {
    keywordRegexes = rules.keywords
      .map((k) => k.trim())
      .filter(Boolean)
      .map((k) => ({ word: k, re: new RegExp("(^|[^a-z0-9])" + escapeRegex(k), "i") }));
  }

  function hideReason(card) {
    const id = listingId(card);
    if (id && rules.hiddenIds[id]) return "Hidden by you";
    const s = seller(card);
    if (s && rules.sellers.includes(s)) return "Blocked seller: " + s;
    const text = cardText(card);
    for (const { word, re } of keywordRegexes) {
      if (re.test(text)) return 'Keyword: "' + word + '"';
    }
    return null;
  }

  // ---- UI on each card ----

  function addControls(card) {
    if (card.querySelector(".elh-controls")) return;
    const id = listingId(card);
    if (!id || !title(card) || /^Shop on eBay$/i.test(title(card))) return;

    const box = document.createElement("div");
    box.className = "elh-controls";

    const reason = document.createElement("span");
    reason.className = "elh-reason";

    const hideBtn = document.createElement("button");
    hideBtn.className = "elh-btn";
    hideBtn.type = "button";
    hideBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleListing(card);
    });

    box.append(reason, hideBtn);

    const s = seller(card);
    if (s) {
      const sellerBtn = document.createElement("button");
      sellerBtn.className = "elh-btn elh-seller-btn";
      sellerBtn.type = "button";
      sellerBtn.title = "Hide every listing from " + s;
      sellerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSeller(s);
      });
      box.append(sellerBtn);
    }

    card.append(box);
  }

  function updateCard(card) {
    addControls(card);
    const reason = hideReason(card);
    card.classList.toggle("elh-hidden", !!reason);
    const box = card.querySelector(".elh-controls");
    if (!box) return;
    box.querySelector(".elh-reason").textContent = reason || "";
    const id = listingId(card);
    box.querySelector(".elh-btn:not(.elh-seller-btn)").textContent =
      rules.hiddenIds[id] ? "Unhide" : "✕ Hide";
    const sellerBtn = box.querySelector(".elh-seller-btn");
    if (sellerBtn) {
      sellerBtn.textContent = rules.sellers.includes(seller(card)) ? "Unblock seller" : "Block seller";
    }
  }

  function updateAll() {
    document.body.classList.toggle("elh-show-hidden", rules.showHidden);
    const cards = document.querySelectorAll(CARD_SELECTOR);
    let hidden = 0;
    cards.forEach((c) => {
      updateCard(c);
      if (c.classList.contains("elh-hidden")) hidden++;
    });
    updateBar(hidden);
  }

  // ---- floating counter ----

  function updateBar(hidden) {
    let bar = document.getElementById("elh-bar");
    if (!hidden) {
      bar?.remove();
      return;
    }
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "elh-bar";
      bar.innerHTML = '<span></span><button type="button"></button>';
      bar.querySelector("button").addEventListener("click", () =>
        save({ showHidden: !rules.showHidden })
      );
      document.body.append(bar);
    }
    bar.querySelector("span").textContent = hidden + " listing" + (hidden === 1 ? "" : "s") + " hidden";
    bar.querySelector("button").textContent = rules.showHidden ? "Hide them" : "Show";
  }

  // ---- actions ----

  function toggleListing(card) {
    const id = listingId(card);
    const hiddenIds = { ...rules.hiddenIds };
    if (hiddenIds[id]) delete hiddenIds[id];
    else hiddenIds[id] = { title: title(card), at: Date.now() };
    save({ hiddenIds });
  }

  function toggleSeller(s) {
    const sellers = rules.sellers.includes(s)
      ? rules.sellers.filter((x) => x !== s)
      : [...rules.sellers, s];
    save({ sellers });
  }

  function save(patch) {
    Object.assign(rules, patch);
    buildKeywordRegexes();
    updateAll();
    api.storage.local.set(patch);
  }

  // ---- startup ----

  api.storage.local.get(rules).then((stored) => {
    rules = { ...rules, ...stored };
    buildKeywordRegexes();
    updateAll();

    // eBay loads some results after the page is ready; catch those too.
    let pending = false;
    const isOurs = (node) =>
      node.nodeType === 1 && (node.id === "elh-bar" || node.closest?.(".elh-controls, #elh-bar"));
    new MutationObserver((mutations) => {
      // Ignore changes to our own buttons, or we'd loop forever.
      const relevant = mutations.some(
        (m) => !isOurs(m.target) && ![...m.addedNodes, ...m.removedNodes].every(isOurs)
      );
      if (!relevant || pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        updateAll();
      });
    }).observe(document.body, { childList: true, subtree: true });
  });

  // Rules edited in the popup apply right away.
  api.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    for (const [k, { newValue }] of Object.entries(changes)) rules[k] = newValue;
    buildKeywordRegexes();
    updateAll();
  });
})();
