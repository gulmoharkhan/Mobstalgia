import { renderLayout } from '../views/layout.js';
import { renderSignup } from '../views/account/signup.js';
import { renderLogin } from '../views/account/login.js';
import { sendHtml, sendJson, redirect } from '../utils.js';
import { createCustomer, verifyCustomerLogin, createCustomerSession, destroyCustomerSession } from '../customerAuth.js';
import { CUSTOMER_SESSION_COOKIE } from '../config.js';
import * as models from '../models.js';

const COOKIE_SECURE_FLAG = process.env.NODE_ENV === 'production' ? '; Secure' : '';

function sessionCookie(token, expires) {
  return `${CUSTOMER_SESSION_COOKIE}=${token}; HttpOnly; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax${COOKIE_SECURE_FLAG}`;
}

function clearedSessionCookie() {
  return `${CUSTOMER_SESSION_COOKIE}=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT${COOKIE_SECURE_FLAG}`;
}

export async function signupPageGet(ctx) {
  if (ctx.customer) return redirect(ctx.res, ctx.query.next || '/about');
  sendHtml(ctx.res, 200, renderLayout({ title: 'Sign up', customer: ctx.customer, bodyHtml: renderSignup({ next: ctx.query.next }) }));
}

export async function signupPagePost(ctx) {
  try {
    const { displayName, email, password } = ctx.form;
    const customer = createCustomer({ displayName, email, password });
    const { token, expires } = createCustomerSession(customer.id);
    redirect(ctx.res, ctx.form.next || '/about', { 'Set-Cookie': sessionCookie(token, expires) });
  } catch (err) {
    sendHtml(
      ctx.res,
      400,
      renderLayout({
        title: 'Sign up',
        customer: ctx.customer,
        bodyHtml: renderSignup({ error: err.message, prefill: ctx.form, next: ctx.form.next }),
      })
    );
  }
}

export async function loginPageGet(ctx) {
  if (ctx.customer) return redirect(ctx.res, ctx.query.next || '/about');
  sendHtml(ctx.res, 200, renderLayout({ title: 'Sign in', customer: ctx.customer, bodyHtml: renderLogin({ next: ctx.query.next }) }));
}

export async function loginPagePost(ctx) {
  const { email, password } = ctx.form;
  const customer = verifyCustomerLogin(email, password);
  if (!customer) {
    return sendHtml(
      ctx.res,
      401,
      renderLayout({
        title: 'Sign in',
        customer: ctx.customer,
        bodyHtml: renderLogin({ error: 'Incorrect email or password.', prefill: ctx.form, next: ctx.form.next }),
      })
    );
  }
  const { token, expires } = createCustomerSession(customer.id);
  redirect(ctx.res, ctx.form.next || '/about', { 'Set-Cookie': sessionCookie(token, expires) });
}

export async function logoutPost(ctx) {
  if (ctx.cookies[CUSTOMER_SESSION_COOKIE]) destroyCustomerSession(ctx.cookies[CUSTOMER_SESSION_COOKIE]);
  redirect(ctx.res, ctx.form?.next || '/about', { 'Set-Cookie': clearedSessionCookie() });
}

/* ---------------------------- Snake score API ---------------------------- */

export async function submitSnakeScore(ctx) {
  try {
    if (!ctx.customer) return sendJson(ctx.res, 401, { error: 'Sign in to save your score.' });
    const score = Number(ctx.json?.score);
    models.recordSnakeScore(ctx.customer.id, score);
    sendJson(ctx.res, 200, { ok: true, leaderboard: models.getSnakeLeaderboard(), best: models.getCustomerBestScore(ctx.customer.id) });
  } catch (err) {
    sendJson(ctx.res, 400, { error: err.message });
  }
}

export async function getLeaderboard(ctx) {
  sendJson(ctx.res, 200, { leaderboard: models.getSnakeLeaderboard() });
}
