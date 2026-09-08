/* Sky Tycoon — UI layer. Keep DOM code separate from game.js for mobile reuse. */
(function () {
  const { AIRPORTS, PLANES, AMENITIES, QUESTS } = window.SKY_DATA;
  const S = window.SKY;
  let state = null;
  let selectedPlaneId = null;
  let selectedAirport = null;

  const $ = (id) => document.getElementById(id);

  // ---------- Anime / comic cast (inline SVG, no assets needed — mobile friendly) ----------
  // IDs stay penny/gus/mia/leo so old saves keep working; art + names are new.
  const NAMES = { penny: "Akari", gus: "Guts", mia: "Mira", leo: "Ren" };
  const ROLES = { penny: "Sky Captain", gus: "Chief Engineer", mia: "CFO Strategist", leo: "Star Attendant" };
  function mascotSVG(kind) {
    const outline = "#10152e";
    const burst = { penny: "#ff5d5d", gus: "#37d67a", mia: "#b388ff", leo: "#4cc3ff" }[kind] || "#ffb020";
    const halftone = Array.from({ length: 8 }, (_, i) => `<circle cx="${20 + i * 22}" cy="238" r="3" fill="#ffffff30"/>`).join("");
    const base = (inner) => `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${NAMES[kind] || kind}">
      <circle cx="100" cy="112" r="88" fill="${burst}" opacity=".28"/>
      <circle cx="100" cy="112" r="88" fill="none" stroke="${burst}" stroke-width="5" stroke-dasharray="14 10" opacity=".9"/>
      ${halftone}${inner}</svg>`;
    if (kind === "penny") return base(`
      <path d="M100 18 L122 44 L170 40 L138 62 L150 105 L100 88 L50 105 L62 62 L30 40 L78 44 Z" fill="#ff7a3d" stroke="${outline}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M150 105 Q168 160 148 210 L128 205 Q140 160 132 110 Z" fill="#ff7a3d" stroke="${outline}" stroke-width="4"/>
      <ellipse cx="100" cy="120" rx="46" ry="52" fill="#ffd9b8" stroke="${outline}" stroke-width="5"/>
      <path d="M56 108 Q60 62 100 58 Q140 62 144 108 Q128 84 100 86 Q72 84 56 108" fill="#2b1a12" stroke="${outline}" stroke-width="4"/>
      <path d="M48 44 L152 44 L146 16 L54 16 Z" fill="#1c2a52" stroke="${outline}" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="100" cy="32" r="10" fill="#ffb020" stroke="${outline}" stroke-width="4"/><path d="M88 32 L112 32 M100 24 L100 40" stroke="${outline}" stroke-width="3"/>
      <ellipse cx="80" cy="126" rx="14" ry="17" fill="#fff" stroke="${outline}" stroke-width="4"/><ellipse cx="120" cy="126" rx="14" ry="17" fill="#fff" stroke="${outline}" stroke-width="4"/>
      <circle cx="82" cy="130" r="7" fill="#b34700"/><circle cx="118" cy="130" r="7" fill="#b34700"/><circle cx="84" cy="128" r="2.5" fill="#fff"/><circle cx="120" cy="128" r="2.5" fill="#fff"/>
      <path d="M72 112 L88 110 M112 110 L128 112" stroke="${outline}" stroke-width="4" stroke-linecap="round"/>
      <path d="M84 152 Q100 164 116 152 Q100 158 84 152" fill="#7a2b1d" stroke="${outline}" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="60" cy="142" r="7" fill="#ff8c8c" opacity=".8"/><circle cx="140" cy="142" r="7" fill="#ff8c8c" opacity=".8"/>
      <path d="M62 200 L100 186 L138 200 L146 250 L54 250 Z" fill="#1c2a52" stroke="${outline}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M92 190 L100 214 L108 190" fill="#fff" stroke="${outline}" stroke-width="3"/><path d="M97 196 L100 214 L103 196" fill="#e33" />
      <path d="M62 200 L78 206 M138 200 L122 206" stroke="#ffb020" stroke-width="5" stroke-linecap="round"/>`);
    if (kind === "gus") return base(`
      <path d="M52 90 L64 40 L86 58 L100 28 L114 58 L136 40 L148 90 Q130 60 100 62 Q70 60 52 90" fill="#4a3220" stroke="${outline}" stroke-width="5" stroke-linejoin="round"/>
      <rect x="58" y="46" width="84" height="22" rx="11" fill="#26314f" stroke="${outline}" stroke-width="4"/><circle cx="80" cy="57" r="11" fill="#9be8ff" stroke="${outline}" stroke-width="3"/><circle cx="120" cy="57" r="11" fill="#9be8ff" stroke="${outline}" stroke-width="3"/>
      <ellipse cx="100" cy="128" rx="48" ry="54" fill="#e8b07e" stroke="${outline}" stroke-width="5"/>
      <path d="M60 118 L70 100 L90 104 L78 118 Z M140 118 L130 100 L110 104 L122 118 Z" fill="#4a3220" opacity=".9"/>
      <ellipse cx="80" cy="132" rx="13" ry="15" fill="#fff" stroke="${outline}" stroke-width="4"/><ellipse cx="120" cy="132" rx="13" ry="15" fill="#fff" stroke="${outline}" stroke-width="4"/>
      <circle cx="81" cy="135" r="6" fill="#0e5a4a"/><circle cx="119" cy="135" r="6" fill="#0e5a4a"/><circle cx="83" cy="133" r="2" fill="#fff"/><circle cx="121" cy="133" r="2" fill="#fff"/>
      <path d="M78 158 Q100 172 124 156 L118 168 Q100 180 82 168 Z" fill="#fff" stroke="${outline}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M58 200 L100 184 L142 200 L150 250 L50 250 Z" fill="#2f7a4d" stroke="${outline}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M78 192 L88 250 M122 192 L112 250" stroke="#ff8c42" stroke-width="7" stroke-linecap="round"/>
      <rect x="88" y="212" width="24" height="18" rx="4" fill="#ffb020" stroke="${outline}" stroke-width="3"/>`);
    if (kind === "mia") return base(`
      <path d="M54 120 Q48 60 100 52 Q152 60 146 120 L138 150 Q132 110 100 108 Q68 110 62 150 Z" fill="#191922" stroke="${outline}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M132 60 Q150 84 142 118" fill="none" stroke="#b388ff" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="100" cy="128" rx="46" ry="52" fill="#ffe3d0" stroke="${outline}" stroke-width="5"/>
      <rect x="62" y="118" width="34" height="26" rx="8" fill="#ffffffcc" stroke="${outline}" stroke-width="4"/><rect x="104" y="118" width="34" height="26" rx="8" fill="#ffffffcc" stroke="${outline}" stroke-width="4"/><path d="M96 130 L104 130" stroke="${outline}" stroke-width="5"/>
      <circle cx="79" cy="131" r="6" fill="#6a3df0"/><circle cx="121" cy="131" r="6" fill="#6a3df0"/><circle cx="81" cy="129" r="2" fill="#fff"/><circle cx="123" cy="129" r="2" fill="#fff"/>
      <path d="M86 156 Q100 162 114 156" stroke="${outline}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="142" cy="150" r="5" fill="#ffb020" stroke="${outline}" stroke-width="3"/>
      <path d="M60 198 L100 184 L140 198 L148 250 L52 250 Z" fill="#7a2048" stroke="${outline}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M100 184 L100 250" stroke="#ffffff55" stroke-width="4"/><path d="M84 200 L92 200 M108 200 L116 200" stroke="#ffb020" stroke-width="4" stroke-linecap="round"/>`);
    return base(`
      <path d="M52 96 Q58 44 100 40 Q142 44 148 96 L140 70 L128 92 L114 62 L100 88 L86 62 L72 92 L60 70 Z" fill="#2f7fe0" stroke="${outline}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M128 52 Q152 66 146 100" fill="none" stroke="#cfeaff" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="100" cy="128" rx="46" ry="52" fill="#ffd9b8" stroke="${outline}" stroke-width="5"/>
      <ellipse cx="80" cy="132" rx="14" ry="17" fill="#fff" stroke="${outline}" stroke-width="4"/><ellipse cx="120" cy="132" rx="14" ry="17" fill="#fff" stroke="${outline}" stroke-width="4"/>
      <circle cx="81" cy="136" r="7" fill="#1c5fd6"/><circle cx="119" cy="136" r="7" fill="#1c5fd6"/><circle cx="83" cy="133" r="2.5" fill="#fff"/><circle cx="121" cy="133" r="2.5" fill="#fff"/>
      <path d="M80 158 Q100 176 120 158 Q110 170 100 170 Q90 170 80 158" fill="#8c2b2b" stroke="${outline}" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="60" cy="146" r="7" fill="#ff8c8c" opacity=".8"/><circle cx="140" cy="146" r="7" fill="#ff8c8c" opacity=".8"/>
      <path d="M62 198 L100 184 L138 198 L146 250 L54 250 Z" fill="#0f6f8f" stroke="${outline}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M74 196 L126 196 L118 214 L82 214 Z" fill="#ff5d5d" stroke="${outline}" stroke-width="3"/>
      <path d="M60 210 L48 226 M140 210 L152 226" stroke="#ffb020" stroke-width="4" stroke-linecap="round"/>`);
  }
  const TIPS = [
    "Short hops with small planes = safe money. Whales need full seats!",
    "Watch runway size! Jumbos can't land on tiny strips.",
    "Biz + First seats print money — but need lounge + meals!",
    "Bad load factor? Lower the price or add Wi-Fi & screens.",
    "Extend a runway once, profit forever. Very tycoon!",
    "Keep an eye on condition — tired planes cost extra upkeep.",
  ];

  // ---------- helpers ----------
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast"; el.textContent = msg;
    $("toast-wrap").appendChild(el);
    setTimeout(() => el.remove(), 3800);
  }
  function openModal(html, mascot) {
    $("modal-body").innerHTML = html;
    $("modal-mascot").innerHTML = `<div class="mascot small">${mascotSVG(mascot || state.mascot)}</div>`;
    $("modal-backdrop").classList.remove("hidden");
  }
  function closeModal() { $("modal-backdrop").classList.add("hidden"); }

  function project(lat, lon) {
    const x = ((lon + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  }

  // ---------- init ----------
  function sidekickLine(key) {
    const lines = {
      penny: "Plot bold routes! Long-haul pays big if you fill the seats — check range + fair price first.",
      leo: "Pick a hub with heart! High-demand airports forgive rookie pricing. Tap any dot for details.",
      gus: "Steel birds need love. Buy efficient, repair under 60%, and never send a Jumbo to a tiny strip!",
      "gus-shop": "My hangar rule: start nimble (A220/737), then go widebody once a route prints cash.",
      mia: "Money lesson: hangars + loans bleed daily. Grow routes before you grow debt!",
      "mia-base": "Cheap bases (ANC/JNB/GRU) train you up. Rich hubs (LHR/JFK) pay off once your rep is high.",
    };
    return lines[key] || lines.penny;
  }
  function sidekickChar(key) { return key === "gus-shop" ? "gus" : key === "mia-base" ? "mia" : key; }
  function renderSidekicks() {
    document.querySelectorAll("[data-sidekick]").forEach((el) => {
      const key = el.dataset.sidekick, ch = sidekickChar(key);
      el.innerHTML = `<div class="mascot">${mascotSVG(ch)}</div>
        <div><span class="comic-name">${NAMES[ch]} • ${ROLES[ch]}</span><p>${sidekickLine(key)}</p></div>`;
    });
  }
  function bindNav() {
    const handler = (b) => (e) => { e.preventDefault(); switchTab(b.dataset.tab); };
    document.querySelectorAll("#sidenav .nav-btn").forEach((b) => { b.onclick = handler(b); });
    const bottom = $("bottomnav");
    if (bottom && !bottom.dataset.built) {
      bottom.dataset.built = "1";
      bottom.innerHTML = [...document.querySelectorAll("#sidenav .nav-btn")]
        .map((b) => `<button type="button" data-tab="${b.dataset.tab}" class="nav-btn ${b.classList.contains("active") ? "active" : ""}">${b.innerHTML}</button>`).join("");
    }
    document.querySelectorAll("#bottomnav .nav-btn").forEach((b) => { b.onclick = handler(b); });
    // delegated fallback: any current or future [data-tab] button switches tabs
    document.removeEventListener("click", tabDelegate);
    document.addEventListener("click", tabDelegate);
  }
  function tabDelegate(e) {
    const btn = e.target.closest ? e.target.closest("[data-goto-tab]") : null;
    if (btn) { e.preventDefault(); switchTab(btn.dataset.gotoTab); }
  }
  function init() {
    if (init._done) return; init._done = true;
    // hub selects
    $("input-hub").innerHTML = AIRPORTS.map((a) => `<option value="${a.code}">${a.code} — ${a.city}</option>`).join("");
    $("input-hub").value = "JFK";
    $("splash-crew").innerHTML = ["penny", "gus", "mia", "leo"].map((k) => `<div class="crew-card"><div class="mascot">${mascotSVG(k)}</div><b>${NAMES[k]}</b><span>${ROLES[k]}</span></div>`).join("");
    renderSidekicks();
    let ti = 0;
    setInterval(() => { const el = $("splash-tip-text"); if (el && $("screen-splash").classList.contains("active")) { ti++; el.textContent = TIPS[ti % TIPS.length]; } }, 4000);

    const saved = S.load();
    if (saved) $("btn-continue").classList.remove("hidden");

    $("btn-start").onclick = () => {
      S.wipe();
      state = S.newGame({ company: $("input-airline").value || "Pixel Air", hub: $("input-hub").value, difficulty: $("input-difficulty").value, livery: $("input-livery").value, mascot: $("input-mascot").value });
      S.save(state);
      enterGame();
      toast(`🎉 ${state.company} founded at ${state.hub}!`);
    };
    $("btn-continue").onclick = () => { state = S.load(); if (state) enterGame(); };

    $("modal-close").onclick = closeModal;
    $("modal-backdrop").onclick = (e) => { if (e.target.id === "modal-backdrop") closeModal(); };

    // nav (hardened: direct binding + bottom mirror + delegation)
    bindNav();

    $("btn-next-day").onclick = () => advance(1);
    $("btn-next-week").onclick = () => advance(7);
    $("btn-menu").onclick = () =>
      openModal(`<h3>☰ Manager menu</h3>
        <p><b>${state.company}</b> • Day ${state.day}</p>
        <div class="row gap wrap">
          <button class="btn small" onclick="window.__skyNew()">🔄 New game</button>
          <button class="btn small" onclick="window.__skySave()">💾 Save</button>
          <button class="btn small danger" onclick="window.__skyWipe()">🗑️ Erase save</button>
        </div>
        <p class="tiny muted">Progress autosaves daily to this device (localStorage). On mobile this maps to app storage.</p>`);
    window.__skyNew = () => { location.reload(); };
    window.__skySave = () => { S.save(state); closeModal(); toast("💾 Saved!"); };
    window.__skyWipe = () => { S.wipe(); location.reload(); };

    $("shop-filter").onchange = renderShop;
    $("shop-sort").onchange = renderShop;
    ["route-from", "route-to", "route-plane", "route-price", "route-freq"].forEach((id) => $(id).addEventListener("change", updateRoutePreview));
    $("route-price").addEventListener("input", updateRoutePreview);
    $("btn-create-route").onclick = createRoute;
    $("btn-loan").onclick = () => { state.loan += 5000000; state.cash += 5000000; S.save(state); renderAll(); toast("🏦 +$5M loan. Interest is 5%/day!"); };
    $("btn-repay").onclick = () => {
      if (state.loan <= 0) return toast("No debt!");
      const amt = Math.min(1000000, state.loan, state.cash);
      state.loan -= amt; state.cash -= amt; S.save(state); renderAll();
    };
    $("btn-marketing").onclick = () => {
      if (state.cash < 25000) return toast("Not enough cash!");
      state.cash -= 25000; state.rep = Math.min(100, state.rep + 2); S.save(state); renderAll(); toast("📣 Ads are live! +Rep");
    };
    // real map controls
    if ($("map-search")) $("map-search").addEventListener("input", () => drawMap());
    if ($("map-filter")) $("map-filter").addEventListener("change", () => drawMap());
    if ($("btn-map-toggle")) $("btn-map-toggle").onclick = () => {
      mapMode = mapMode === "real" ? "schematic" : "real";
      if (mapMode === "schematic") toast("📐 Offline schematic mode");
      drawMap();
    };
  }

  function enterGame() {
    $("screen-splash").classList.remove("active");
    $("screen-game").classList.add("active");
    document.body.className = "livery-" + state.livery;
    $("route-from").innerHTML = AIRPORTS.map((a) => `<option>${a.code}</option>`).join("");
    $("route-to").innerHTML = AIRPORTS.map((a) => `<option>${a.code}</option>`).join("");
    $("route-from").value = state.hub; $("route-to").value = state.hub === "JFK" ? "LAX" : "JFK";
    renderAll();
  }

  function switchTab(name) {
    if (!name || !$("tab-" + name)) return;
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    $("tab-" + name).classList.add("active");
    document.querySelectorAll("#sidenav .nav-btn, #bottomnav .nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    if (name === "map") drawMap();
    $("content").scrollTo ? $("content").scrollTo({ top: 0 }) : window.scrollTo(0, 0);
  }
  // expose for inline/delegated buttons
  window.__skyTab = switchTab;

  // ---------- simulation ----------
  function advance(days) {
    for (let i = 0; i < days; i++) {
      const { entry, notes, event, rewards } = S.simulateDay(state);
      notes.forEach((n) => toast(n));
      if (event) openModal(`<h3>🎲 Daily event</h3><p>${event.text}</p>`, "penny");
      rewards.forEach((r) => toast(r));
      if (state.cash < 0) {
        openModal(`<h3>😱 Bankrupt?!</h3><p><b>Mira</b> says: cash is negative (${S.fmt$(state.cash)}). Sell a plane or take a loan, boss — or start over from the menu!</p>`, "mia");
        break;
      }
    }
    renderAll();
  }

  // ---------- render ----------
  function renderAll() {
    if (!state) return;
    $("airline-name").textContent = state.company;
    $("airline-badge").textContent = state.company.slice(0, 2).toUpperCase();
    $("date-line").textContent = `Day ${state.day} • Hub: ${state.hub} • Loan: ${S.fmtCompact(state.loan)}`;
    $("stat-cash").textContent = (state.cash < 0 ? "-" : "") + "$" + S.fmtCompact(Math.abs(state.cash));
    $("stat-cash").style.color = state.cash < 0 ? "#ff7b7b" : "";
    $("stat-rep").textContent = state.rep;
    $("stat-sat").textContent = state.sat + "%";
    $("stat-fleet").textContent = state.fleet.length;

    $("hq-mascot").innerHTML = mascotSVG(state.mascot);
    const adv = state.fleet.length === 0 ? "Guts here! Grab a cheap jet in 🛒 Buy — the ATR-72 is cheap and cheerful!" :
      state.routes.length === 0 ? "Akari here! Open a route in 🧭 Routes — try a short hop from your hub!" :
      TIPS[state.day % TIPS.length];
    $("hq-greeting").innerHTML = `<span class="comic-name">${NAMES[state.mascot]} • ${ROLES[state.mascot]}</span><br>Day ${state.day} — reporting, boss!`;
    $("hq-advice").textContent = adv;
    $("quest-box").innerHTML = QUESTS.map((q) => {
      const done = !!state.questsDone[q.id];
      return `<div class="quest ${done ? "done" : ""}">${done ? "✅" : "🎯"} ${q.text}${q.reward ? ` (+$${q.reward.toLocaleString()})` : ""}</div>`;
    }).join("");
    $("event-log").innerHTML = state.log.slice(0, 12).map((l) => `<div>${l}</div>`).join("") || "<div class='muted'>No flights yet.</div>";

    const d = state.lastDaily;
    $("kpi-row").innerHTML = d ? `
      <div class="kpi"><span class="tiny muted">Revenue</span><b>${S.fmtCompact(d.revenue)}</b></div>
      <div class="kpi"><span class="tiny muted">Costs</span><b>-${S.fmtCompact(Object.values(d.costs).reduce((a, b) => a + b, 0))}</b></div>
      <div class="kpi"><span class="tiny muted">Profit</span><b style="color:${d.profit >= 0 ? "#37d67a" : "#ff7b7b"}">${d.profit >= 0 ? "+" : ""}${S.fmtCompact(d.profit)}</b></div>
      <div class="kpi"><span class="tiny muted">Pax</span><b>${d.pax.toLocaleString()}</b></div>` :
      `<div class="kpi"><span class="tiny muted">Status</span><b>New!</b></div><div class="kpi"><span class="tiny muted">Cash</span><b>${S.fmtCompact(state.cash)}</b></div>`;
    drawChart();

    $("dashboard-fleet-strip").innerHTML = state.fleet.length ? state.fleet.map(fleetChip).join("") : `<div class="card">No planes yet — <button type="button" class="btn small primary" data-goto-tab="shop">Go shopping 🛒</button></div>`;

    renderFleet(); renderShop(); renderRoutes(); renderBases(); renderFinance();
    if ($("tab-map").classList.contains("active")) drawMap();
  }

  function fleetChip(p) {
    const m = S.planeModel(p.modelId);
    return `<div class="pill">✈️ ${p.tail} ${m.name} • ${p.base} • ${Math.round(p.condition)}%</div>`;
  }

  function drawChart() {
    const c = $("profit-chart"), ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    const h = state.history.slice(-30);
    ctx.fillStyle = "#ffffff10"; ctx.fillRect(0, 0, c.width, c.height);
    if (!h.length) { ctx.fillStyle = "#9db1d4"; ctx.font = "20px sans-serif"; ctx.fillText("Fly a day to see profits here!", 120, 110); return; }
    const max = Math.max(...h.map((x) => Math.abs(x.profit)), 1);
    const bw = c.width / h.length;
    h.forEach((x, i) => {
      const bh = (Math.abs(x.profit) / max) * 90;
      ctx.fillStyle = x.profit >= 0 ? "#37d67a" : "#ff5d5d";
      const y = x.profit >= 0 ? 110 - bh : 110;
      ctx.fillRect(i * bw + 2, y, bw - 4, bh);
    });
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 110, c.width, 2);
  }

  // ----- world map: real Leaflet map (OurAirports Big-Map style) + offline schematic fallback -----
  let leafletMap = null, leafletLayers = null, mapMode = "real"; // "real" | "schematic"
  function mapFiltered() {
    const q = ($("map-search") && $("map-search").value || "").trim().toLowerCase();
    const f = ($("map-filter") && $("map-filter").value) || "all";
    return AIRPORTS.filter((a) => {
      if (f === "hubs" && a.demand < 75) return false;
      if (f === "bases" && !state.bases[a.code] && a.code !== state.hub) return false;
      if (q && !(a.code + " " + (a.icao || "") + " " + a.city + " " + a.country).toLowerCase().includes(q)) return false;
      return true;
    });
  }
  function drawMap() {
    const count = $("map-count");
    if (count) count.textContent = AIRPORTS.length + "";
    const useReal = mapMode === "real" && window.L;
    $("leaflet-map").classList.toggle("hidden", !useReal);
    $("worldmap-wrap").classList.toggle("hidden", useReal);
    if (useReal) drawLeafletMap();
    else drawSchematic();
    if (selectedAirport) selectAirport(selectedAirport, true);
    else if (!useReal) $("airport-detail").innerHTML = `<p class="muted">Your hub is <b>${state.hub}</b>. Dashed lines are your routes. Tap any airport for fees, demand & hangar options.</p>`;
  }
  function drawLeafletMap() {
    try {
      if (!leafletMap) {
        leafletMap = L.map("leaflet-map", { worldCopyJump: true }).setView([25, 10], 2);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18, attribution: "© OpenStreetMap contributors • Airports: OurAirports (public domain)",
        }).addTo(leafletMap);
      }
      setTimeout(() => leafletMap && leafletMap.invalidateSize(), 60);
    } catch (e) { mapMode = "schematic"; drawSchematic(); return; }
    if (leafletLayers) leafletLayers.forEach((l) => leafletMap.removeLayer(l));
    leafletLayers = [];
    const mk = (latlng, opts) => { const l = L.circleMarker(latlng, opts); l.addTo(leafletMap); leafletLayers.push(l); return l; };
    // routes first (under markers)
    for (const r of state.routes) {
      try {
        const A = S.airport(r.from), B = S.airport(r.to);
        const line = L.polyline([[A.lat, A.lon], [B.lat, B.lon]], { color: "#ffb020", weight: 2.5, dashArray: "8 6", opacity: 0.9 });
        line.addTo(leafletMap); leafletLayers.push(line);
      } catch (e) {}
    }
    for (const ap of mapFiltered()) {
      const isHub = ap.code === state.hub, isBase = !!state.bases[ap.code];
      const color = isHub ? "#ffb020" : isBase ? "#37d67a" : "#4cc3ff";
      const m = mk([ap.lat, ap.lon], {
        radius: isHub ? 11 : 5 + Math.round(ap.demand / 18),
        color: "#fff", weight: 2, fillColor: color, fillOpacity: 0.95,
      });
      m.bindTooltip(`<b>${ap.code}</b> ${ap.city}`, { direction: "top" });
      m.bindPopup(`<b>🛬 ${ap.code} — ${ap.city}</b><br><span style="color:#555">${ap.country} • Demand ${ap.demand} • Fee $${ap.fee}</span><br><button data-pop="${ap.code}">Open in HQ ▸</button>`);
      m.on("popupopen", () => {
        const btn = document.querySelector(`[data-pop="${ap.code}"]`);
        if (btn) btn.onclick = () => { selectAirport(ap.code); leafletMap.closePopup(); $("airport-detail").scrollIntoView({ behavior: "smooth", block: "nearest" }); };
      });
      m.on("click", () => selectAirport(ap.code));
    }
    if (selectedAirport) {
      const a = S.airport(selectedAirport);
      if (a && !leafletMap._skyCentered) { leafletMap.setView([a.lat, a.lon], 4); leafletMap._skyCentered = true; }
    }
  }
  function drawSchematic() {
    const svg = $("worldmap");
    // stylized continents: simple blobs so it works offline (no tiles needed — mobile friendly)
    const land = `M60,180 Q120,120 220,150 Q300,170 320,230 Q260,300 150,290 Q70,260 60,180
      M330,120 Q420,90 500,120 Q540,170 500,230 Q420,260 340,220 Q310,160 330,120
      M540,140 Q640,110 740,150 Q800,220 730,300 Q620,330 550,260 Q520,190 540,140
      M740,320 Q820,300 860,360 Q830,430 750,420 Q710,370 740,320
      M150,320 Q230,310 250,380 Q200,450 130,420 Q110,360 150,320`;
    let html = `<rect width="1000" height="500" fill="#0e2a55"/>
      <path d="${land}" fill="#1e4d2e" stroke="#37d67a" stroke-width="3" opacity=".9"/>
      <g font-size="22">🌊</g>`;
    // routes
    for (const r of state.routes) {
      const a = project(S.airport(r.from).lat, S.airport(r.from).lon);
      const b = project(S.airport(r.to).lat, S.airport(r.to).lon);
      html += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#ffb020" stroke-width="2.5" stroke-dasharray="8 6" opacity=".85"/>`;
    }
    for (const ap of mapFiltered()) {
      const p = project(ap.lat, ap.lon);
      const isHub = ap.code === state.hub, isBase = !!state.bases[ap.code];
      const color = isHub ? "#ffb020" : isBase ? "#37d67a" : "#4cc3ff";
      const r = isHub ? 10 : 6;
      html += `<g class="ap" data-code="${ap.code}" style="cursor:pointer">
        <circle cx="${p.x}" cy="${p.y}" r="${r + 5}" fill="${color}" opacity=".25"/>
        <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${color}" stroke="#fff" stroke-width="2"/>
        <text x="${p.x}" y="${p.y - r - 5}" text-anchor="middle" fill="#fff" font-size="11" font-weight="800">${ap.code}</text>
      </g>`;
    }
    // hub plane emoji
    const hubP = project(S.airport(state.hub).lat, S.airport(state.hub).lon);
    html += `<text x="${hubP.x + 16}" y="${hubP.y + 6}" font-size="24">✈️</text>`;
    svg.innerHTML = html;
    svg.querySelectorAll(".ap").forEach((g) => {
      g.addEventListener("click", () => selectAirport(g.dataset.code));
    });
    if (selectedAirport) selectAirport(selectedAirport, true);
    else $("airport-detail").innerHTML = `<p class="muted">Your hub is <b>${state.hub}</b>. Lines are your routes. Tap any airport for fees, demand & hangar options.</p>`;
  }

  function selectAirport(code, keep) {
    selectedAirport = code;
    const a = S.airport(code);
    const has = !!state.bases[code];
    const rw = S.runwayLevel(state, code);
    const upgradeCost = (rw + 1) * 400000;
    $("airport-detail").innerHTML = `<div class="preview-box">
      <b>🛬 ${a.code}${a.icao ? ` (${a.icao})` : ""} — ${a.city}, ${a.country}</b> <span class="pill">Demand ${a.demand}</span> <span class="pill">Fee $${a.fee}/flight</span> <span class="pill">Runway Lv ${rw}</span>
      <br><span class="muted small">${a.desc}</span>
      ${a.icao ? `<br><a class="tiny" href="https://ourairports.com/airports/${a.icao}/" target="_blank" rel="noopener">View real airport data on OurAirports ↗</a>` : ""}
      <div class="row gap wrap" style="margin-top:8px">
        ${has ? `<span class="pill">✅ Hangar owned ($${a.hangarCost}/day)</span>` : `<button class="btn small primary" data-act="hangar">🏢 Rent hangar ($${(a.hangarCost * 30).toLocaleString()} + $${a.hangarCost}/day)</button>`}
        <button class="btn small" data-act="runway">🛠️ Extend runway → Lv ${rw + 1} (${S.fmtCompact(upgradeCost)})</button>
        <button class="btn small" data-act="route">🧭 New route from here</button>
      </div></div>`;
    $("airport-detail").querySelector('[data-act=route]')?.addEventListener("click", () => { $("route-from").value = code; switchTab("routes"); updateRoutePreview(); });
    const hb = $("airport-detail").querySelector('[data-act=hangar]');
    if (hb) hb.onclick = () => {
      const upfront = a.hangarCost * 30;
      if (state.cash < upfront) return toast("Not enough cash!");
      state.cash -= upfront; state.bases[code] = { hangar: true, runwayBonus: 0 };
      S.save(state); renderAll(); selectAirport(code, true); toast(`🏢 Base opened at ${code}!`);
    };
    $("airport-detail").querySelector('[data-act=runway]').onclick = () => {
      if (state.cash < upgradeCost) return toast("Not enough cash!");
      state.cash -= upgradeCost; state.runway[code] = (state.runway[code] || 0) + 1;
      S.save(state); renderAll(); selectAirport(code, true); toast(`🛠️ ${code} runway → Lv ${rw + 1}`);
    };
  }

  // ----- fleet -----
  function renderFleet() {
    if (!state.fleet.length) { $("fleet-list").innerHTML = `<p class="muted">No planes. Visit 🛒 Buy.</p>`; $("plane-detail").innerHTML = ""; return; }
    $("fleet-list").innerHTML = state.fleet.map((p) => {
      const m = S.planeModel(p.modelId);
      const route = state.routes.find((r) => r.planeId === p.id);
      return `<div class="plane-card">
        <h4>✈️ ${p.tail} — ${m.name}</h4>
        <div class="tiny muted">${m.size} • ${m.capacity} seats • ${m.rangeKm.toLocaleString()} km • Base ${p.base}</div>
        <div class="bar" style="margin:8px 0"><i style="width:${p.condition}%"></i></div>
        <div class="tiny">Condition ${Math.round(p.condition)}% ${p.grounded > 0 ? `• 🔧 grounded ${p.grounded}d` : ""} ${route ? `• 🧭 ${route.from}→${route.to}` : "• 💤 idle"}</div>
        <div class="row gap" style="margin-top:8px">
          <button class="btn small primary" data-manage="${p.id}">Manage seats & perks</button>
          <button class="btn small" data-maintain="${p.id}">🔧 Fix ($${Math.round((100 - p.condition) * 900).toLocaleString()})</button>
          <button class="btn small danger" data-sell="${p.id}">Sell</button>
        </div></div>`;
    }).join("");
    $("fleet-list").querySelectorAll("[data-manage]").forEach((b) => (b.onclick = () => openPlaneDetail(b.dataset.manage)));
    $("fleet-list").querySelectorAll("[data-maintain]").forEach((b) => (b.onclick = () => {
      const p = state.fleet.find((x) => x.id === b.dataset.maintain);
      const cost = Math.round((100 - p.condition) * 900);
      if (state.cash < cost) return toast("Not enough cash!");
      state.cash -= cost; p.condition = 100; S.save(state); renderAll(); toast("🔧 Sparkling clean!");
    }));
    $("fleet-list").querySelectorAll("[data-sell]").forEach((b) => (b.onclick = () => {
      const i = state.fleet.findIndex((x) => x.id === b.dataset.sell);
      const p = state.fleet[i];
      const m = S.planeModel(p.modelId);
      const val = Math.round(m.price * 0.7 * (p.condition / 100));
      state.routes = state.routes.filter((r) => r.planeId !== p.id);
      state.fleet.splice(i, 1); state.cash += val;
      selectedPlaneId = null; $("plane-detail").innerHTML = "";
      S.save(state); renderAll(); toast(`💰 Sold for ${S.fmt$(val)}`);
    }));
    if (selectedPlaneId) openPlaneDetail(selectedPlaneId, true);
  }

  function openPlaneDetail(id, silent) {
    selectedPlaneId = id;
    const p = state.fleet.find((x) => x.id === id);
    if (!p) return;
    const m = S.planeModel(p.modelId);
    const seats = p.seats;
    $("plane-detail").innerHTML = `<div class="card"><div class="row between wrap">
      <h3>🛠️ ${p.tail} seating & amenities</h3><span class="pill">${m.name}</span></div>
      <p class="tiny muted">Slide classes: Economy fits most, Business pays 2.2×, First pays 4× but eats space. Watch the capacity meter!</p>
      <div class="grid-2">
        <label class="field"><span>Economy % (${seats.eco})</span><input type="range" id="seat-eco" min="40" max="100" value="${seats.eco}"></label>
        <label class="field"><span>Business % (${seats.biz})</span><input type="range" id="seat-biz" min="0" max="40" value="${seats.biz}"></label>
      </div>
      <label class="field"><span>First % (${seats.first})</span><input type="range" id="seat-first" min="0" max="20" value="${seats.first}"></label>
      <div id="seat-meter" class="preview-box"></div>
      <h4>Amenities (per passenger)</h4>
      <div class="amen-grid">${AMENITIES.map((a) => `<button class="amen ${(p.amenities || []).includes(a.id) ? "on" : ""}" data-amen="${a.id}" title="${a.desc}"><b>${a.name}</b><br><span class="tiny">${a.costPerPax >= 0 ? "+$" + a.costPerPax : "$" + a.costPerPax + " fuel save"} • +${a.appeal} appeal</span></button>`).join("")}</div>
      <div class="row gap" style="margin-top:10px">
        <label class="field" style="flex:1"><span>Home base</span><select id="plane-base">${Object.keys(state.bases).map((c) => `<option ${c === p.base ? "selected" : ""}>${c}</option>`).join("")}</select></label>
        <button id="btn-plane-save" class="btn primary">Save</button>
      </div></div>`;
    const upd = () => {
      let eco = +$("seat-eco").value, biz = +$("seat-biz").value, first = +$("seat-first").value;
      const tot = eco + biz + first || 1;
      eco = Math.round((eco / tot) * 100); biz = Math.round((biz / tot) * 100); first = 100 - eco - biz;
      const fake = { seats: { eco, biz, first } };
      const cap = Math.round(m.capacity * S.seatCapacityFactor(fake));
      const rev = S.seatRevenueMult(fake);
      $("seat-meter").innerHTML = `Effective seats: <b>${cap}</b> / ${m.capacity} • Revenue multiplier: <b>${rev.toFixed(2)}×</b>`;
      $("seat-meter").dataset.eco = eco; $("seat-meter").dataset.biz = biz; $("seat-meter").dataset.first = first;
    };
    ["seat-eco", "seat-biz", "seat-first"].forEach((i) => ($(i).oninput = upd));
    upd();
    $("plane-detail").querySelectorAll("[data-amen]").forEach((b) => (b.onclick = () => {
      const id2 = b.dataset.amen;
      p.amenities = p.amenities || [];
      p.amenities = p.amenities.includes(id2) ? p.amenities.filter((x) => x !== id2) : [...p.amenities, id2];
      S.save(state); openPlaneDetail(id, true);
    }));
    $("btn-plane-save").onclick = () => {
      p.seats = { eco: +$("seat-meter").dataset.eco, biz: +$("seat-meter").dataset.biz, first: +$("seat-meter").dataset.first };
      p.base = $("plane-base").value;
      // sync amenities to routes using this plane
      state.routes.forEach((r) => { if (r.planeId === p.id) r.amenities = [...(p.amenities || [])]; });
      S.save(state); renderAll(); toast("✅ Cabin saved!");
    };
    if (!silent) $("plane-detail").scrollIntoView({ behavior: "smooth" });
  }

  // ----- shop -----
  function renderShop() {
    const f = $("shop-filter").value, sort = $("shop-sort").value;
    let list = PLANES.filter((p) => f === "all" || p.size === f);
    list.sort((a, b) => sort === "price" ? a.price - b.price : sort === "capacity" ? b.capacity - a.capacity : b.rangeKm - a.rangeKm);
    $("shop-list").innerHTML = list.map((m) => {
      const afford = state.cash >= m.price;
      return `<div class="plane-card">
        <h4>${m.size === "Jumbo" ? "🐳" : m.size === "Widebody" ? "🛫" : "✈️"} ${m.name}</h4>
        <div><span class="pill">${m.size}</span> <span class="pill">${m.capacity} seats</span> <span class="pill">${m.rangeKm.toLocaleString()} km</span></div>
        <p class="small muted">${m.desc}<br>Fuel $${m.fuelPerKm}/km • Upkeep $${m.upkeep}/day • Needs runway Lv ${m.sizeReq}</p>
        <div class="row between"><b>${S.fmt$(m.price)}</b>
        <span class="row gap"><select id="buy-base-${m.id}" class="small" style="width:auto;min-height:40px">${Object.keys(state.bases).map((c) => `<option>${c}</option>`).join("")}</select>
        <button class="btn small ${afford ? "primary" : ""}" data-buy="${m.id}" ${afford ? "" : "disabled"}>Buy</button></span></div>
      </div>`;
    }).join("");
    $("shop-list").querySelectorAll("[data-buy]").forEach((b) => (b.onclick = () => {
      const base = $("buy-base-" + b.dataset.buy).value;
      const r = S.buyPlane(state, b.dataset.buy, base);
      toast(r.msg); renderAll();
    }));
  }

  // ----- routes -----
  function refreshRoutePlaneOptions() {
    const free = state.fleet.filter((p) => !state.routes.some((r) => r.planeId === p.id));
    const used = state.fleet.filter((p) => state.routes.some((r) => r.planeId === p.id));
    $("route-plane").innerHTML =
      free.map((p) => { const m = S.planeModel(p.modelId); return `<option value="${p.id}">${p.tail} ${m.name} (${m.rangeKm.toLocaleString()}km)</option>`; }).join("") ||
      `<option value="">No free planes!</option>`;
    if (used.length) $("route-plane").innerHTML += `<optgroup label="Busy">${used.map((p) => `<option value="${p.id}" disabled>${p.tail} (busy)</option>`).join("")}</optgroup>`;
  }

  function updateRoutePreview() {
    refreshRoutePlaneOptions();
    const from = $("route-from").value, to = $("route-to").value;
    const pid = $("route-plane").value;
    const price = +$("route-price").value || 0, freq = +$("route-freq").value || 7;
    if (from === to) { $("route-preview").innerHTML = "Pick two <b>different</b> airports!"; return; }
    const plane = state.fleet.find((f) => f.id === pid);
    const dist = S.routeDistance(from, to);
    const amen = plane ? plane.amenities : [];
    const fc = pid && plane ? S.forecast(state, from, to, price, plane.modelId, amen, freq) : S.forecast(state, from, to, price, "a320", [], freq);
    const fair = Math.round(60 + dist * 0.09);
    $("route-preview").innerHTML = `📏 <b>${dist.toLocaleString()} km</b> • Fair price ≈ <b>$${fair}</b><br>` +
      (fc.ok ? `👥 Demand pool <b>${fc.paxPerWeek.toLocaleString()}/wk</b> • Load <b>${Math.round(fc.loadFactor * 100)}%</b> • Est. revenue <b>${S.fmtCompact(fc.paxPerWeek * price * 0.8)}/wk</b>`
        : `⚠️ <b>${fc.reason}</b>`);
  }

  function createRoute() {
    const from = $("route-from").value, to = $("route-to").value, pid = $("route-plane").value;
    const price = Math.max(49, +$("route-price").value || 200), freq = Math.min(21, Math.max(1, +$("route-freq").value || 7));
    if (from === to) return toast("Pick two different airports!");
    const plane = state.fleet.find((f) => f.id === pid);
    if (!plane) return toast("Buy a free airplane first!");
    if (state.routes.some((r) => r.planeId === pid)) return toast("That plane is already flying!");
    const fc = S.forecast(state, from, to, price, plane.modelId, plane.amenities, freq);
    if (!fc.ok) return toast("Can't open: " + fc.reason);
    const fee = 10000 + S.routeDistance(from, to) * 5;
    if (state.cash < fee) return toast("Need " + S.fmt$(fee) + " for landing rights!");
    state.cash -= fee;
    state.routes.push({ id: "r-" + Math.random().toString(36).slice(2, 7), from, to, planeId: pid, price, freq, amenities: [...(plane.amenities || [])], lastPax: 0, lastRev: 0, lastLF: 0 });
    S.checkQuests(state); S.save(state); renderAll();
    toast(`🧭 Route ${from}→${to} open! (-${S.fmt$(fee)} rights)`);
  }

  function renderRoutes() {
    updateRoutePreview();
    if (!state.routes.length) { $("routes-list").innerHTML = `<p class="muted">No routes yet. Open one! 👈</p>`; return; }
    $("routes-list").innerHTML = state.routes.map((r) => {
      const p = state.fleet.find((f) => f.id === r.planeId);
      const m = p ? S.planeModel(p.modelId) : null;
      return `<div class="preview-box">
        <div class="row between wrap"><b>🧭 ${r.from} → ${r.to}</b><span class="pill">${Math.round((r.lastLF || 0) * 100)}% full</span></div>
        <div class="tiny muted">${p ? `${p.tail} ${m.name}` : "no plane"} • $${r.price} • ${r.freq}/wk • yesterday: ${(r.lastPax || 0).toLocaleString()} pax, ${S.fmtCompact(r.lastRev || 0)}</div>
        <div class="row gap wrap" style="margin-top:8px">
          <label class="tiny">Price <input type="number" data-price="${r.id}" value="${r.price}" style="width:90px;min-height:40px"></label>
          <button class="btn small" data-close="${r.id}">Close route</button>
          <button class="btn small danger" data-unassign="${r.id}">Free plane</button>
        </div></div>`;
    }).join("");
    $("routes-list").querySelectorAll("[data-price]").forEach((i) => (i.onchange = () => {
      const r = state.routes.find((x) => x.id === i.dataset.price);
      r.price = Math.max(49, +i.value || r.price); S.save(state); renderAll();
    }));
    $("routes-list").querySelectorAll("[data-close]").forEach((b) => (b.onclick = () => {
      state.routes = state.routes.filter((x) => x.id !== b.dataset.close);
      S.save(state); renderAll(); toast("Route closed.");
    }));
    $("routes-list").querySelectorAll("[data-unassign]").forEach((b) => (b.onclick = () => {
      const r = state.routes.find((x) => x.id === b.dataset.unassign);
      // close route but keep plane: same as close for now
      state.routes = state.routes.filter((x) => x.id !== r.id);
      S.save(state); renderAll(); toast("Plane is free again!");
    }));
  }

  // ----- bases -----
  function renderBases() {
    $("bases-list").innerHTML = AIRPORTS.map((a) => {
      const has = !!state.bases[a.code];
      const rw = S.runwayLevel(state, a.code);
      const based = state.fleet.filter((f) => f.base === a.code).length;
      return `<div class="base-card">
        <h4>${a.code === state.hub ? "⭐" : has ? "🏢" : "🛬"} ${a.code} — ${a.city}</h4>
        <div class="tiny muted">${a.desc}</div>
        <div class="tiny" style="margin:6px 0">Demand ${a.demand} • Fee $${a.fee} • Runway Lv ${rw} • Rent $${a.hangarCost}/day • ${based} plane(s)</div>
        <div class="row gap wrap">
          ${has ? `<span class="pill">✅ base</span>` : `<button class="btn small" data-base="${a.code}">Rent ($${(a.hangarCost * 30).toLocaleString()})</button>`}
          <button class="btn small" data-rw="${a.code}">Extend (${S.fmtCompact((rw + 1) * 400000)})</button>
          <button class="btn small" data-view="${a.code}">View on map</button>
        </div></div>`;
    }).join("");
    $("bases-list").querySelectorAll("[data-base]").forEach((b) => (b.onclick = () => {
      const a = S.airport(b.dataset.base);
      if (state.cash < a.hangarCost * 30) return toast("Not enough cash!");
      state.cash -= a.hangarCost * 30; state.bases[a.code] = { hangar: true, runwayBonus: 0 };
      S.save(state); renderAll();
    }));
    $("bases-list").querySelectorAll("[data-rw]").forEach((b) => (b.onclick = () => {
      const code = b.dataset.rw, rw = S.runwayLevel(state, code), cost = (rw + 1) * 400000;
      if (state.cash < cost) return toast("Not enough cash!");
      state.cash -= cost; state.runway[code] = (state.runway[code] || 0) + 1;
      S.save(state); renderAll();
    }));
    $("bases-list").querySelectorAll("[data-view]").forEach((b) => (b.onclick = () => { switchTab("map"); selectAirport(b.dataset.view); }));
  }

  // ----- finance -----
  function renderFinance() {
    const d = state.lastDaily;
    const totCost = d ? Object.values(d.costs).reduce((a, b) => a + b, 0) : 0;
    $("finance-summary").innerHTML = d ? `
      <div class="kpi-row">
        <div class="kpi"><span class="tiny muted">Cash</span><b>${S.fmtCompact(state.cash)}</b></div>
        <div class="kpi"><span class="tiny muted">Debt</span><b>${S.fmtCompact(state.loan)}</b></div>
        <div class="kpi"><span class="tiny muted">Total pax</span><b>${state.totalPax.toLocaleString()}</b></div>
        <div class="kpi"><span class="tiny muted">Lifetime</span><b>${S.fmtCompact(state.totalProfit)}</b></div>
      </div>
      <table class="ledger">
        <tr><th>Yesterday</th><th>$</th></tr>
        <tr><td>🎟️ Ticket revenue</td><td>+${d.revenue.toLocaleString()}</td></tr>
        <tr><td>⛽ Fuel</td><td>-${d.costs.fuel.toLocaleString()}</td></tr>
        <tr><td>🛬 Landing fees</td><td>-${d.costs.fees.toLocaleString()}</td></tr>
        <tr><td>🔧 Upkeep</td><td>-${d.costs.upkeep.toLocaleString()}</td></tr>
        <tr><td>🍱 Amenities</td><td>-${d.costs.amenity.toLocaleString()}</td></tr>
        <tr><td>🏢 Hangars + staff</td><td>-${(d.costs.hangar + d.costs.staff).toLocaleString()}</td></tr>
        <tr><td>🏦 Interest</td><td>-${d.costs.interest.toLocaleString()}</td></tr>
        <tr><td><b>Profit</b></td><td><b>${d.profit >= 0 ? "+" : ""}${d.profit.toLocaleString()}</b></td></tr>
      </table>` : `<p class="muted">Fly at least one day to see the breakdown.</p>`;
    $("bank-box").innerHTML = `<p>Debt: <b>${S.fmt$(state.loan)}</b> (5% daily interest = ${S.fmt$(state.loan * 0.05)}/day)</p>`;
    $("ledger").innerHTML = state.ledger.length ? `<table class="ledger"><tr><th>Day</th><th>Rev</th><th>Cost</th><th>Profit</th></tr>${state.ledger.map((e) => `<tr><td>${e.day}</td><td>${S.fmtCompact(e.revenue)}</td><td>${S.fmtCompact(Object.values(e.costs).reduce((a, b) => a + b, 0))}</td><td style="color:${e.profit >= 0 ? "#37d67a" : "#ff7b7b"}">${S.fmtCompact(e.profit)}</td></tr>`).join("")}</table>` : `<p class="muted">—</p>`;
  }

  document.addEventListener("DOMContentLoaded", init);
  // script sits at end of body: if DOM already parsed, init now
  if (document.readyState !== "loading") init();
})();
