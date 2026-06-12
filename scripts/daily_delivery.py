# -*- coding: utf-8 -*-
import os
import json
import requests
import feedparser

# 設定
JSON_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../src/data/news.json')
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

FACEBOOK_PAGES = [
    {"name": "Lao Pháttháná Lpf", "id": "LaoPhathanaNews"},
    {"name": "Tholakhong", "id": "tholakhong"},
    {"name": "Laopost", "id": "laopost"},
    {"name": "KPL Lao News Agency", "id": "kplnews"}
]

def fetch_facebook_news():
    print("Fetching Facebook posts using Playwright JS wrapper...")
    try:
        script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scrape_fb.cjs')
        import subprocess
        result = subprocess.run(['node', script_path], capture_output=True, text=True, check=True)
        posts = json.loads(result.stdout)
        print(f"Successfully scraped {len(posts)} posts from Facebook via Playwright.")
        return posts
    except Exception as e:
        print(f"Failed to fetch Facebook posts using Playwright: {e}")
        return []

def fetch_rss_news():
    raw_news = []
    print("Fetching RSS feeds...")
    
    feeds = [
        {"name": "Lao News Agency (KPL)", "url": "http://kpl.gov.la/EN/rss.aspx", "limit": 5},
        {"name": "Laotian Times", "url": "https://laotiantimes.com/feed/", "limit": 5},
        {"name": "Google News (Laos)", "url": "https://news.google.com/rss/search?q=Laos&hl=en-US&gl=US&ceid=US:en", "limit": 10}
    ]
    
    for f in feeds:
        try:
            print(f"Parsing feed: {f['name']}")
            feed = feedparser.parse(f["url"])
            count = 0
            for entry in feed.entries:
                if count >= f["limit"]:
                    break
                text = entry.title
                if hasattr(entry, "description") and entry.description:
                    text += f"\n{entry.description}"
                elif hasattr(entry, "summary") and entry.summary:
                    text += f"\n{entry.summary}"
                
                raw_news.append({
                    "source": f["name"],
                    "text": text[:1500],
                    "date": entry.get("published") or entry.get("updated") or "",
                    "url": entry.link
                })
                count += 1
        except Exception as e:
            print(f"Failed to fetch {f['name']} RSS: {e}")
        
    return raw_news

def generate_articles_via_gemini(raw_data):
    if not GEMINI_API_KEY:
        print("GEMINI_API_KEY not found. Skipping API generation.")
        return []
        
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }
    
    # ハルシネーションを防ぎ、正確なメタデータを維持するためのプロンプト指示
    prompt_instruction = f"""
あなたはラオスのニュースポータルサイトの優秀な日本語編集者です。
入力された生のニュース情報から、信頼性の高い、ハルシネーションのない日本語の要約記事を生成してください。

【厳格な指示】
1. 各記事について、提供された元のソースデータに存在する「source（情報源メディア名）」「url（リンク）」を絶対に偽造せず、そのまま出力JSONに含めること。
2. 記事のタイトル・本文は正確に要約翻訳し、存在しない事実を捏造しないこと。
3. 出力する記事数は、入力データの中で最も重要かつ注目度の高いトピックを **「3〜5件」** に厳密に絞り込んでください。
4. 出力は以下の構造のJSON配列のみを返してください。不要なMarkdown囲み（```json等）は一切含めないでください。

JSON構造の定義:
[
  {{
    "id": "auto-uuid",
    "category": "経済" または "社会" または "国際" または "観光",
    "title": "日本語のタイトル",
    "summary": "1〜2文程度の簡潔な概要",
    "date": "YYYY-MM-DD形式",
    "readTime": "3 min read"などの推測時間,
    "source": "提供された元のメディア名",
    "picksCount": 0,
    "viewsCount": 0,
    "image": "",
    "takeaways": [
      "重要なポイント1",
      "重要なポイント2",
      "重要なポイント3"
    ],
    "content": "# 本文のタイトル\\n本文詳細（Markdown形式。**太字**や*リスト*などを適度に使用）"
  }}
]

入力データ:
{json.dumps(raw_data, ensure_ascii=False, indent=2)}
"""

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    payload = {
        "contents": [{"parts": [{"text": prompt_instruction}]}]
    }
    
    try:
        res = requests.post(url, headers=headers, json=payload)
        res_json = res.json()
        output_text = res_json['candidates'][0]['content']['parts'][0]['text'].strip()
        
        # 不要なMarkdownマーカーをクリーンアップ
        if output_text.startswith("```"):
            output_text = output_text.split("```")[1]
            if output_text.startswith("json"):
                output_text = output_text[4:]
        
        generated_articles = json.loads(output_text.strip())
        return generated_articles
    except Exception as e:
        print(f"Gemini API invocation failed: {e}")
        return []

