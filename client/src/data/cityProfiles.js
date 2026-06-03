// Scoring dimensions mirror the quiz answer keys exactly.
// Each score is 0–10. Weighted sum: budget(30%) + purpose(25%) + lifestyle(25%) + priority(20%)

export const CITY_PROFILES = {
  Beirut: {
    tagline: "Lebanon's cosmopolitan capital — dynamic, vibrant, and unmatched for investment.",
    lifestyle:  { city: 10, coastal: 2, mountain: 0,  family: 5,  nightlife: 10, quiet: 0  },
    budget:     { under100k: 0, s100k250k: 1, s250k500k: 6,  s500kplus: 10 },
    purpose:    { residence: 8, investment: 10, vacation: 6,  land: 0 },
    priority:   { price: 0, investment: 10, seaView: 2,  privacy: 1,  accessibility: 10, rentalIncome: 10 },
  },
  Jounieh: {
    tagline: "Scenic bay living with vibrant nightlife and easy Beirut access.",
    lifestyle:  { city: 7, coastal: 8, mountain: 4,  family: 7,  nightlife: 8,  quiet: 2  },
    budget:     { under100k: 1, s100k250k: 4, s250k500k: 8,  s500kplus: 7  },
    purpose:    { residence: 8, investment: 8,  vacation: 8,  land: 2 },
    priority:   { price: 2, investment: 8,  seaView: 8,  privacy: 3,  accessibility: 8,  rentalIncome: 8  },
  },
  Jbeil: {
    tagline: "Historic coastal gem — one of the world's oldest cities, now rising in value.",
    lifestyle:  { city: 6, coastal: 9, mountain: 3,  family: 8,  nightlife: 6,  quiet: 5  },
    budget:     { under100k: 2, s100k250k: 5, s250k500k: 8,  s500kplus: 7  },
    purpose:    { residence: 7, investment: 9,  vacation: 10, land: 3 },
    priority:   { price: 2, investment: 9,  seaView: 9,  privacy: 4,  accessibility: 7,  rentalIncome: 9  },
  },
  Tripoli: {
    tagline: "Lebanon's second city — affordable, growing, and full of authentic character.",
    lifestyle:  { city: 8, coastal: 5, mountain: 2,  family: 7,  nightlife: 5,  quiet: 2  },
    budget:     { under100k: 5, s100k250k: 8, s250k500k: 7,  s500kplus: 3  },
    purpose:    { residence: 8, investment: 7,  vacation: 4,  land: 4 },
    priority:   { price: 7, investment: 6,  seaView: 3,  privacy: 3,  accessibility: 7,  rentalIncome: 6  },
  },
  Sidon: {
    tagline: "Historic southern port city with an emerging and affordable real estate scene.",
    lifestyle:  { city: 6, coastal: 7, mountain: 2,  family: 7,  nightlife: 4,  quiet: 4  },
    budget:     { under100k: 5, s100k250k: 8, s250k500k: 6,  s500kplus: 2  },
    purpose:    { residence: 7, investment: 6,  vacation: 6,  land: 4 },
    priority:   { price: 7, investment: 5,  seaView: 6,  privacy: 4,  accessibility: 6,  rentalIncome: 5  },
  },
  Tyre: {
    tagline: "Ancient coastal paradise — pristine beaches and UNESCO World Heritage.",
    lifestyle:  { city: 4, coastal: 9, mountain: 1,  family: 7,  nightlife: 3,  quiet: 6  },
    budget:     { under100k: 6, s100k250k: 8, s250k500k: 5,  s500kplus: 2  },
    purpose:    { residence: 6, investment: 6,  vacation: 8,  land: 4 },
    priority:   { price: 7, investment: 5,  seaView: 9,  privacy: 5,  accessibility: 4,  rentalIncome: 6  },
  },
  Zahle: {
    tagline: "The bride of the Bekaa — renowned for fine dining, wineries, and family living.",
    lifestyle:  { city: 5, coastal: 0, mountain: 5,  family: 8,  nightlife: 5,  quiet: 5  },
    budget:     { under100k: 5, s100k250k: 8, s250k500k: 6,  s500kplus: 2  },
    purpose:    { residence: 7, investment: 6,  vacation: 7,  land: 5 },
    priority:   { price: 6, investment: 5,  seaView: 0,  privacy: 5,  accessibility: 6,  rentalIncome: 5  },
  },
  Batroun: {
    tagline: "Lebanon's trendiest coastal escape — boutique tourism meets natural beauty.",
    lifestyle:  { city: 4, coastal: 10, mountain: 4,  family: 7,  nightlife: 7,  quiet: 6  },
    budget:     { under100k: 3, s100k250k: 6,  s250k500k: 8,  s500kplus: 6  },
    purpose:    { residence: 7, investment: 9,  vacation: 10, land: 4 },
    priority:   { price: 3, investment: 9,  seaView: 10, privacy: 5,  accessibility: 6,  rentalIncome: 8  },
  },
  Baalbek: {
    tagline: "Home to the world's finest Roman temples — vast land at exceptional value.",
    lifestyle:  { city: 3, coastal: 0, mountain: 3,  family: 6,  nightlife: 3,  quiet: 7  },
    budget:     { under100k: 8, s100k250k: 8,  s250k500k: 4,  s500kplus: 1  },
    purpose:    { residence: 5, investment: 5,  vacation: 8,  land: 7 },
    priority:   { price: 9, investment: 4,  seaView: 0,  privacy: 6,  accessibility: 4,  rentalIncome: 4  },
  },
  Hermel: {
    tagline: "Pristine northern wilderness — ideal for large-scale land acquisition.",
    lifestyle:  { city: 1, coastal: 0, mountain: 6,  family: 5,  nightlife: 1,  quiet: 10 },
    budget:     { under100k: 10, s100k250k: 7, s250k500k: 2,  s500kplus: 0  },
    purpose:    { residence: 4, investment: 3,  vacation: 5,  land: 10 },
    priority:   { price: 10, investment: 2,  seaView: 0,  privacy: 10, accessibility: 2,  rentalIncome: 2  },
  },
  Nabatieh: {
    tagline: "An affordable, family-oriented city in the heart of South Lebanon.",
    lifestyle:  { city: 5, coastal: 2, mountain: 4,  family: 8,  nightlife: 3,  quiet: 5  },
    budget:     { under100k: 7, s100k250k: 8,  s250k500k: 4,  s500kplus: 1  },
    purpose:    { residence: 7, investment: 4,  vacation: 3,  land: 5 },
    priority:   { price: 8, investment: 3,  seaView: 1,  privacy: 5,  accessibility: 6,  rentalIncome: 3  },
  },
  Aley: {
    tagline: "Lebanon's beloved summer retreat — cool mountain air just 20 minutes from Beirut.",
    lifestyle:  { city: 4, coastal: 2, mountain: 8,  family: 7,  nightlife: 4,  quiet: 6  },
    budget:     { under100k: 3, s100k250k: 6,  s250k500k: 8,  s500kplus: 6  },
    purpose:    { residence: 7, investment: 7,  vacation: 8,  land: 4 },
    priority:   { price: 3, investment: 7,  seaView: 4,  privacy: 6,  accessibility: 7,  rentalIncome: 7  },
  },
  Baabda: {
    tagline: "Prestigious Greater Beirut suburb — residential, secure, and well-connected.",
    lifestyle:  { city: 6, coastal: 1, mountain: 5,  family: 9,  nightlife: 4,  quiet: 5  },
    budget:     { under100k: 1, s100k250k: 4,  s250k500k: 7,  s500kplus: 8  },
    purpose:    { residence: 9, investment: 7,  vacation: 4,  land: 2 },
    priority:   { price: 1, investment: 7,  seaView: 2,  privacy: 6,  accessibility: 8,  rentalIncome: 6  },
  },
  Chouf: {
    tagline: "Ancient cedar forests and serene mountain villages — nature's sanctuary.",
    lifestyle:  { city: 2, coastal: 2, mountain: 9,  family: 7,  nightlife: 2,  quiet: 8  },
    budget:     { under100k: 5, s100k250k: 7,  s250k500k: 6,  s500kplus: 3  },
    purpose:    { residence: 6, investment: 5,  vacation: 8,  land: 7 },
    priority:   { price: 5, investment: 5,  seaView: 4,  privacy: 8,  accessibility: 5,  rentalIncome: 5  },
  },
  Keserwan: {
    tagline: "Affluent mountain district — four-season family estates near the ski slopes.",
    lifestyle:  { city: 4, coastal: 2, mountain: 8,  family: 8,  nightlife: 4,  quiet: 6  },
    budget:     { under100k: 2, s100k250k: 5,  s250k500k: 7,  s500kplus: 7  },
    purpose:    { residence: 8, investment: 7,  vacation: 7,  land: 3 },
    priority:   { price: 2, investment: 7,  seaView: 3,  privacy: 5,  accessibility: 7,  rentalIncome: 6  },
  },
  Metn: {
    tagline: "Lebanon's most popular family district — excellent schools, parks, and community.",
    lifestyle:  { city: 5, coastal: 1, mountain: 6,  family: 9,  nightlife: 4,  quiet: 5  },
    budget:     { under100k: 2, s100k250k: 5,  s250k500k: 7,  s500kplus: 6  },
    purpose:    { residence: 9, investment: 7,  vacation: 4,  land: 3 },
    priority:   { price: 2, investment: 7,  seaView: 2,  privacy: 5,  accessibility: 8,  rentalIncome: 6  },
  },
  Akkar: {
    tagline: "Lebanon's untouched north — vast land at the country's most affordable prices.",
    lifestyle:  { city: 2, coastal: 3, mountain: 5,  family: 6,  nightlife: 1,  quiet: 9  },
    budget:     { under100k: 10, s100k250k: 8, s250k500k: 3,  s500kplus: 0  },
    purpose:    { residence: 4, investment: 4,  vacation: 4,  land: 10 },
    priority:   { price: 10, investment: 3,  seaView: 2,  privacy: 9,  accessibility: 3,  rentalIncome: 2  },
  },
  Bcharre: {
    tagline: "The roof of Lebanon — dramatic cedars, Gibran's homeland, and mountain grandeur.",
    lifestyle:  { city: 2, coastal: 1, mountain: 10, family: 5,  nightlife: 1,  quiet: 9  },
    budget:     { under100k: 4, s100k250k: 7,  s250k500k: 7,  s500kplus: 4  },
    purpose:    { residence: 5, investment: 5,  vacation: 9,  land: 5 },
    priority:   { price: 5, investment: 5,  seaView: 2,  privacy: 9,  accessibility: 4,  rentalIncome: 6  },
  },
  Marjayoun: {
    tagline: "A serene historic town — ideal for quiet retreats and affordable land ownership.",
    lifestyle:  { city: 2, coastal: 0, mountain: 5,  family: 6,  nightlife: 1,  quiet: 9  },
    budget:     { under100k: 8, s100k250k: 8,  s250k500k: 3,  s500kplus: 0  },
    purpose:    { residence: 5, investment: 3,  vacation: 5,  land: 7 },
    priority:   { price: 9, investment: 2,  seaView: 0,  privacy: 8,  accessibility: 4,  rentalIncome: 2  },
  },
  Jezzine: {
    tagline: "Waterfall village in the southern mountains — tranquil, green, and unspoiled.",
    lifestyle:  { city: 2, coastal: 2, mountain: 8,  family: 7,  nightlife: 2,  quiet: 8  },
    budget:     { under100k: 5, s100k250k: 8,  s250k500k: 5,  s500kplus: 2  },
    purpose:    { residence: 6, investment: 5,  vacation: 8,  land: 5 },
    priority:   { price: 6, investment: 4,  seaView: 2,  privacy: 7,  accessibility: 5,  rentalIncome: 4  },
  },
  Rachaya: {
    tagline: "Remote hilltop living near Lebanon's winery belt — ideal for the private buyer.",
    lifestyle:  { city: 2, coastal: 0, mountain: 6,  family: 6,  nightlife: 1,  quiet: 9  },
    budget:     { under100k: 9, s100k250k: 8,  s250k500k: 3,  s500kplus: 0  },
    purpose:    { residence: 5, investment: 4,  vacation: 6,  land: 7 },
    priority:   { price: 9, investment: 3,  seaView: 0,  privacy: 8,  accessibility: 4,  rentalIncome: 3  },
  },
  Hasbaya: {
    tagline: "Quiet southern foothill village — untouched nature and affordable farmland.",
    lifestyle:  { city: 2, coastal: 0, mountain: 6,  family: 6,  nightlife: 1,  quiet: 9  },
    budget:     { under100k: 9, s100k250k: 8,  s250k500k: 3,  s500kplus: 0  },
    purpose:    { residence: 5, investment: 3,  vacation: 5,  land: 7 },
    priority:   { price: 9, investment: 2,  seaView: 1,  privacy: 8,  accessibility: 4,  rentalIncome: 2  },
  },
  Zgharta: {
    tagline: "Historic northern town known for traditional architecture and community bonds.",
    lifestyle:  { city: 5, coastal: 3, mountain: 4,  family: 7,  nightlife: 3,  quiet: 5  },
    budget:     { under100k: 6, s100k250k: 8,  s250k500k: 5,  s500kplus: 1  },
    purpose:    { residence: 7, investment: 5,  vacation: 4,  land: 5 },
    priority:   { price: 7, investment: 4,  seaView: 2,  privacy: 5,  accessibility: 6,  rentalIncome: 4  },
  },
}

// Returns the top 3 cities ranked by weighted score
export function computeRecommendations({ budget, purpose, lifestyle, priority }) {
  return Object.entries(CITY_PROFILES)
    .map(([name, p]) => ({
      name,
      tagline: p.tagline,
      score:
        (p.budget[budget]       ?? 0) * 0.30 +
        (p.purpose[purpose]     ?? 0) * 0.25 +
        (p.lifestyle[lifestyle] ?? 0) * 0.25 +
        (p.priority[priority]   ?? 0) * 0.20,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}
