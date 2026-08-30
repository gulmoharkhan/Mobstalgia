import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { URL } from 'node:url';

import { Router } from './src/router.js';
import { readJson, readForm, sendHtml, redirect } from './src/utils.js';
import { parseCookies, getSessionAdmin } from './src/auth.js';
import { getSessionCustomer } from './src/customerAuth.js';
import { SESSION_COOKIE, CUSTOMER_SESSION_COOKIE, PORT } from './src/config.js';
import { runSeed } from './src/seed.js';
import { UPLOADS_DIR } from './src/images.js';

import * as pub from './src/handlers/public.js';
import * as api from './src/handlers/api.js';
import * as admin from './src/handlers/admin.js';
import * as account from './src/handlers/account.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');

runSeed();

const router = new Router();

// ---- Public pages ----
router.get('/', pub.home);
router.get('/shop', pub.shop);
router.get('/piece/:id', pub.piece);
router.get('/track', pub.trackPageGet);
router.get('/feedback', pub.feedbackPageGet);
router.post('/feedback', pub.feedbackPagePost);
router.get('/about', pub.aboutPage);

// ---- Public JSON API ----
router.get('/api/frames', api.getFrames);
router.post('/api/feedback', api.submitFeedback);

// ---- Customer accounts ----
router.get('/account/signup', account.signupPageGet);
router.post('/account/signup', account.signupPagePost);
router.get('/account/login', account.loginPageGet);
router.post('/account/login', account.loginPagePost);
router.post('/account/logout', account.logoutPost);
router.post('/api/snake-score', account.submitSnakeScore);
router.get('/api/leaderboard', account.getLeaderboard);

// ---- Admin auth ----
router.get('/admin/login', admin.loginPageGet);
router.post('/admin/login', admin.loginPagePost);
router.post('/admin/logout', admin.logoutPost);

// ---- Admin (protected) ----
router.get('/admin', admin.dashboard);
router.get('/admin/frames', admin.framesListPage);
router.get('/admin/frames/new', admin.frameNewPage);
router.get('/admin/frames/:id/edit', admin.frameEditPage);
router.post('/admin/api/frames', admin.frameCreateApi);
router.post('/admin/api/frames/bulk-delete', admin.frameBulkDeleteApi);
router.post('/admin/api/frames/:id', admin.frameUpdateApi);
router.post('/admin/frames/:id/delete', admin.frameDeletePost);
router.get('/admin/orders', admin.ordersListPage);
router.get('/admin/orders/:id', admin.orderDetailPage);
router.post('/admin/orders/:id/status', admin.orderStatusPost);
router.get('/admin/feedback', admin.feedbackListPage);
router.post('/admin/feedback/:id/read', admin.feedbackMarkReadPost);
router.get('/admin/settings', admin.settingsPage);
router.post('/admin/settings/password', admin.settingsPasswordPost);
router.post('/admin/api/settings/cover-image', admin.settingsCoverImageApi);
router.post('/admin/api/settings/why-choose-image', admin.settingsWhyChooseImageApi);
router.get('/admin/walls', admin.wallsListPage);
router.get('/admin/walls/new', admin.wallNewPage);
router.get('/admin/walls/:id/edit', admin.wallEditPage);
router.post('/admin/api/walls', admin.wallCreateApi);
router.post('/admin/api/walls/:id', admin.wallUpdateApi);
router.post('/admin/walls/:id/delete', admin.wallDeletePost);

const PROTECTED_PREFIX = '/admin';
const PUBLIC_ADMIN_PATHS = new Set(['/admin/login']);

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
};

function tryServeStatic(pathname, res) {
  if (pathname.includes('..')) return false;

  // Uploaded images may live on a separate mounted volume (UPLOADS_DIR env var) on
  // hosts with persistent disks, rather than under the app's own public/ folder.
  let baseDir = PUBLIC_DIR;
  let relPath = pathname;
  if (pathname.startsWith('/uploads/')) {
    baseDir = UPLOADS_DIR;
    relPath = pathname.slice('/uploads/'.length);
  }

  const filePath = path.join(baseDir, relPath);
  if (!filePath.startsWith(baseDir)) return false;
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return false;
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=300' });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(url.pathname);
    const query = Object.fromEntries(url.searchParams.entries());

    if (req.method === 'GET' && tryServeStatic(pathname, res)) return;

    const match = router.match(req.method, pathname);
    if (!match) {
      sendHtml(res, 404, '<h1>404 — Not Found</h1><a href="/">Go home</a>');
      return;
    }

    const cookies = parseCookies(req);
    const ctx = { req, res, params: match.params, query, cookies };
    ctx.customer = getSessionCustomer(cookies[CUSTOMER_SESSION_COOKIE]);

    if (pathname.startsWith(PROTECTED_PREFIX) && !PUBLIC_ADMIN_PATHS.has(pathname)) {
      const adminUser = getSessionAdmin(cookies[SESSION_COOKIE]);
      if (!adminUser) {
        redirect(res, '/admin/login');
        return;
      }
      ctx.admin = adminUser;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        ctx.json = await readJson(req);
      } else {
        ctx.form = await readForm(req);
      }
    }

    await match.handler(ctx);
  } catch (err) {
    console.error('Request error:', err);
    if (!res.headersSent) {
      sendHtml(res, 500, `<h1>500 — Something went wrong</h1><p>${err.message}</p>`);
    }
  }
});

server.listen(PORT, () => {
  console.log(`Teardown Frames running at http://localhost:${PORT}`);
});
