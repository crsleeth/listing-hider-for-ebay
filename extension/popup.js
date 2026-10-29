const api = globalThis.browser ?? globalThis.chrome;
const $ = (id) => document.getElementById(id);

const lines = (text) =>
  [...new Set(text.split("\n").map((s) => s.trim()).filter(Boolean))];

function render(r) {
  $("keywords").value = r.keywords.join("\n");
  $("sellers").value = r.sellers.join("\n");
  $("showHidden").checked = r.showHidden;
  $("count").textContent = Object.keys(r.hiddenIds).length;
}

function flashSaved() {
  $("saved").classList.add("on");
  setTimeout(() => $("saved").classList.remove("on"), 1200);
}

api.storage.local
  .get({ hiddenIds: {}, sellers: [], keywords: [], showHidden: false })
  .then(render);

$("save").addEventListener("click", async () => {
  await api.storage.local.set({
    keywords: lines($("keywords").value),
    sellers: lines($("sellers").value).map((s) => s.toLowerCase()),
  });
  flashSaved();
});

$("showHidden").addEventListener("change", (e) =>
  api.storage.local.set({ showHidden: e.target.checked })
);

// Popups can't reliably show confirm() dialogs (Firefox), so ask for a second click.
let clearArmed = null;
$("clear").addEventListener("click", async () => {
  const btn = $("clear");
  if (!clearArmed) {
    btn.textContent = "Click again to confirm";
    clearArmed = setTimeout(() => {
      clearArmed = null;
      btn.textContent = "Unhide all";
    }, 3000);
    return;
  }
  clearTimeout(clearArmed);
  clearArmed = null;
  btn.textContent = "Unhide all";
  await api.storage.local.set({ hiddenIds: {} });
  $("count").textContent = "0";
});
