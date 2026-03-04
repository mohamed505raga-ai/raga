/**
 * Next.js API Route: DELETE /api/products?id=<productId>
 *
 * Permanently removes a product from the store (data/store-data.json in GitHub).
 * Uses the same GitHub env as the orders API: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH.
 * Returns 200 with { success: true, products } on success so the admin can update state.
 */

const GITHUB_API = 'https://api.github.com';
const STORE_DATA_PATH = 'data/store-data.json';

function corsHeaders(origin) {
  const o = origin || '*';
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

function setCors(res, origin) {
  Object.entries(corsHeaders(origin)).forEach(([k, v]) => res.setHeader(k, v));
}

function setJsonContentType(res) {
  res.setHeader('Content-Type', 'application/json');
}

async function getFile(owner, repo, path, branch, token) {
  const url = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub GET failed: ${res.status} ${err}`);
  }
  return res.json();
}

async function putFile(owner, repo, path, content, sha, branch, token, message) {
  const url = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`;
  const body = {
    message: message || 'Update store data',
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT failed: ${res.status} ${err}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer || 'https://example.com').origin : '*');

  const sendJson = (status, body) => {
    setCors(res, origin);
    setJsonContentType(res);
    res.status(status).json(body);
  };

  try {
    if (req.method === 'OPTIONS') {
      setCors(res, origin);
      res.status(204);
      return res.end();
    }

    if (req.method !== 'DELETE') {
      sendJson(405, { error: 'Method not allowed', success: false });
      return;
    }

    const productId = (req.query.id || '').toString().trim();
    if (!productId) {
      sendJson(400, { error: 'Query parameter id is required', success: false });
      return;
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = (process.env.GITHUB_BRANCH || 'main').trim() || 'main';

    if (!token || !owner || !repo) {
      console.error('[api/products] Missing env: GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO');
      sendJson(500, { error: 'Products API not configured (missing env)', success: false });
      return;
    }

    const file = await getFile(owner, repo, STORE_DATA_PATH, branch, token);
    const content = Buffer.from(file.content, 'base64').toString('utf8');
    const data = JSON.parse(content);

    if (!Array.isArray(data.products)) {
      sendJson(500, { error: 'Store data has no products array', success: false });
      return;
    }

    const previousLength = data.products.length;
    data.products = data.products.filter((p) => p && p.id !== productId);

    if (data.products.length === previousLength) {
      sendJson(404, { error: 'Product not found', success: false });
      return;
    }

    const newContent = JSON.stringify(data, null, 2);
    await putFile(
      owner,
      repo,
      STORE_DATA_PATH,
      newContent,
      file.sha,
      branch,
      token,
      'Delete product ' + productId
    );

    sendJson(200, { success: true, ok: true, products: data.products });
  } catch (err) {
    console.error('[api/products] Error', err.message, err.stack);
    sendJson(500, {
      error: 'Failed to delete product',
      detail: err.message,
      success: false,
    });
  }
}