def get_themed_image(article):
    title = article.get("title", "").lower()
    content = article.get("content", "").lower()
    summary = article.get("summary", "").lower()
    category = article.get("category", "")
    
    full_text = f"{title} {content} {summary}"
    
    if any(k in full_text for k in ["ベトナム", "vietnam", "外交", "首脳", "両国", "関係", "cooperation", "diplomacy"]):
        return "/lao_vn_coop.png"
    elif any(k in full_text for k in ["王女", "皇室", "王室", "palace", "royal", "princess"]):
        return "/thai_royal_memorial.png"
    elif any(k in full_text for k in ["洞窟", "遭難", "救助", "cave", "rescue"]):
        return "/lao_cave_rescue.png"
    elif any(k in full_text for k in ["物流ハブ", "物流拠点", "エネルギーハブ", "logistics hub"]):
        return "/lao_logistics_hub.png"
    elif any(k in full_text for k in ["aiva", "ai車両", "aiモデル", "aiネイティブ"]):
        return "/aiva_ai_car.png"
    elif any(k in full_text for k in ["電線", "感電", "電線落下", "utility pole", "utility wire"]):
        return "/donnoun_wire_safety.png"
    elif any(k in full_text for k in ["廃棄物", "医療", "病院", "waste", "medical", "clinic", "health"]):
        return "/lao_waste_proj.png"
    elif any(k in full_text for k in ["植樹", "森林", "環境", "tree", "forest", "arbour", "environment"]):
        return "/lao_tree_plant.png"
    elif any(k in full_text for k in ["鉄道", "列車", "高速鉄道", "駅", "railway", "train"]):
        return "/lao_railway.png"
    elif any(k in full_text for k in ["バス", "ev", "電気", "電動", "electricity", "energy"]):
        return "/lao_ev_bus.png"
    elif any(k in full_text for k in ["コーヒー", "珈琲", "農業", "coffee", "agro"]):
        return "/lao_coffee.png"
    elif any(k in full_text for k in ["道路", "インフラ", "ハブ", "接続", "road", "infrastructure", "hub"]):
        return "/lao_road.png"
    elif any(k in full_text for k in ["寺", "仏教", "祭り", "観光", "temple", "festival", "tourism"]):
        return "/lao_temple.png"
        
    if category == "国際":
        return "/lao_vn_coop.png"
    elif category == "社会":
        return "/lao_living_info.png"
    elif category == "経済":
        return "/lao_info_econ.png"
    elif category == "観光":
        return "/lao_temple.png"
        
    return "/lao_patuxai.png"

def main():
    fb_news = fetch_facebook_news()
    rss_news = fetch_rss_news()
    all_raw = fb_news + rss_news
    
    if not all_raw:
        print("No raw data collected.")
        return
        
    new_articles = generate_articles_via_gemini(all_raw)
    if not new_articles:
        print("No articles generated by LLM.")
        return

    # 既存のJSONファイルを読み込んでマージ
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except Exception:
            existing_data = []
    else:
        existing_data = []
        
    # Build sets for deduplication
    existing_ids = {art["id"] for art in existing_data}
    existing_titles = {art.get("title", "").strip().lower() for art in existing_data}
    
    # Custom keywords for semantic deduplication of known hot topics
    has_princess_death = any("王女" in art.get("title", "") and ("逝去" in art.get("title", "") or "逝去" in art.get("summary", "")) for art in existing_data)
    has_cave_rescue = any("洞窟" in art.get("title", "") and ("救助" in art.get("title", "") or "水害" in art.get("title", "") or "洪水" in art.get("title", "")) for art in existing_data)
    has_logistics_hub = any("ハブ" in art.get("title", "") and "首相" in art.get("title", "") for art in existing_data)

    merged_data = []
    added_count = 0
    
    for art in new_articles:
        art_id = art.get("id")
        art_title = art.get("title", "").strip()
        title_lower = art_title.lower()
        
        # Deduplication checks
        if art_id in existing_ids or title_lower in existing_titles:
            continue
            
        # Semantic checks
        if "王女" in art_title and ("逝去" in art_title or "逝去" in art.get("summary", "")):
            if has_princess_death:
                continue
            has_princess_death = True
            
        if "洞窟" in art_title and ("救助" in art_title or "水害" in art_title or "洪水" in art_title):
            if has_cave_rescue:
                continue
            has_cave_rescue = True
            
        if "ハブ" in art_title and "首相" in art_title:
            if has_logistics_hub:
                continue
            has_logistics_hub = True

        # Assign themed image if empty
        if not art.get("image") or art.get("image") == "":
            art["image"] = get_themed_image(art)
            
        merged_data.append(art)
        added_count += 1
            
    # 古い記事を結合 (Ensure mock articles are filtered out from existing data)
    mock_ids = {"art-1", "art-2", "art-3", "art-4", "art-5"}
    for art in existing_data:
        if art.get("id") not in mock_ids:
            merged_data.append(art)
            
    # 保存
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)
        
    print(f"Pipeline finished. Added {added_count} new articles successfully.")

if __name__ == '__main__':
    main()
