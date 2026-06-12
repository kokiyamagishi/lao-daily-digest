const { chromium } = require('playwright');

const FACEBOOK_PAGES = [
  { name: "Lao Pháttháná Lpf", id: "LaoPhathanaNews" },
  { name: "Tholakhong", id: "tholakhong" },
  { name: "Laopost", id: "laopost" },
  { name: "KPL Lao News Agency", id: "kplnews" }
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const results = [];
  
  for (const pageInfo of FACEBOOK_PAGES) {
    try {
      const page = await context.newPage();
      await page.goto(`https://www.facebook.com/${pageInfo.id}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Wait for posts to render
      await page.waitForTimeout(4000);
      
      const posts = await page.evaluate((sourceName) => {
        const items = [];
        const articleElements = document.querySelectorAll('div[role="article"]');
        
        articleElements.forEach((el) => {
          const textEl = el.querySelector('div[data-ad-comet-preview="post_message"]') || el;
          const text = textEl ? textEl.innerText : '';
          
          const links = Array.from(el.querySelectorAll('a')).map(a => a.href);
          const postUrl = links.find(href => href.includes('/posts/') || href.includes('/permalink/') || href.includes('/photos/') || href.includes('/videos/')) || '';
          
          if (text && text.trim().length > 10 && !text.includes('Log In') && !text.includes('Create new account')) {
            items.push({
              source: sourceName,
              text: text.substring(0, 1000),
              date: new Date().toISOString().split('T')[0],
              url: postUrl || `https://facebook.com`
            });
          }
        });
        
        return items;
      }, pageInfo.name);
      
      const uniquePosts = [];
      const seenTexts = new Set();
      for (const p of posts) {
        const cleanText = p.text.trim();
        if (cleanText && !seenTexts.has(cleanText)) {
          seenTexts.add(cleanText);
          uniquePosts.push(p);
        }
      }
      
      results.push(...uniquePosts.slice(0, 3));
      await page.close();
    } catch (e) {
      console.error(`Error on ${pageInfo.name}:`, e.message);
    }
  }
  
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
