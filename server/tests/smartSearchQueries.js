// Representative evaluation set for the AI-assisted search.
// Each case lists the plain sentence and the EXPECTED structured filters.
// Scoring (see smartSearch.eval.js) looks only at the structured fields
// city, propertyType, purpose, minPrice, maxPrice. The free-text `keyword`
// is reported but not scored, because its wording is open-ended.
//
// Rules for `expected`:
//   - a value            -> the field must equal it
//   - an array [a, b]    -> the field must be one of these
//   - field omitted      -> the field must be ABSENT (tests that the model
//                           does not invent or mis-map an unsupported value)
//   - `ignore: [field]`  -> that field is not scored (genuinely open/ambiguous)
//
// category: clear | ambiguous | unsupported | robustness

module.exports = [
  // ---- clear, structured ----
  { id: 'Q01', category: 'clear', query: 'Apartment for rent in Beirut',
    expected: { city: 'Beirut', propertyType: 'apartment', purpose: 'rent' } },
  { id: 'Q02', category: 'clear', query: 'I want to buy land in Batroun',
    expected: { city: 'Batroun', propertyType: 'land', purpose: 'sale' } },
  { id: 'Q03', category: 'clear', query: 'Apartment for sale in Jounieh under 150000',
    expected: { city: 'Jounieh', propertyType: 'apartment', purpose: 'sale', maxPrice: 150000 } },
  { id: 'Q04', category: 'clear', query: 'Rent an apartment in Tripoli between 400 and 700 dollars',
    expected: { city: 'Tripoli', propertyType: 'apartment', purpose: 'rent', minPrice: 400, maxPrice: 700 } },
  { id: 'Q05', category: 'clear', query: 'Land for sale in Zahle',
    expected: { city: 'Zahle', propertyType: 'land', purpose: 'sale' } },
  { id: 'Q06', category: 'clear', query: 'Apartment in Beirut for rent above 1000',
    expected: { city: 'Beirut', propertyType: 'apartment', purpose: 'rent', minPrice: 1000 } },
  { id: 'Q07', category: 'clear', query: 'Cheap apartment to rent in Saida under 500',
    expected: { city: 'Saida', propertyType: 'apartment', purpose: 'rent', maxPrice: 500 }, ignore: [] },
  { id: 'Q08', category: 'clear', query: 'Buy an apartment in Byblos',
    expected: { city: 'Byblos', propertyType: 'apartment', purpose: 'sale' } },
  { id: 'Q09', category: 'clear', query: 'Apartment for rent in Hamra, Beirut',
    expected: { city: 'Beirut', propertyType: 'apartment', purpose: 'rent' }, ignore: ['city'],
    note: 'Hamra is a district of Beirut; city "Beirut" or keyword "Hamra" both acceptable.' },
  { id: 'Q10', category: 'clear', query: 'Looking to rent an apartment near AUB in Beirut under 900',
    expected: { city: 'Beirut', propertyType: 'apartment', purpose: 'rent', maxPrice: 900 } },
  { id: 'Q11', category: 'clear', query: 'Sea view apartment for sale in Jounieh',
    expected: { city: 'Jounieh', propertyType: 'apartment', purpose: 'sale' } },
  { id: 'Q12', category: 'clear', query: 'Plot of land for sale in the Bekaa',
    expected: { propertyType: 'land', purpose: 'sale' }, ignore: ['city'],
    note: 'Bekaa is a region, not a city; any city value or omission is acceptable.' },

  // ---- ambiguous / vague ----
  { id: 'Q13', category: 'ambiguous', query: 'Somewhere nice to live',
    expected: {}, ignore: ['city'],
    note: 'No property type, purpose, or price implied; structured fields should stay empty.' },
  { id: 'Q14', category: 'ambiguous', query: 'A cheap place in the mountains',
    expected: {}, ignore: ['city'],
    note: 'No supported structured value is clearly implied.' },
  { id: 'Q15', category: 'ambiguous', query: 'Something with a sea view',
    expected: {}, ignore: ['city'],
    note: 'Feature only; belongs in keyword, not a structured filter.' },
  { id: 'Q16', category: 'ambiguous', query: 'A good investment property',
    expected: { purpose: ['sale'] }, ignore: ['city', 'purpose'],
    note: 'Investment loosely implies sale; either purpose "sale" or omission is acceptable.' },
  { id: 'Q17', category: 'ambiguous', query: 'A family home near a good school',
    expected: {}, ignore: ['city', 'propertyType'],
    note: '"Home" is not clearly apartment or land; omission or "apartment" acceptable.' },

  // ---- unsupported / partially supported ----
  { id: 'Q18', category: 'unsupported', query: '3 bedroom apartment for rent in Beirut',
    expected: { city: 'Beirut', propertyType: 'apartment', purpose: 'rent' },
    note: 'Bedroom count is not a supported filter; it must not create a structured field.' },
  { id: 'Q19', category: 'unsupported', query: 'Furnished studio for rent in Beirut',
    expected: { city: 'Beirut', purpose: 'rent' }, ignore: ['propertyType'],
    note: '"studio" is not in the allowed property types; propertyType must be omitted.' },
  { id: 'Q20', category: 'unsupported', query: 'Villa with a pool for sale in Faqra',
    expected: { city: 'Faqra', purpose: 'sale' }, ignore: ['propertyType', 'city'],
    note: '"villa" is not an allowed property type; propertyType must be omitted.' },
  { id: 'Q21', category: 'unsupported', query: 'Office space for rent in Beirut',
    expected: { city: 'Beirut', purpose: 'rent' }, ignore: ['propertyType'],
    note: '"office" is not an allowed property type; propertyType must be omitted.' },
  { id: 'Q22', category: 'unsupported', query: 'Apartment for rent in Beirut with parking and a balcony',
    expected: { city: 'Beirut', propertyType: 'apartment', purpose: 'rent' },
    note: 'Amenities are not structured filters; they belong in keyword.' },

  // ---- robustness ----
  { id: 'Q23', category: 'robustness', query: 'asdfgh qwerty',
    expected: {}, ignore: ['city'],
    note: 'Gibberish; no structured filters should be produced.' },
  { id: 'Q24', category: 'robustness', query: 'I want to sell my car',
    expected: {}, ignore: ['city', 'purpose'],
    note: 'Not a property search; "sale" or empty acceptable, no city/type.' },
  { id: 'Q25', category: 'robustness', query: 'Apartment for rent or sale in Beirut',
    expected: { city: 'Beirut', propertyType: 'apartment' }, ignore: ['purpose'],
    note: 'Contradictory purpose; rent, sale, or omitting purpose are all acceptable.' },
]
