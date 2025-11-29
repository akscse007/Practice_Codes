/**
 * E:\Codes\LibRepo\Mern\backend\routes\authRoutes.js
 *
 * Defensive + verbose router used for debugging missing handler exports.
 * It logs the resolved controller module (type and keys) and refuses to mount
 * routes with undefined handlers.
 */

const express = require('express');
const router = express.Router();

function tryRequire(paths) {
  let lastErr = null;
  for (const p of paths) {
    try {
      const mod = require(p);
      return { mod, path: p };
    } catch (err) {
      lastErr = err;
    }
  }
  const err = new Error('Failed to require authController from paths: ' + paths.join(', ') + '. Last error: ' + (lastErr && lastErr.message));
  err.original = lastErr;
  throw err;
}

let attempt;
try {
  attempt = tryRequire([
    '../controllers/authController',
    '../src/controllers/authController',
    './authController',
    '../controllers/auth'
  ]);
} catch (e) {
  console.error('authRoutes: cannot locate authController. Error:', e.message);
  // Re-throw so app startup fails loudly and you can see the message
  throw e;
}

const authCtrl = attempt.mod;
console.log('authRoutes: loaded authController from', attempt.path);
console.log('authRoutes: controller typeof ->', typeof authCtrl);

// If it's an object, print the keys. If it's a function, print its properties (if any).
if (authCtrl && typeof authCtrl === 'object') {
  console.log('authRoutes: controller keys ->', Object.keys(authCtrl));
} else {
  console.log('authRoutes: controller value ->', authCtrl);
}

// A helper to safely mount routes only if handler is a function
function safeMount(method, path, handler, name) {
  if (typeof handler !== 'function') {
    console.error(`authRoutes: Handler for ${method.toUpperCase()} ${path} (${name}) is not a function — found:`, typeof handler);
    throw new Error(`authRoutes: missing handler for ${method} ${path} -> ${name}`);
  }
  router[method](path, handler);
}

// mount routes (use safeMount to avoid undefined handlers)
safeMount('post', '/register', authCtrl.register, 'register');
safeMount('post', '/login', authCtrl.login, 'login');
safeMount('post', '/google', authCtrl.googleSignIn, 'googleSignIn');
safeMount('post', '/refresh', authCtrl.refreshToken, 'refreshToken');
safeMount('post', '/logout', authCtrl.logout, 'logout');

// Protected /me route: try to require verifyToken from common locations
let verifyToken = null;
try {
  const mwAttempt = tryRequire([
    '../middleware/auth',
    '../middlewares/jwtAuth',
    '../src/middleware/auth',
    '../src/middleware/authMiddleware',
    '../middlewares/auth'
  ]);
  const mw = mwAttempt.mod;
  console.log('authRoutes: loaded middleware from', mwAttempt.path);
  verifyToken = mw.verifyToken || mw;
  console.log('authRoutes: verifyToken typeof ->', typeof verifyToken);
} catch (e) {
  console.warn('authRoutes: verifyToken middleware not found via fallbacks; /me will return diagnostic (not crash).');
}

if (typeof verifyToken === 'function') {
  router.get('/me', verifyToken, (req, res) => res.json({ success: true, user: req.user }));
} else {
  router.get('/me', (req, res) => res.status(501).json({ success: false, message: 'Auth middleware not configured' }));
}

module.exports = router;
