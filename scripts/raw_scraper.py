# -*- coding: utf-8 -*-
import os
import json
import subprocess
import feedparser

# 設定
RAW_JSON_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../src/data/raw_scraped.json')

def fetch_facebook_news():
    print("Fetching Facebook posts using Playwright JS wrapper...")
    try:
        script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scrape_fb.cjs')
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

def main():
    fb_news = fetch_facebook_news()
    rss_news = fetch_rss_news()
    all_raw = fb_news + rss_news
    
    if not all_raw:
        print("No raw data collected.")
        # We can still write an empty list
        all_raw = []

    os.makedirs(os.path.dirname(RAW_JSON_PATH), exist_ok=True)
    with open(RAW_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(all_raw, f, ensure_ascii=False, indent=2)
    print(f"Successfully wrote {len(all_raw)} raw feeds to {RAW_JSON_PATH}")

if __name__ == '__main__':
    main()
