# Antigravity Agent Daily News Generation Pipeline Guide

This document defines the instructions for the Antigravity Agent when executing the daily news update cron task. 

## Workflow Execution Steps

### 1. Run the Raw Scraper
Execute the raw scraper script to fetch current social media and RSS feeds into the temporary file:
```bash
python3 scripts/raw_scraper.py
```
This writes raw data to `src/data/raw_scraped.json`.

### 2. Read Raw Scraped Data
Read and parse the contents of `src/data/raw_scraped.json`. If no new items are found, log a message and stop.

### 3. Filter, Select, and Fact-Check
Analyze the raw feed items. Identify the most critical, high-impact stories (aim for 3-5 news articles).
- **Verify Facts**: If any story has missing/vague details (e.g. numbers, specific locations, timeline, or names of officials) or requires cross-verification, the agent **MUST** run the `search_web` tool to search for matching news articles online.
- Do not make up facts. Gather real details from reliable news sources (like Laotian Times, KPL, Vientiane Times, etc.).

### 4. Format and Structure News Articles
For each selected story, construct a news JSON object matching this schema:
```json
{
  "id": "generate-a-unique-uuid-or-id",
  "category": "経済" | "社会" | "国際" | "観光",
  "title": "Clear Japanese Title describing the event",
  "summary": "1-2 sentence concise Japanese summary",
  "date": "YYYY-MM-DD",
  "readTime": "3 min read" | "2 min read",
  "source": "Original source names (e.g., Lao News Agency, Laotian Times, etc.)",
  "picksCount": 0,
  "viewsCount": 0,
  "image": "",
  "takeaways": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3"
  ],
  "content": "# Markdown title\n\nDetailed markdown article content using **bolding**, lists, and clear paragraphs in Japanese."
}
```

### 5. Check Duplicates and Map Premium Images
- Load `src/data/news.json` to inspect already published articles.
- **De-duplicate**: Do not generate articles that cover the exact same events/incidents as already existing articles in `news.json`. Look at matching dates, locations, and descriptions.
- **Assign Themed Image**: Map the `image` field based on matching keywords in the article's title, content, or summary:
  - `"ベトナム"`, `"vietnam"`, `"外交"`, `"首脳"`, `"両国"`, `"関係"`, `"cooperation"`, `"diplomacy"` -> `/lao_vn_coop.png`
  - `"王女"`, `"皇室"`, `"王室"`, `"palace"`, `"royal"`, `"princess"` -> `/thai_royal_memorial.png`
  - `"洞窟"`, `"遭難"`, `"救助"`, `"cave"`, `"rescue"` -> `/lao_cave_rescue.png`
  - `"物流ハブ"`, `"物流拠点"`, `"エネルギーハブ"`, `"logistics hub"` -> `/lao_logistics_hub.png`
  - `"aiva"`, `"ai車両"`, `"aiモデル"`, `"aiネイティブ"` -> `/aiva_ai_car.png`
  - `"強盗"`, `"逮捕"`, `"摘発"`, `"警察"`, `"事件"`, `"robbery"`, `"police"`, `"arrest"` -> `/lao_police_investigation.png`
  - `"電線"`, `"感電"`, `"電線落下"`, `"utility pole"`, `"utility wire"` -> `/donnoun_wire_safety.png`
  - `"廃棄物"`, `"医療"`, `"病院"`, `"waste"`, `"medical"`, `"clinic"`, `"health"` -> `/lao_waste_proj.png`
  - `"植樹"`, `"森林"`, `"環境"`, `"tree"`, `"forest"`, `"arbour"`, `"environment"` -> `/lao_tree_plant.png`
  - `"鉄道"`, `"列車"`, `"高速鉄道"`, `"駅"`, `"railway"`, `"train"` -> `/lao_railway.png`
  - `"バス"`, `"ev"`, `"電気"`, `"電動"`, `"electricity"`, `"energy"` -> `/lao_ev_bus.png`
  - `"コーヒー"`, `"珈琲"`, `"農業"`, `"coffee"`, `"agro"` -> `/lao_coffee.png`
  - `"道路"`, `"インフラ"`, `"ハブ"`, `"接続"`, `"road"`, `"infrastructure"`, `"hub"` -> `/lao_road.png`
  - `"寺"`, `"仏教"`, `"祭り"`, `"観光"`, `"temple"`, `"festival"`, `"tourism"` -> `/lao_temple.png`
  
  *Fallback by category:*
  - `"国際"` -> `/lao_vn_coop.png`
  - `"社会"` -> `/lao_living_info.png`
  - `"経済"` -> `/lao_info_econ.png`
  - `"観光"` -> `/lao_temple.png`
  - *Otherwise:* `/lao_patuxai.png`

### 6. Update `news.json`
Prepend the new articles to the existing list in `src/data/news.json`. Ensure mock article IDs (`art-1`, `art-2`, `art-3`, `art-4`, `art-5`) are deleted if they somehow reappear.
Write the updated list back to `src/data/news.json`.

### 7. Build, Test and Deploy
Verify and deploy the updated application:
```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name lao-daily-digest
```
*(Make sure Cloudflare token environment variables are exported or present).*

### 8. Push Changes to GitHub
Commit the new `news.json` and push to GitHub:
```bash
git add src/data/news.json
git commit -m "Auto-update: Daily news generated and verified by Antigravity Agent"
git push origin main
```
