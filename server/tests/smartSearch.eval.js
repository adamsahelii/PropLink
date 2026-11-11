// AI-assisted search evaluation harness.
// Runs a set of representative sentences through the REAL /api/smart-search
// endpoint (which calls the Groq model and then sanitises the output) and
// scores the structured filters against the expected values.
//
//   cd server
//   node tests/smartSearch.eval.js
//
// Requires GROQ_API_KEY in server/.env (the same key the app uses). No
// database is needed — smart search does not touch MongoDB.

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const request = require('supertest')
const app = require('../app')
const cases = require('./smartSearchQueries')

const FIELDS = ['city', 'propertyType', 'purpose', 'minPrice', 'maxPrice']
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

if (!process.env.GROQ_API_KEY) {
  console.error('\n  GROQ_API_KEY is not set in server/.env — cannot run the AI evaluation.\n')
  process.exit(1)
}

function norm(v) {
  return typeof v === 'string' ? v.trim().toLowerCase() : v
}

// Decide whether one field's value is correct given the expected spec.
function fieldOK(expected, field, got) {
  const has = Object.prototype.hasOwnProperty.call(expected, field)
  if (!has) return got === undefined // expected absent
  const exp = expected[field]
  if (Array.isArray(exp)) return got !== undefined && exp.map(norm).includes(norm(got))
  if (typeof exp === 'number') return Number(got) === exp
  return norm(got) === norm(exp)
}

async function run() {
  const rows = []
  let qPass = 0
  let fCorrect = 0
  let fTotal = 0
  const byCat = {}

  for (const c of cases) {
    let filters = {}
    let error = null
    try {
      const res = await request(app).post('/api/smart-search').send({ query: c.query })
      if (res.status === 200 && res.body && res.body.filters) filters = res.body.filters
      else error = `HTTP ${res.status}` + (res.body && res.body.debug ? `: ${res.body.debug}` : '')
    } catch (e) {
      error = String(e.message || e)
    }

    const ignore = new Set(c.ignore || [])
    const scored = FIELDS.filter((f) => !ignore.has(f))
    const wrong = []
    for (const f of scored) {
      const ok = error ? false : fieldOK(c.expected, f, filters[f])
      fTotal += 1
      if (ok) fCorrect += 1
      else wrong.push(f)
    }
    const pass = !error && wrong.length === 0
    if (pass) qPass += 1
    byCat[c.category] = byCat[c.category] || { pass: 0, total: 0 }
    byCat[c.category].total += 1
    if (pass) byCat[c.category].pass += 1

    rows.push({
      id: c.id, category: c.category, query: c.query,
      expected: c.expected, got: filters, error,
      wrongFields: wrong, pass,
    })

    const status = error ? 'ERROR' : pass ? 'PASS ' : 'FAIL '
    console.log(`${status} ${c.id} [${c.category}] "${c.query}"`)
    console.log(`        expected: ${JSON.stringify(c.expected)}`)
    console.log(`        got     : ${JSON.stringify(filters)}${error ? '  (' + error + ')' : ''}`)
    if (wrong.length) console.log(`        wrong   : ${wrong.join(', ')}`)
    await sleep(400) // be gentle with the Groq rate limit
  }

  const overall = ((qPass / cases.length) * 100).toFixed(1)
  const fieldAcc = ((fCorrect / fTotal) * 100).toFixed(1)

  console.log('\n==================  SUMMARY  ==================')
  console.log(`Queries passed (all fields correct): ${qPass}/${cases.length}  (${overall}%)`)
  console.log(`Field-level accuracy               : ${fCorrect}/${fTotal}  (${fieldAcc}%)`)
  console.log('By category:')
  for (const [cat, s] of Object.entries(byCat)) {
    console.log(`  ${cat.padEnd(12)} ${s.pass}/${s.total}`)
  }

  // Write machine-readable + markdown results
  const outJson = path.join(__dirname, 'smart-search-eval-results.json')
  fs.writeFileSync(outJson, JSON.stringify({
    model: 'openai/gpt-oss-120b (Groq)', temperature: 0,
    overallQueryAccuracy: Number(overall), fieldLevelAccuracy: Number(fieldAcc),
    queriesPassed: qPass, totalQueries: cases.length, byCategory: byCat, rows,
  }, null, 2))

  const md = []
  md.push('# AI-Assisted Search — Evaluation Results\n')
  md.push(`Model: openai/gpt-oss-120b (Groq), temperature 0, JSON response format.\n`)
  md.push(`Queries passed (all structured fields correct): ${qPass}/${cases.length} (${overall}%).`)
  md.push(`Field-level accuracy: ${fCorrect}/${fTotal} (${fieldAcc}%).\n`)
  md.push('| ID | Category | Query | Expected | Model output | Result |')
  md.push('|----|----------|-------|----------|--------------|--------|')
  for (const r of rows) {
    const got = r.error ? `ERROR: ${r.error}` : JSON.stringify(r.got)
    md.push(`| ${r.id} | ${r.category} | ${r.query.replace(/\|/g, '/')} | ${JSON.stringify(r.expected).replace(/\|/g, '/')} | ${got.replace(/\|/g, '/')} | ${r.pass ? 'PASS' : 'FAIL'} |`)
  }
  fs.writeFileSync(path.join(__dirname, 'smart-search-eval-results.md'), md.join('\n'))
  console.log(`\nSaved: tests/smart-search-eval-results.json and .md`)
  process.exit(0)
}

run()
