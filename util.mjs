const NAMES = { "tora-tief": "Tora Tiefe", verwurzelt: "verwurzelt.eu", tonarchiv: "Lapide Tonarchiv", evernote: "Michaels Notizen" };
export const sourceLabel = (s) => NAMES[s] ?? s;
export const linkify = (u) => (/^(https?:\/\/|evernote:\/\/\/view\/)/i.test(u) ? u : "");

export function splitBold(text) {
  const out = [];
  const re = /\*\*([^*\n]+)\*\*/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), bold: false });
    out.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), bold: false });
  return out;
}

export function splitSources(answer, sources) {
  const order = [];
  for (const m of String(answer).matchAll(/\[(\d+)\]/g)) {
    const n = Number(m[1]);
    if (!order.includes(n)) order.push(n);
  }
  const byNr = new Map(sources.map((s) => [s.nr, s]));
  const cited = order.filter((n) => byNr.has(n)).map((n) => byNr.get(n));
  return { cited, others: sources.filter((s) => !cited.includes(s)) };
}

const AUDIO_HOST = "audio.podigee-cdn.net";

/** Link zur eigenen Abspielseite (springt selbst an die Stelle – ein reines #t= im Link wirkt nicht in jedem Browser). */
export function playerLink(url, title) {
  const m = /^(https:\/\/audio\.podigee-cdn\.net\/[^#]+)(?:#t=(\d+))?$/.exec(url || "");
  if (!m) return "";
  return "player.html?" + new URLSearchParams({ src: m[1], t: m[2] || "0", title: title || "" }).toString();
}

export function parsePlayerParams(search) {
  const p = new URLSearchParams(search);
  let u;
  try { u = new URL(p.get("src") || ""); } catch { return null; }
  if (u.protocol !== "https:" || u.hostname !== AUDIO_HOST) return null;
  const t = Number(p.get("t"));
  return { src: u.toString(), t: Number.isFinite(t) && t > 0 ? Math.floor(t) : 0, title: p.get("title") || "" };
}
