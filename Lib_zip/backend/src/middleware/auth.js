/**
 * E:\Codes\LibRepo\Mern\backend\middleware\auth.js
 *
 * Compatibility shim: some files expect middleware at ../middleware/auth
 * while your project uses ../middlewares/jwtAuth (or src/middleware). To avoid
 * changing many require() calls, this shim re-exports the real implementation.
 *
 * If you later standardize on a single directory name, remove this shim.
 */

try {
  // Prefer the existing middlewares folder if present
  module.exports = require('../middlewares/jwtAuth');
} catch (e) {
  try {
    // Fallback to src middleware (common in some project layouts)
    module.exports = require('../src/middleware/auth');
  } catch (err) {
    // If neither exists, throw a helpful error so startup logs show the cause.
    throw new Error('Auth middleware not found. Expected ../middlewares/jwtAuth or ../src/middleware/auth. Original errors: ' + e.message + ' | ' + err.message);
  }
}
