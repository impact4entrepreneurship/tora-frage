const NAMES = { "tora-tief": "Tora Tiefe", verwurzelt: "verwurzelt.eu", tonarchiv: "Lapide Tonarchiv", evernote: "Michaels Notizen" };
export const sourceLabel = (s) => NAMES[s] ?? s;
export const linkify = (u) => (/^https?:\/\//i.test(u) ? u : "");

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
