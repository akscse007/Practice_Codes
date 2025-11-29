// backend/src/models/User.js
// Thin shim that re-exports the root User model (backend/models/User.js)
// so all parts of the app share the same schema that matches the Mongo validator.

module.exports = require('../../models/User');
