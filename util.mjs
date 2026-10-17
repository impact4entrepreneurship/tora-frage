const NAMES = { "tora-tief": "Tora Tiefe", verwurzelt: "verwurzelt.eu", tonarchiv: "Lapide Tonarchiv", evernote: "Michaels Notizen" };
export const sourceLabel = (s) => NAMES[s] ?? s;
export const linkify = (u) => (/^https?:\/\//i.test(u) ? u : "");
