export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Reactアプリ公開後は特定のURL（例: 'https://news.issarapon.com'）に固定することを推奨
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // OPTIONS (CORSプリフライトリクエスト用)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // GET /api/latest
    if (request.method === 'GET' && url.pathname === '/api/latest') {
      try {
        const latestData = await env.NEWS_KV.get('latest');
        if (!latestData) {
          return new Response(JSON.stringify({ error: 'No news found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        return new Response(latestData, {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    // POST /api/update
    if (request.method === 'POST' && url.pathname === '/api/update') {
      try {
        // APIシークレットキーによる簡易認証
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== `Bearer ${env.API_SECRET_KEY}`) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const payload = await request.json();
        const { title, content, date } = payload;

        if (!title || !content || !date) {
          return new Response(JSON.stringify({ error: 'Missing parameters' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const dataToStore = JSON.stringify({
          title,
          content,
          date,
          updatedAt: new Date().toISOString()
        });

        // KVに最新ニュースと日付別アーカイブの2パターンで保存
        await env.NEWS_KV.put('latest', dataToStore);
        await env.NEWS_KV.put(`digest:${date}`, dataToStore);

        return new Response(JSON.stringify({ success: true, message: 'Digest updated successfully' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    // ルート外アクセス
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};
