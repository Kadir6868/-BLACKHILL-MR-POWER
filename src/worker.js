const DEFAULT_SYSTEM = `You are Mr. Power, the digital assistant for the BLACKHILL website. Respond in the user's language. Keep answers concise, accurate, and professional. Use only the source archive for factual claims. If evidence is missing, say that the archive does not contain it.`;

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extra,
    },
  });

function cors(origin, env) {
  const allowed = (env.ALLOWED_ORIGIN || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (!origin || !allowed.length) return {};
  return allowed.includes(origin)
    ? {
        'Access-Control-Allow-Origin': origin,
        Vary: 'Origin',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    : {};
}

async function archiveSearch(db, question) {
  if (!db || !question) return [];

  const tokens = [...new Set((question.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || []))]
    .slice(0, 8)
    .filter(Boolean);

  if (!tokens.length) return [];

  const query = tokens.map((t) => `"${t.replace(/"/g, '')}"`).join(' OR ');

  try {
    const rows = await db
      .prepare(`
        SELECT id, title, category, source_url, body
        FROM documents
        WHERE id IN (
          SELECT rowid FROM document_search WHERE document_search MATCH ? LIMIT 5
        )
      `)
      .bind(query)
      .all();

    return rows.results || [];
  } catch {
    return [];
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const headers = cors(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname === '/api/health') {
      return json({ ok: true, service: 'blackhill-mr-power', model: env.GROQ_MODEL || 'llama-3.3-70b-versatile' }, 200, headers);
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      if (origin && !headers['Access-Control-Allow-Origin']) {
        return json({ error: 'Origin not allowed' }, 403, headers);
      }

      if (!env.DB || !env.GROQ_API_KEY) {
        return json({ error: 'Server configuration is missing. Set D1 DB and GROQ_API_KEY.' }, 503, headers);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON' }, 400, headers);
      }

      const message = typeof body.message === 'string' ? body.message.trim() : '';
      if (!message || message.length > 1500) {
        return json({ error: 'Message length must be 1-1500 characters.' }, 400, headers);
      }

      const history = Array.isArray(body.history)
        ? body.history.slice(-8).filter((m) => m && m.role && typeof m.content === 'string').map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content).slice(0, 1000),
          }))
        : [];

      const docs = await archiveSearch(env.DB, message);
      const context = docs.length
        ? docs.map((d) => `[Source ${d.id}] ${d.title} (${d.category}) ${d.source_url || ''}\n${(d.body || '').slice(0, 1200)}`).join('\n\n')
        : 'No relevant archive entries are available.';

      const payload = {
        model: env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.35,
        max_tokens: 700,
        messages: [
          { role: 'system', content: `${DEFAULT_SYSTEM}\n\nArchive context:\n${context}` },
          ...history,
          { role: 'user', content: message },
        ],
      };

      try {
        const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!upstream.ok) {
          const text = await upstream.text();
          return json({ error: 'Groq request failed.', detail: text }, upstream.status, headers);
        }

        const data = await upstream.json();
        const reply = data?.choices?.[0]?.message?.content || 'I could not generate a response.';

        return json({ ok: true, reply, sources: docs.map((d) => ({ id: d.id, title: d.title, source_url: d.source_url })) }, 200, headers);
      } catch (err) {
        return json({ error: 'Unexpected error while contacting Groq.', detail: String(err) }, 500, headers);
      }
    }

    if (url.pathname === '/api/admin/documents' && request.method === 'POST') {
      const supplied = request.headers.get('Authorization') || '';
      if (!env.ADMIN_TOKEN || supplied !== `Bearer ${env.ADMIN_TOKEN}`) {
        return json({ error: 'Unauthorized' }, 401, headers);
      }

      if (!env.DB) {
        return json({ error: 'D1 database is not configured.' }, 503, headers);
      }

      let doc;
      try {
        doc = await request.json();
      } catch {
        return json({ error: 'Invalid JSON' }, 400, headers);
      }

      const title = typeof doc.title === 'string' ? doc.title.trim() : '';
      const body = typeof doc.body === 'string' ? doc.body.trim() : '';
      if (!title || title.length < 2 || title.length > 200 || body.length < 20 || body.length > 100000) {
        return json({ error: 'Invalid document payload.' }, 400, headers);
      }

      const category = typeof doc.category === 'string' && doc.category.trim() ? doc.category.trim().slice(0, 100) : 'Araştırma';
      const source_url = typeof doc.source_url === 'string' ? doc.source_url.trim().slice(0, 500) : '';

      const result = await env.DB.prepare(
        'INSERT INTO documents (title, category, source_url, body) VALUES (?, ?, ?, ?)'
      ).bind(title, category, source_url, body).run();

      return json({ ok: true, id: result.meta.last_row_id }, 200, headers);
    }

    const assetRequest = new Request(request);
    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(assetRequest);
      if (assetResponse.status !== 404) return assetResponse;
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      return env.ASSETS ? env.ASSETS.fetch(new Request(new URL('/index.html', request.url))) : new Response('Not found', { status: 404 });
    }

    if (url.pathname === '/admin' || url.pathname === '/admin.html') {
      return env.ASSETS ? env.ASSETS.fetch(new Request(new URL('/admin.html', request.url))) : new Response('Not found', { status: 404 });
    }

    return new Response('Not found', { status: 404, headers });
  },
};

