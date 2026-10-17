import { parsePlayerParams } from "./util.mjs";

const $ = (id) => document.getElementById(id);
const mmss = (s) => { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(x).padStart(2, "0"); };
const p = parsePlayerParams(location.search);

if (!p) {
  $("title").textContent = "Aufnahme nicht gefunden";
  $("status").textContent = "Dieser Link ist ungültig. Bitte öffne die Aufnahme über die Fragenseite.";
  $("audio").hidden = true; $("direct").hidden = true;
} else {
  const a = $("audio");
  $("title").textContent = p.title || "Aufnahme";
  $("info").textContent = p.t ? `Wiedergabe beginnt bei ${mmss(p.t)}.` : "";
  $("direct").href = p.src;
  a.src = p.src;
  const jump = () => { if (p.t && a.duration && Math.abs(a.currentTime - p.t) > 2) a.currentTime = Math.min(p.t, a.duration - 1); };
  a.addEventListener("loadedmetadata", () => {
    jump();
    a.play().catch(() => { $("play").hidden = false; $("status").textContent = "Tippe auf „Ab hier abspielen“."; });
  });
  a.addEventListener("error", () => { $("status").textContent = "Die Aufnahme konnte nicht geladen werden. Du kannst sie unten direkt öffnen."; });
  $("play").onclick = () => { jump(); a.play(); $("play").hidden = true; $("status").textContent = ""; };
}
