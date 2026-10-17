import { sourceLabel } from "./util.mjs";
const $ = (id) => document.getElementById(id);
const api = async (path, body) => {
  const r = await fetch(`${window.TORA_API}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${$("token").value.trim()}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || r.status);
  return j;
};
const row = (text, btn) => { const d = document.createElement("div"); d.className = "card"; d.append(text, " "); if (btn) d.append(btn); return d; };
const button = (label, fn) => { const b = document.createElement("button"); b.textContent = label; b.onclick = fn; return b; };

async function refresh() {
  try {
    const o = await api("/admin/overview");
    $("status").textContent = ""; $("panel").hidden = false;
    $("budget").textContent = `${o.month_cost_usd.toFixed(2)} $ von ${o.budget_usd} $ verbraucht`;
    $("sources").replaceChildren(...o.sources.map((s) => row(`${sourceLabel(s.name)}: ${s.enabled ? "an" : "aus"}`,
      button(s.enabled ? "Ausschalten" : "Einschalten", async () => { await api("/admin/sources", { name: s.name, enabled: !s.enabled }); refresh(); }))));
    $("codes").replaceChildren(...o.codes.map((c) => row(`${c.label} – ${c.code} – heute ${c.used_today}/${c.daily_limit} – ${c.active ? "aktiv" : "gesperrt"}`,
      button(c.active ? "Sperren" : "Entsperren", async () => { await api("/admin/codes/active", { code: c.code, active: !c.active }); refresh(); }))));
  } catch (e) { $("status").textContent = "Das hat nicht geklappt – stimmt der Schlüssel?"; }
}
$("load").onclick = refresh;
$("add").onclick = async () => {
  try { await api("/admin/codes", { code: $("n-code").value, label: $("n-label").value, daily_limit: Number($("n-limit").value) }); $("n-code").value = ""; refresh(); }
  catch (e) { $("status").textContent = `Code nicht angelegt: ${e.message}`; }
};
