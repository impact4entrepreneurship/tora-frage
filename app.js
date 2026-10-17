import { sourceLabel, linkify, splitBold, splitSources, playerLink } from "./util.mjs";

const $ = (id) => document.getElementById(id);
const EXAMPLES = ["Was bedeutet das Wort Schechina?", "Was ist ein Segen in der Tora?", "Was sagt die Tora über Gerechtigkeit?"];
const store = { get: (k) => { try { return localStorage.getItem(k) || ""; } catch { return ""; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

$("code").value = store.get("toraCode");
EXAMPLES.forEach((t) => {
  const b = document.createElement("button");
  b.type = "button"; b.textContent = t;
  b.onclick = () => { $("q").value = t; $("q").focus(); };
  $("examples").appendChild(b);
});

function card(s) {
  const el = document.createElement("div"); el.className = "card";
  const meta = document.createElement("div"); meta.className = "meta"; meta.textContent = `[${s.nr}] ${sourceLabel(s.source)}`;
  const h = document.createElement("h3"); h.dir = "auto"; h.textContent = s.title;
  const p = document.createElement("p"); p.dir = "auto"; p.textContent = s.excerpt;
  el.append(meta, h, p);
  const player = playerLink(s.url, s.title);
  const href = player || linkify(s.url);
  if (href) { const a = document.createElement("a"); a.href = href; a.target = "_blank"; a.rel = "noopener"; a.textContent = player ? "Aufnahme anhören (ab dieser Stelle)" : "Zur Quelle"; el.append(a); }
  return el;
}

$("go").onclick = async () => {
  const code = $("code").value.trim(), question = $("q").value.trim();
  if (!code || !question) { $("status").textContent = "Bitte gib Zugangscode und Frage ein."; return; }
  store.set("toraCode", code);
  $("go").disabled = true; $("status").textContent = "Ich suche in den Quellen …"; $("answer").hidden = true;
  try {
    const r = await fetch(`${window.TORA_API}/ask`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, question }) });
    const j = await r.json();
    if (!r.ok) { $("status").textContent = j.message || "Es ist ein Fehler aufgetreten."; return; }
    $("status").textContent = "";
    $("answer-text").replaceChildren(...splitBold(j.answer).map((s) => {
      if (!s.bold) return document.createTextNode(s.text);
      const b = document.createElement("strong"); b.textContent = s.text; return b;
    }));
    const { cited, others } = splitSources(j.answer, j.sources || []);
    const group = (title, list) => list.length ? [Object.assign(document.createElement("h3"), { className: "group", textContent: title }), ...list.map(card)] : [];
    $("sources").replaceChildren(...group("In der Antwort genutzt", cited), ...group(cited.length ? "Weitere Fundstellen" : "Fundstellen", others));
    $("sources-title").hidden = !(j.sources || []).length;
    $("answer").hidden = false;
  } catch {
    $("status").textContent = "Keine Verbindung. Bitte prüfe dein Internet und versuche es noch einmal.";
  } finally { $("go").disabled = false; }
};
