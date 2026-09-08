/* Sky Tycoon — core simulation. Pure logic, no DOM. Easy to reuse in mobile (Capacitor/React Native). */
(function (global) {
  const { AIRPORTS, PLANES, AMENITIES, EVENTS } = global.SKY_DATA;

  const SAVE_KEY = "sky-tycoon-save-v1";
  const DAY_ZERO = Date.UTC(2026, 0, 1);

  function uid(p) { return (p || "id") + "-" + Math.random().toString(36).slice(2, 8); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function airport(code) { return AIRPORTS.find((a) => a.code === code); }
  function planeModel(id) { return PLANES.find((p) => p.id === id); }

  function haversineKm(a, b) {
    const R = 6371, dLat = ((b.lat - a.lat) * Math.PI) / 180, dLon = ((b.lon - a.lon) * Math.PI) / 180;
    const la1 = (a.lat * Math.PI) / 180, la2 = (b.lat * Math.PI) / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function newGame(opts) {
    const startCash = opts.difficulty === "easy" ? 20000000 : opts.difficulty === "hard" ? 7000000 : 12000000;
    const hub = opts.hub || "JFK";
    return {
      v: 1, company: opts.company || "Pixel Air", hub, livery: opts.livery || "ocean", mascot: opts.mascot || "penny",
      cash: startCash, loan: 0, day: 1, rep: 50, sat: 70,
      fleet: [], routes: [],
      bases: { [hub]: { hangar: true, runwayBonus: 0 } },
      runway: {}, // code -> extra level purchased (airport base runway + bonus)
      history: [], ledger: [], log: [],
      modifiers: { demandBoostDays: 0, fuelMultDays: 0, fuelMult: 1 },
      questsDone: {}, totalPax: 0, totalProfit: 0,
      lastDaily: null,
    };
  }

  function save(s) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) {} }
  function load() { try { const raw = localStorage.getItem(SAVE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
  function wipe() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

  function runwayLevel(state, code) {
    const base = airport(code).runway;
    return base + (state.runway[code] || 0);
  }

  function routeDistance(from, to) { return Math.round(haversineKm(airport(from), airport(to))); }

  function amenityAppeal(route) {
    let a = 0;
    (route.amenities || []).forEach((id) => { const m = AMENITIES.find((x) => x.id === id); if (m) a += m.appeal; });
    return a;
  }
  function amenityCostPerPax(route) {
    let c = 0;
    (route.amenities || []).forEach((id) => { const m = AMENITIES.find((x) => x.id === id); if (m) c += m.costPerPax; });
    return c;
  }

  // Demand model: base from both airports, distance sweet-spot, price elasticity, rep/sat/amenities.
  function forecast(state, from, to, price, planeId, amenities, freq) {
    const A = airport(from), B = airport(to);
    const dist = routeDistance(from, to);
    const model = planeModel(planeId);
    if (!model) return { ok: false, reason: "No aircraft" };
    if (dist > model.rangeKm) return { ok: false, reason: `Out of range (${dist.toLocaleString()} km > ${model.rangeKm.toLocaleString()} km)` };
    if (model.sizeReq > runwayLevel(state, from) || model.sizeReq > runwayLevel(state, to))
      return { ok: false, reason: "Runway too short — extend runway" };

    const baseDemand = ((A.demand + B.demand) / 2) * 8; // daily pax pool
    const distFactor = dist < 800 ? 1.1 : dist < 4000 ? 1.0 : dist < 8000 ? 0.85 : 0.7;
    // fair price ≈ $60 + $0.09/km, first-class routes tolerate more
    const fair = 60 + dist * 0.09;
    const priceFactor = clamp(Math.pow(fair / Math.max(20, price), 1.4), 0.15, 2.2);
    const repFactor = 0.6 + state.rep / 125; // 50 rep → 1.0
    const satFactor = 0.7 + state.sat / 233;
    const amenFactor = 1 + amenityAppeal({ amenities }) / 120;
    const boost = state.modifiers.demandBoostDays > 0 ? 1.35 : 1;
    const weeklyPool = baseDemand * distFactor * priceFactor * repFactor * satFactor * amenFactor * boost * 7;
    const seatsPerWeek = model.capacity * (freq || 7) * seatCapacityFactor({ seats: { eco: 80, biz: 15, first: 5 } });
    const loadFactor = clamp(weeklyPool / Math.max(1, seatsPerWeek), 0.05, 1);
    const paxPerWeek = Math.round(Math.min(weeklyPool, seatsPerWeek));
    return { ok: true, dist, fair: Math.round(fair), weeklyPool: Math.round(weeklyPool), seatsPerWeek, loadFactor, paxPerWeek };
  }

  function seatCapacityFactor(plane) {
    // Biz takes 1.8x space, First 3x. Default eco-heavy = ~1.0.
    const s = plane.seats || { eco: 80, biz: 15, first: 5 };
    const total = s.eco + s.biz + s.first || 100;
    const eff = (s.eco + s.biz * 1.8 + s.first * 3) / total;
    return clamp(100 / (eff * 100) + 0.15, 0.5, 1.1);
  }

  function seatRevenueMult(plane) {
    const s = plane.seats || { eco: 80, biz: 15, first: 5 };
    const total = s.eco + s.biz + s.first || 100;
    // biz pays 2.2x, first pays 4x
    return (s.eco * 1 + s.biz * 2.2 + s.first * 4) / total;
  }

  function simulateDay(state) {
    const fuelMult = state.modifiers.fuelMultDays > 0 ? state.modifiers.fuelMult : 1;
    let revenue = 0, costs = { fuel: 0, fees: 0, upkeep: 0, amenity: 0, hangar: 0, staff: 0, interest: 0 };
    let paxTotal = 0, flights = 0;
    const notes = [];

    // decay temp modifiers
    if (state.modifiers.demandBoostDays > 0) state.modifiers.demandBoostDays--;
    if (state.modifiers.fuelMultDays > 0) state.modifiers.fuelMultDays--;

    for (const route of state.routes) {
      const plane = state.fleet.find((f) => f.id === route.planeId);
      if (!plane || plane.grounded > 0) { if (plane && plane.grounded > 0) plane.grounded--; continue; }
      const model = planeModel(plane.modelId);
      const A = airport(route.from), B = airport(route.to);
      const dist = routeDistance(route.from, route.to);
      if (dist > model.rangeKm) { notes.push(`⚠️ ${plane.tail} can't fly ${route.from}→${route.to}: out of range`); continue; }

      const dailyFreq = (route.freq || 7) / 7;
      const capFactor = seatCapacityFactor(plane);
      const seatsToday = Math.floor(model.capacity * capFactor * dailyFreq);
      const fc = forecast(state, route.from, route.to, route.price, plane.modelId, route.amenities, route.freq);
      const lf = fc.ok ? fc.loadFactor : 0.3;
      // small daily noise
      const noise = 0.9 + Math.random() * 0.2;
      const pax = Math.min(seatsToday, Math.round(((fc.weeklyPool || 0) / 7) * noise));
      const revMult = seatRevenueMult(plane);
      const rev = Math.round(pax * route.price * (0.55 + revMult * 0.45));
      const fuel = Math.round(dist * model.fuelPerKm * dailyFreq * fuelMult);
      const amen = Math.round(Math.max(0, amenityCostPerPax(route)) * pax);
      const fee = Math.round((A.fee + B.fee) * dailyFreq * (model.sizeReq >= 3 ? 1.6 : 1));
      const up = Math.round(model.upkeep * dailyFreq * (plane.condition < 60 ? 1.5 : 1));

      revenue += rev; costs.fuel += fuel; costs.amenity += amen; costs.fees += fee; costs.upkeep += up;
      paxTotal += pax; flights += dailyFreq;
      route.lastPax = pax; route.lastRev = rev; route.lastLF = seatsToday ? pax / seatsToday : 0;

      // wear & condition
      plane.condition = clamp(plane.condition - dailyFreq * 0.7, 5, 100);
      plane.miles = (plane.miles || 0) + dist * dailyFreq;
    }

    // hangar rent + staff
    for (const code of Object.keys(state.bases)) costs.hangar += airport(code).hangarCost;
    costs.staff = Math.round(1500 + state.fleet.length * 900 + state.routes.length * 500);
    if (state.loan > 0) costs.interest = Math.round(state.loan * 0.05);

    const totalCost = Object.values(costs).reduce((a, b) => a + b, 0);
    const profit = revenue - totalCost;
    state.cash = Math.round(state.cash + profit);
    state.totalPax += paxTotal; state.totalProfit += profit;
    state.day++;

    // rep/sat drift toward performance
    const avgLF = state.routes.length ? state.routes.reduce((a, r) => a + (r.lastLF || 0), 0) / state.routes.length : 0.5;
    const amenAvg = state.routes.length ? state.routes.reduce((a, r) => a + amenityAppeal(r), 0) / state.routes.length : 0;
    state.sat = clamp(Math.round(state.sat + (avgLF > 0.75 ? 1 : avgLF < 0.35 ? -2 : 0) + (amenAvg > 12 ? 1 : 0)), 5, 100);
    state.rep = clamp(Math.round(state.rep + (profit > 0 ? 1 : -1) + (avgLF > 0.8 ? 1 : 0)), 0, 100);

    // random event ~18%
    let event = null;
    if (Math.random() < 0.18 && state.day > 3) {
      event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      applyEvent(state, event);
    }

    const entry = { day: state.day - 1, revenue, costs: { ...costs }, profit, pax: Math.round(paxTotal) };
    state.lastDaily = entry;
    state.history.push({ day: entry.day, profit, revenue });
    if (state.history.length > 90) state.history.shift();
    state.ledger.unshift(entry);
    if (state.ledger.length > 14) state.ledger.pop();

    const logLine = `Day ${entry.day}: ${paxTotal.toLocaleString()} pax, ${profit >= 0 ? "+" : ""}$${profit.toLocaleString()}`;
    state.log.unshift(logLine);
    if (state.log.length > 30) state.log.pop();
    if (event) state.log.unshift(`🎲 ${event.text}`);

    // quests
    const rewards = checkQuests(state);
    save(state);
    return { entry, notes, event, rewards };
  }

  function applyEvent(state, event) {
    if (event.effect.rep) state.rep = clamp(state.rep + event.effect.rep, 0, 100);
    if (event.effect.sat) state.sat = clamp(state.sat + event.effect.sat, 0, 100);
    if (event.effect.cash) state.cash += event.effect.cash;
    if (event.effect.boost) state.modifiers.demandBoostDays = event.effect.boost;
    if (event.effect.fuelMult) { state.modifiers.fuelMult = event.effect.fuelMult; state.modifiers.fuelMultDays = event.effect.days; }
    if (event.effect.repair) {
      state.cash -= event.effect.repair;
      const flyable = state.fleet.filter((f) => !(f.grounded > 0));
      if (flyable.length) flyable[0].grounded = 2;
    }
  }

  function checkQuests(state) {
    const out = [];
    global.SKY_DATA.QUESTS.forEach((q) => {
      if (!state.questsDone[q.id] && q.check(state)) {
        state.questsDone[q.id] = true;
        if (q.reward) { state.cash += q.reward; out.push(`${q.badge || "🎯"} Quest: "${q.text}" +$${q.reward.toLocaleString()}`); }
        else out.push(`${q.badge || "🎯"} Quest complete: "${q.text}"`);
      }
    });
    return out;
  }

  function buyPlane(state, modelId, baseCode) {
    const model = planeModel(modelId);
    if (!model) return { ok: false, msg: "Unknown plane" };
    if (!state.bases[baseCode]) return { ok: false, msg: "Rent a hangar there first!" };
    if (state.cash < model.price) return { ok: false, msg: "Not enough cash — try a loan!" };
    if (model.sizeReq > runwayLevel(state, baseCode)) return { ok: false, msg: "Runway too short at " + baseCode };
    state.cash -= model.price;
    const count = state.fleet.length + 1;
    const tail = "SK-" + String(100 + count);
    state.fleet.push({ id: uid("ac"), modelId, tail, base: baseCode, condition: 100, miles: 0, grounded: 0, seats: { eco: 80, biz: 15, first: 5 }, amenities: [] });
    checkQuests(state); save(state);
    return { ok: true, msg: `${model.name} (${tail}) delivered to ${baseCode}!` };
  }

  global.SKY = {
    newGame, save, load, wipe, simulateDay, forecast, buyPlane, applyEvent, checkQuests,
    airport, planeModel, routeDistance, runwayLevel, seatCapacityFactor, seatRevenueMult,
    amenityAppeal, amenityCostPerPax, SAVE_KEY,
    fmt$: (n) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString(),
    fmtCompact: (n) => {
      const a = Math.abs(n);
      if (a >= 1e6) return (n / 1e6).toFixed(1) + "M";
      if (a >= 1e3) return (n / 1e3).toFixed(0) + "k";
      return String(Math.round(n));
    },
  };
})(window);
