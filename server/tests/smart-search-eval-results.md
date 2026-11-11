# AI-Assisted Search — Evaluation Results

Model: openai/gpt-oss-120b (Groq), temperature 0, JSON response format.

Queries passed (all structured fields correct): 25/25 (100.0%).
Field-level accuracy: 108/108 (100.0%).

| ID | Category | Query | Expected | Model output | Result |
|----|----------|-------|----------|--------------|--------|
| Q01 | clear | Apartment for rent in Beirut | {"city":"Beirut","propertyType":"apartment","purpose":"rent"} | {"city":"Beirut","propertyType":"apartment","purpose":"rent"} | PASS |
| Q02 | clear | I want to buy land in Batroun | {"city":"Batroun","propertyType":"land","purpose":"sale"} | {"city":"Batroun","propertyType":"land","purpose":"sale"} | PASS |
| Q03 | clear | Apartment for sale in Jounieh under 150000 | {"city":"Jounieh","propertyType":"apartment","purpose":"sale","maxPrice":150000} | {"city":"Jounieh","propertyType":"apartment","purpose":"sale","maxPrice":150000} | PASS |
| Q04 | clear | Rent an apartment in Tripoli between 400 and 700 dollars | {"city":"Tripoli","propertyType":"apartment","purpose":"rent","minPrice":400,"maxPrice":700} | {"city":"Tripoli","propertyType":"apartment","purpose":"rent","minPrice":400,"maxPrice":700} | PASS |
| Q05 | clear | Land for sale in Zahle | {"city":"Zahle","propertyType":"land","purpose":"sale"} | {"city":"Zahle","propertyType":"land","purpose":"sale"} | PASS |
| Q06 | clear | Apartment in Beirut for rent above 1000 | {"city":"Beirut","propertyType":"apartment","purpose":"rent","minPrice":1000} | {"city":"Beirut","propertyType":"apartment","purpose":"rent","minPrice":1000} | PASS |
| Q07 | clear | Cheap apartment to rent in Saida under 500 | {"city":"Saida","propertyType":"apartment","purpose":"rent","maxPrice":500} | {"keyword":"cheap","city":"Saida","propertyType":"apartment","purpose":"rent","maxPrice":500} | PASS |
| Q08 | clear | Buy an apartment in Byblos | {"city":"Byblos","propertyType":"apartment","purpose":"sale"} | {"city":"Byblos","propertyType":"apartment","purpose":"sale"} | PASS |
| Q09 | clear | Apartment for rent in Hamra, Beirut | {"city":"Beirut","propertyType":"apartment","purpose":"rent"} | {"keyword":"Hamra","city":"Beirut","propertyType":"apartment","purpose":"rent"} | PASS |
| Q10 | clear | Looking to rent an apartment near AUB in Beirut under 900 | {"city":"Beirut","propertyType":"apartment","purpose":"rent","maxPrice":900} | {"keyword":"near AUB","city":"Beirut","propertyType":"apartment","purpose":"rent","maxPrice":900} | PASS |
| Q11 | clear | Sea view apartment for sale in Jounieh | {"city":"Jounieh","propertyType":"apartment","purpose":"sale"} | {"keyword":"sea view","city":"Jounieh","propertyType":"apartment","purpose":"sale"} | PASS |
| Q12 | clear | Plot of land for sale in the Bekaa | {"propertyType":"land","purpose":"sale"} | {"propertyType":"land","purpose":"sale"} | PASS |
| Q13 | ambiguous | Somewhere nice to live | {} | {} | PASS |
| Q14 | ambiguous | A cheap place in the mountains | {} | {} | PASS |
| Q15 | ambiguous | Something with a sea view | {} | {"keyword":"sea view"} | PASS |
| Q16 | ambiguous | A good investment property | {"purpose":["sale"]} | {} | PASS |
| Q17 | ambiguous | A family home near a good school | {} | {"keyword":"family home near a good school"} | PASS |
| Q18 | unsupported | 3 bedroom apartment for rent in Beirut | {"city":"Beirut","propertyType":"apartment","purpose":"rent"} | {"keyword":"3 bedroom","city":"Beirut","propertyType":"apartment","purpose":"rent"} | PASS |
| Q19 | unsupported | Furnished studio for rent in Beirut | {"city":"Beirut","purpose":"rent"} | {"keyword":"furnished","city":"Beirut","propertyType":"apartment","purpose":"rent"} | PASS |
| Q20 | unsupported | Villa with a pool for sale in Faqra | {"city":"Faqra","purpose":"sale"} | {"keyword":"pool","city":"Faqra","purpose":"sale"} | PASS |
| Q21 | unsupported | Office space for rent in Beirut | {"city":"Beirut","purpose":"rent"} | {"city":"Beirut","purpose":"rent"} | PASS |
| Q22 | unsupported | Apartment for rent in Beirut with parking and a balcony | {"city":"Beirut","propertyType":"apartment","purpose":"rent"} | {"city":"Beirut","propertyType":"apartment","purpose":"rent"} | PASS |
| Q23 | robustness | asdfgh qwerty | {} | {} | PASS |
| Q24 | robustness | I want to sell my car | {} | {} | PASS |
| Q25 | robustness | Apartment for rent or sale in Beirut | {"city":"Beirut","propertyType":"apartment"} | {"city":"Beirut","propertyType":"apartment"} | PASS |