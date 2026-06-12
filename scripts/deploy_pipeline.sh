#!/bin/bash
# 自動ニューススクレイピング・パイプライン (Agent駆動用)

# スクリプトがあるディレクトリからプロジェクトルートへ移動
cd "$(dirname "$0")/.."

echo "=== [1/1] Running Daily News Scraper ==="
python3 scripts/raw_scraper.py
if [ $? -ne 0 ]; then
  echo "Error: Daily news scraping failed."
  exit 1
fi

echo "=== Raw scraped data is saved. The Antigravity Agent will now take over news generation, verification, build, and deploy. ==="

