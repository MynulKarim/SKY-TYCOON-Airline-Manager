# ✈️ Sky Tycoon — Airline Manager

Cartoon airline tycoon in the style of Business Tycoon / Mafia City menus: chatty mascots, big buttons, quest guidance, and an empire-building loop.

**Features**
- 🌍 Real world map (Leaflet + OpenStreetMap, OurAirports Big-Map style) with 48 real airports — positions & ICAO codes from the OurAirports dataset, with search, demand filter, route lines, and an illustrated-map offline fallback
- 🛬 48 airports (JFK, LAX, LHR, HND, DXB, SIN…) — demand, landing fees, runway levels, each linking to its real OurAirports page
- 🛒 10 planes to buy & fly (ATR-72 → A380), each with price, capacity, range, fuel, upkeep, comfort
- 💺 Seating management: Economy / Business / First sliders (space vs revenue tradeoff)
- 🍱 6 amenities: Wi-Fi, Hot Meals, Seat Screens, Extra Legroom, Lounge, Eco Engines
- 🏢 Hangar rent + runway extensions per airport, daily fixed costs, staff, loans/interest
- 📊 Daily simulation: load factor, price elasticity, reputation/satisfaction, random events, quests, finance ledger + profit chart
- 🎨 4 cartoon crew characters (Captain Penny, Mechanic Gus, CFO Mia, Attendant Leo) drawn as inline SVG — no image downloads
- 💾 Autosave to localStorage

## How to play
1. Open `index.html` in a browser (or `npx serve .`).
2. Name your airline, pick hub + mascot → **Found Airline**.
3. 🛒 Buy a cheap plane (ATR-72 / E-175) at your hub.
4. 🧭 Open a short route (e.g. JFK→LAX is long — try JFK→GRU? Actually start short: CDG→LHR style hops earn safest).
5. Press **+1 Day** to fly & earn. Watch load factor: >85% = raise prices, <50% = lower prices / add perks.
6. Expand: more planes, longer routes with A321LR/787, new bases, runway upgrades, ads for reputation.

Fair-price hint: shown on the route preview (`~$60 + $0.09/km`).

## Controls / tips
- Tap airports on the map for hangar/runway actions.
- Manage each plane for cabin layout + amenities (syncs to its route).
- Repair when condition < 60% or upkeep spikes.
- Loans are 5%/day — great for a 787 rush, deadly if idle.

## Project structure (mobile-ready)
```
index.html          # app shell, viewport-fit=cover, PWA meta
css/style.css       # mobile-first, bottom nav <820px, 48px touch targets, safe-area
js/data.js          # airports, planes, amenities, events, quests (pure data)
js/game.js          # simulation only, NO DOM — reusable in any mobile wrapper
js/ui.js            # DOM rendering only
manifest.webmanifest# installable PWA
sw.js               # offline cache
assets/icon.svg     # mascot icon (vector = crisp on all phones)
```

**Mobile-first decisions (so conversion is easy):**
- No build step, no npm deps, vanilla JS + SVG — drops straight into Capacitor/Cordova or a WebView.
- `js/game.js` has zero DOM calls: import it into React Native / Flutter WebView / Capacitor as-is.
- Touch targets ≥44px, bottom tab bar on small screens, `viewport-fit=cover` + `env(safe-area-inset-*)`, no hover-only interactions.
- Offline-first (service worker + localStorage); swap `localStorage` for Capacitor Preferences / SecureStorage later with one adapter.
- Vector mascots/UI scale to any DPI without asset re-exports.

## Convert to mobile (3 options)

**A. Easiest — PWA (5 min):** host the folder (GitHub Pages / Netlify), open on phone → Share → Add to Home Screen. Already installable via `manifest.webmanifest` + `sw.js`.

**B. Capacitor (native app + stores):**
```bash
npm i @capacitor/core @capacitor/cli
npx cap init "Sky Tycoon" com.example.skytycoon --web-dir="."
npm i @capacitor/preferences @capacitor/haptics
npx cap add android
npx cap add ios
npx cap sync
npx cap run android   # / ios
```
Then optionally: replace `localStorage` in `game.js` save/load with Preferences, add `Haptics.vibrate()` on buy/takeoff, push via Firebase.

**C. Cordova:** `cordova create skytycoon`, copy these files into `www/`, `cordova platform add android`, `cordova run android`.

## Credits & data sources
- Illustrated world map (offline fallback): [Image by alicia_mb on Magnific](https://www.magnific.com/free-vector/world-map-countries-political-illustration_427643655.htm) — save the image as `assets/world-map.jpg` (`.png`/`.webp` also work) to enable it.
- Airports (coordinates + ICAO idents): [OurAirports](https://ourairports.com/data/) — public domain. Full 85,000-airport `airports.csv` + `runways.csv` download there; this game bundles a curated 48-major-airport subset for playability. Big Map: https://ourairports.com/big-map.html
- Map tiles: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (Leaflet). Tiles need internet; without it the game falls back to the illustrated political map (needs `assets/world-map.jpg`).

## Balance / tuning
All economy numbers live in `js/data.js` (prices, demand, fees) and `js/game.js` `forecast()` / `simulateDay()`. Start cash by difficulty in `newGame()`.

Have fun, boss! 🛫
