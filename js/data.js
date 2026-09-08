/* Sky Tycoon — static game data. Vanilla JS for easy mobile port (Capacitor/WebView). */
(function (global) {
  // Airports: real-world majors, coordinates + ICAO idents sourced from the
  // OurAirports dataset (public domain, https://ourairports.com/data/ — see the
  // Big Map at https://ourairports.com/big-map.html). Curated to scheduled-service
  // large airports for tycoon gameplay; demand/fee sized for balance.
  const AIRPORTS = [
    { code: "JFK", icao: "KJFK", city: "New York", country: "USA", lat: 40.64, lon: -73.78, demand: 95, fee: 3200, runway: 3, hangarCost: 900, desc: "Finance capital. Huge premium demand." },
    { code: "LAX", icao: "KLAX", city: "Los Angeles", country: "USA", lat: 33.94, lon: -118.41, demand: 90, fee: 3000, runway: 3, hangarCost: 850, desc: "Movies, stars & Pacific gateways." },
    { code: "ORD", icao: "KORD", city: "Chicago", country: "USA", lat: 41.97, lon: -87.91, demand: 88, fee: 2900, runway: 3, hangarCost: 820, desc: "Windy City mega-hub." },
    { code: "ATL", icao: "KATL", city: "Atlanta", country: "USA", lat: 33.64, lon: -84.43, demand: 90, fee: 2800, runway: 3, hangarCost: 800, desc: "World's busiest runway complex." },
    { code: "DFW", icao: "KDFW", city: "Dallas", country: "USA", lat: 32.9, lon: -97.04, demand: 86, fee: 2700, runway: 3, hangarCost: 780, desc: "Texas-sized connecting hub." },
    { code: "SFO", icao: "KSFO", city: "San Francisco", country: "USA", lat: 37.62, lon: -122.38, demand: 84, fee: 2800, runway: 3, hangarCost: 800, desc: "Fog, tech money, Pacific hops." },
    { code: "MIA", icao: "KMIA", city: "Miami", country: "USA", lat: 25.79, lon: -80.29, demand: 78, fee: 2400, runway: 3, hangarCost: 700, desc: "Gateway to Latin America." },
    { code: "SEA", icao: "KSEA", city: "Seattle", country: "USA", lat: 47.45, lon: -122.3, demand: 70, fee: 1900, runway: 3, hangarCost: 560, desc: "Coffee, clouds & cargo." },
    { code: "BOS", icao: "KBOS", city: "Boston", country: "USA", lat: 42.36, lon: -71.01, demand: 74, fee: 2200, runway: 3, hangarCost: 640, desc: "Ivy money + transatlantic hops." },
    { code: "IAD", icao: "KIAD", city: "Washington", country: "USA", lat: 38.95, lon: -77.46, demand: 76, fee: 2300, runway: 3, hangarCost: 660, desc: "Capital diplomats fly premium." },
    { code: "YVR", icao: "CYVR", city: "Vancouver", country: "Canada", lat: 49.19, lon: -123.18, demand: 64, fee: 1700, runway: 3, hangarCost: 500, desc: "Pacific Rim postcard hub." },
    { code: "YYZ", icao: "CYYZ", city: "Toronto", country: "Canada", lat: 43.68, lon: -79.63, demand: 72, fee: 2000, runway: 3, hangarCost: 580, desc: "Canada's business front door." },
    { code: "MEX", icao: "MMMX", city: "Mexico City", country: "Mexico", lat: 19.44, lon: -99.07, demand: 68, fee: 1700, runway: 3, hangarCost: 500, desc: "High-altitude mega-city demand." },
    { code: "HAV", icao: "MUHA", city: "Havana", country: "Cuba", lat: 22.99, lon: -82.41, demand: 42, fee: 1000, runway: 2, hangarCost: 280, desc: "Vintage vibes, budget fees." },
    { code: "GRU", icao: "SBGR", city: "São Paulo", country: "Brazil", lat: -23.44, lon: -46.47, demand: 62, fee: 1500, runway: 3, hangarCost: 420, desc: "Cheap base, carnival crowds." },
    { code: "EZE", icao: "SAEZ", city: "Buenos Aires", country: "Argentina", lat: -34.82, lon: -58.54, demand: 55, fee: 1400, runway: 3, hangarCost: 380, desc: "Tango & long southern hauls." },
    { code: "SCL", icao: "SCEL", city: "Santiago", country: "Chile", lat: -33.39, lon: -70.79, demand: 52, fee: 1300, runway: 3, hangarCost: 360, desc: "Skinny-country sky bridge." },
    { code: "LHR", icao: "EGLL", city: "London", country: "UK", lat: 51.47, lon: -0.45, demand: 97, fee: 3800, runway: 3, hangarCost: 1100, desc: "Slot heaven. Business travelers galore." },
    { code: "CDG", icao: "LFPG", city: "Paris", country: "France", lat: 49.01, lon: 2.55, demand: 88, fee: 3100, runway: 3, hangarCost: 900, desc: "Tourists + fashion week peaks." },
    { code: "AMS", icao: "EHAM", city: "Amsterdam", country: "Netherlands", lat: 52.31, lon: 4.76, demand: 82, fee: 2500, runway: 3, hangarCost: 720, desc: "Canals, bikes & connections." },
    { code: "FRA", icao: "EDDF", city: "Frankfurt", country: "Germany", lat: 50.03, lon: 8.56, demand: 86, fee: 2600, runway: 3, hangarCost: 760, desc: "Bankers' autobahn in the sky." },
    { code: "ZRH", icao: "LSZH", city: "Zurich", country: "Switzerland", lat: 47.46, lon: 8.55, demand: 74, fee: 2300, runway: 3, hangarCost: 680, desc: "Watches, chocolate, premium fares." },
    { code: "MAD", icao: "LEMD", city: "Madrid", country: "Spain", lat: 40.5, lon: -3.57, demand: 76, fee: 2200, runway: 3, hangarCost: 620, desc: "Siesta? Never — it connects continents." },
    { code: "FCO", icao: "LIRF", city: "Rome", country: "Italy", lat: 41.8, lon: 12.25, demand: 72, fee: 2100, runway: 3, hangarCost: 600, desc: "All routes lead here, eventually." },
    { code: "LIS", icao: "LPPT", city: "Lisbon", country: "Portugal", lat: 38.77, lon: -9.13, demand: 60, fee: 1600, runway: 3, hangarCost: 460, desc: "Atlantic launchpad to the Americas." },
    { code: "IST", icao: "LTFM", city: "Istanbul", country: "Türkiye", lat: 41.27, lon: 28.74, demand: 80, fee: 2200, runway: 3, hangarCost: 640, desc: "Where continents high-five." },
    { code: "CAI", icao: "HECA", city: "Cairo", country: "Egypt", lat: 30.12, lon: 31.41, demand: 62, fee: 1400, runway: 3, hangarCost: 420, desc: "Pyramids + pilgrim volumes." },
    { code: "LOS", icao: "DNMM", city: "Lagos", country: "Nigeria", lat: 6.58, lon: 3.32, demand: 46, fee: 1100, runway: 2, hangarCost: 300, desc: "Megacity energy, low fees." },
    { code: "ADD", icao: "HAAB", city: "Addis Ababa", country: "Ethiopia", lat: 8.98, lon: 38.8, demand: 45, fee: 1000, runway: 2, hangarCost: 280, desc: "High-altitude African hub." },
    { code: "NBO", icao: "HKJK", city: "Nairobi", country: "Kenya", lat: -1.32, lon: 36.93, demand: 48, fee: 1100, runway: 3, hangarCost: 300, desc: "Safari gateway." },
    { code: "JNB", icao: "FAOR", city: "Johannesburg", country: "S. Africa", lat: -26.14, lon: 28.25, demand: 48, fee: 1100, runway: 3, hangarCost: 300, desc: "Safari hub. Low fees." },
    { code: "CPT", icao: "FACT", city: "Cape Town", country: "S. Africa", lat: -33.97, lon: 18.6, demand: 50, fee: 1200, runway: 3, hangarCost: 320, desc: "Table Mountain postcard routes." },
    { code: "DXB", icao: "OMDB", city: "Dubai", country: "UAE", lat: 25.25, lon: 55.36, demand: 85, fee: 2600, runway: 3, hangarCost: 750, desc: "Luxury stopover super-hub." },
    { code: "DOH", icao: "OTHH", city: "Doha", country: "Qatar", lat: 25.27, lon: 51.61, demand: 83, fee: 2500, runway: 3, hangarCost: 720, desc: "Desert luxury connector." },
    { code: "DEL", icao: "VIDP", city: "Delhi", country: "India", lat: 28.57, lon: 77.1, demand: 78, fee: 1400, runway: 3, hangarCost: 480, desc: "Massive volume, price-sensitive." },
    { code: "BOM", icao: "VABB", city: "Mumbai", country: "India", lat: 19.09, lon: 72.86, demand: 76, fee: 1500, runway: 3, hangarCost: 480, desc: "Bollywood + business crush." },
    { code: "BKK", icao: "VTBS", city: "Bangkok", country: "Thailand", lat: 13.69, lon: 100.75, demand: 74, fee: 1700, runway: 3, hangarCost: 500, desc: "Backpackers + beach charters." },
    { code: "SIN", icao: "WSSS", city: "Singapore", country: "Singapore", lat: 1.36, lon: 103.99, demand: 82, fee: 2400, runway: 3, hangarCost: 700, desc: "Squeaky-clean mega hub." },
    { code: "KUL", icao: "WMKK", city: "Kuala Lumpur", country: "Malaysia", lat: 2.75, lon: 101.71, demand: 68, fee: 1600, runway: 3, hangarCost: 460, desc: "Twin-tower transit stop." },
    { code: "HKG", icao: "VHHH", city: "Hong Kong", country: "China", lat: 22.31, lon: 113.91, demand: 86, fee: 2600, runway: 3, hangarCost: 740, desc: "Neon harbor money-magnet." },
    { code: "PEK", icao: "ZBAA", city: "Beijing", country: "China", lat: 40.08, lon: 116.58, demand: 88, fee: 2400, runway: 3, hangarCost: 700, desc: "Capital cargo + crowds." },
    { code: "PVG", icao: "ZSPD", city: "Shanghai", country: "China", lat: 31.14, lon: 121.81, demand: 87, fee: 2400, runway: 3, hangarCost: 700, desc: "Finance + factories fly here." },
    { code: "ICN", icao: "RKSI", city: "Seoul", country: "S. Korea", lat: 37.46, lon: 126.44, demand: 84, fee: 2300, runway: 3, hangarCost: 680, desc: "K-pop tourism jumbo jet filler." },
    { code: "HND", icao: "RJTT", city: "Tokyo", country: "Japan", lat: 35.55, lon: 139.78, demand: 92, fee: 3300, runway: 3, hangarCost: 950, desc: "Tech tourists + tight slots." },
    { code: "NRT", icao: "RJAA", city: "Tokyo Narita", country: "Japan", lat: 35.77, lon: 140.39, demand: 85, fee: 2700, runway: 3, hangarCost: 760, desc: "Tokyo's intercontinental twin." },
    { code: "SYD", icao: "YSSY", city: "Sydney", country: "Australia", lat: -33.95, lon: 151.18, demand: 70, fee: 2000, runway: 3, hangarCost: 600, desc: "Long-haul paradise." },
    { code: "AKL", icao: "NZAA", city: "Auckland", country: "New Zealand", lat: -37.01, lon: 174.79, demand: 55, fee: 1500, runway: 3, hangarCost: 420, desc: "Middle-earth long-haul." },
    { code: "ANC", icao: "PANC", city: "Anchorage", country: "USA", lat: 61.17, lon: -149.98, demand: 30, fee: 700, runway: 2, hangarCost: 220, desc: "Cold, cheap, great for training." },
  ];

  // runway: 1=small (regional only), 2=medium (narrowbody), 3=large (widebody/jumbo)
  // sizeReq mirrors that scale.
  const PLANES = [
    { id: "atr72", name: "Sky Pup ATR-72", size: "Regional", price: 900000, capacity: 70, rangeKm: 1400, fuelPerKm: 3.2, speed: 510, upkeep: 900, sizeReq: 1, comfort: 55, desc: "Cheap turboprop for short hops." },
    { id: "e175", name: "Zippy E-175", size: "Regional", price: 1800000, capacity: 88, rangeKm: 2200, fuelPerKm: 4.1, speed: 830, upkeep: 1200, sizeReq: 1, comfort: 62, desc: "Speedy regional jet." },
    { id: "a220", name: "Aero A220-300", size: "Narrowbody", price: 4200000, capacity: 140, rangeKm: 3400, fuelPerKm: 5.2, speed: 850, upkeep: 1900, sizeReq: 2, comfort: 72, desc: "Fan-favorite little workhorse." },
    { id: "b737", name: "Boing 737 MAX 8", size: "Narrowbody", price: 5800000, capacity: 178, rangeKm: 3500, fuelPerKm: 6.0, speed: 850, upkeep: 2300, sizeReq: 2, comfort: 70, desc: "The tycoon classic." },
    { id: "a320", name: "Airbus A320neo", size: "Narrowbody", price: 6200000, capacity: 186, rangeKm: 3400, fuelPerKm: 5.8, speed: 850, upkeep: 2300, sizeReq: 2, comfort: 74, desc: "Quiet, efficient money-printer." },
    { id: "a321lr", name: "A321 Long Ranger", size: "Narrowbody", price: 7800000, capacity: 200, rangeKm: 5600, fuelPerKm: 6.4, speed: 850, upkeep: 2700, sizeReq: 2, comfort: 75, desc: "Narrowbody that flies oceans." },
    { id: "b787", name: "Dreamliner 787-8", size: "Widebody", price: 14500000, capacity: 248, rangeKm: 11000, fuelPerKm: 9.5, speed: 900, upkeep: 4200, sizeReq: 3, comfort: 84, desc: "Long-haul comfort king." },
    { id: "a350", name: "A350-900 Ultra", size: "Widebody", price: 16800000, capacity: 300, rangeKm: 13500, fuelPerKm: 10.5, speed: 910, upkeep: 4800, sizeReq: 3, comfort: 88, desc: "Flagship. Prints money on mega-routes." },
    { id: "b747", name: "Jumbo Queen 747-8", size: "Jumbo", price: 21000000, capacity: 410, rangeKm: 12000, fuelPerKm: 14.5, speed: 920, upkeep: 6500, sizeReq: 3, comfort: 80, desc: "Double-decker icon. Huge fees, huge fun." },
    { id: "a380", name: "Sky Whale A380", size: "Jumbo", price: 25000000, capacity: 520, rangeKm: 13000, fuelPerKm: 17.0, speed: 900, upkeep: 7800, sizeReq: 3, comfort: 82, desc: "The whale. Fill it or weep." },
  ];

  const AMENITIES = [
    { id: "wifi", name: "📶 Wi-Fi", costPerPax: 3, appeal: 6, desc: "+satisfaction, biz travelers love it" },
    { id: "meals", name: "🍱 Hot Meals", costPerPax: 7, appeal: 10, desc: "Big rep boost on long flights" },
    { id: "ent", name: "🎬 Seat Screens", costPerPax: 4, appeal: 8, desc: "Families pick you first" },
    { id: "legroom", name: "🦵 Extra Legroom", costPerPax: 5, appeal: 9, desc: "Lets you raise prices ~8%" },
    { id: "lounge", name: "🥂 Lounge Access", costPerPax: 6, appeal: 7, desc: "First/Biz load factor up" },
    { id: "eco", name: "🌱 Eco Engines", costPerPax: -2, appeal: 5, desc: "Saves fuel, greens love you" },
  ];

  const EVENTS = [
    { id: "viral", text: "A travel vlogger loved your legroom! +Rep, demand surge for 3 days.", effect: { rep: 4, boost: 3 } },
    { id: "bird", text: "Bird strike! One plane grounded 2 days, repair bill incoming.", effect: { repair: 45000 } },
    { id: "fuelspike", text: "Oil prices spike! Fuel costs +25% for 3 days.", effect: { fuelMult: 1.25, days: 3 } },
    { id: "strike", text: "Crew asks for pizza Fridays. Pay $20k or lose satisfaction?", effect: { choice: true } },
    { id: "lottery", text: "Your hub city hosts the Olympics! Demand +40% for 5 days.", effect: { boost: 5 } },
    { id: "review", text: "Bad review: 'no snacks?!' Satisfaction dips unless you add meals.", effect: { sat: -6 } },
    { id: "grant", text: "Green grant! Eco-friendly fleet earns you a subsidy.", effect: { cash: 60000 } },
  ];

  const QUESTS = [
    { id: "q1", text: "Buy your first airplane", check: (s) => s.fleet.length >= 1, reward: 50000 },
    { id: "q2", text: "Open your first route", check: (s) => s.routes.length >= 1, reward: 75000 },
    { id: "q3", text: "Own 3 airplanes", check: (s) => s.fleet.length >= 3, reward: 150000 },
    { id: "q4", text: "Reach $15M cash", check: (s) => s.cash >= 15000000, reward: 0, badge: "💰" },
    { id: "q5", text: "Reach 75 reputation", check: (s) => s.rep >= 75, reward: 200000 },
    { id: "q6", text: "Operate 5 routes", check: (s) => s.routes.length >= 5, reward: 300000 },
  ];

  global.SKY_DATA = { AIRPORTS, PLANES, AMENITIES, EVENTS, QUESTS };
})(window);
