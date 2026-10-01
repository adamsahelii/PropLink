const asyncHandler = require('../utils/asyncHandler')
const AppError = require('../utils/AppError')

// Locked to your real Listing schema enums.
const ALLOWED = {
  propertyType: ['apartment', 'land'],
  purpose:      ['rent', 'sale'],
}

// ── POST /api/smart-search ────────────────────────────────────────────────
// Takes a plain sentence, returns ONLY filter params. Does not touch MongoDB.
exports.smartSearch = asyncHandler(async (req, res, next) => {
  const query = (req.body.query || '').trim()
  if (!query) return next(new AppError('Please type what you are looking for.', 400))

  const prompt = `You convert a property search sentence into JSON filters for a Lebanon real-estate site.
Return ONLY a JSON object. Include a key only when the user implies it, otherwise omit it:
- keyword: string (free text like a neighbourhood or feature, e.g. "sea view", "near AUB")
- city: string (Lebanese city, e.g. "Beirut", "Tripoli", "Jounieh")
- propertyType: one of ${JSON.stringify(ALLOWED.propertyType)}
- purpose: one of ${JSON.stringify(ALLOWED.purpose)} ("sale" means buying/for sale, "rent" means renting)
- minPrice: number (USD)
- maxPrice: number (USD)
Never invent values outside the allowed lists. If the user says "buy" or "buying", set purpose to "sale".
User sentence: "${query}"`

  let aiJson
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
                model: 'openai/gpt-oss-120b',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!r.ok) {
      const body = await r.text()
      throw new Error(`Groq ${r.status}: ${body}`)
    }
    const data = await r.json()
    aiJson = JSON.parse(data.choices[0].message.content)
  } catch (err) {
    console.error('SMART SEARCH ERROR:', err)
    return res.status(503).json({ success: false, debug: String(err.message || err) })
  }

  // Sanitize: only keep known, valid fields. Never trust the model blindly.
  const filters = {}
  if (typeof aiJson.keyword === 'string') filters.keyword = aiJson.keyword.trim()
  if (typeof aiJson.city === 'string') filters.city = aiJson.city.trim()
  if (ALLOWED.propertyType.includes(aiJson.propertyType)) filters.propertyType = aiJson.propertyType
  if (ALLOWED.purpose.includes(aiJson.purpose)) filters.purpose = aiJson.purpose
  if (Number.isFinite(+aiJson.minPrice)) filters.minPrice = +aiJson.minPrice
  if (Number.isFinite(+aiJson.maxPrice)) filters.maxPrice = +aiJson.maxPrice

  res.status(200).json({ success: true, filters })
})