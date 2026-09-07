const rowsEl = document.getElementById("rows");
let fields = [];

function makeKey(label) {
  return "custom_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
}

function renderRows() {
  rowsEl.innerHTML = "";
  fields.forEach((field, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" data-i="${i}" data-f="label" value="${escapeAttr(field.label)}"></td>
      <td><input type="text" data-i="${i}" data-f="value" value="${escapeAttr(field.value)}"></td>
      <td class="aliases"><input type="text" data-i="${i}" data-f="aliases" value="${escapeAttr((field.aliases || []).join(", "))}"></td>
      <td><button class="del" data-i="${i}" title="Remove">✕</button></td>
    `;
    rowsEl.appendChild(tr);
  });
}

function escapeAttr(s) {
  return (s || "").replace(/"/g, "&quot;");
}

rowsEl.addEventListener("input", (e) => {
  const i = Number(e.target.dataset.i);
  const f = e.target.dataset.f;
  if (f === "aliases") {
    fields[i].aliases = e.target.value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  } else {
    fields[i][f] = e.target.value;
  }
});

rowsEl.addEventListener("click", (e) => {
  if (!e.target.classList.contains("del")) return;
  const i = Number(e.target.dataset.i);
  fields.splice(i, 1);
  renderRows();
});

document.getElementById("add-row").addEventListener("click", () => {
  fields.push({ key: makeKey(), label: "", value: "", aliases: [] });
  renderRows();
});

document.getElementById("save").addEventListener("click", async () => {
  // drop fields with no label at all
  fields = fields.filter(f => f.label.trim());
  await chrome.storage.sync.set({ profile: fields });
  const msg = document.getElementById("saved-msg");
  msg.textContent = "Saved.";
  setTimeout(() => (msg.textContent = ""), 2000);
});

(async function init() {
  const { profile } = await chrome.storage.sync.get("profile");
  fields = profile && profile.length ? profile : DEFAULT_FIELDS.map(f => ({ ...f }));
  renderRows();
})();
