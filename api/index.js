// Vercel serverless entry. The real handler is bundled by the build step into
// server-dist/index.js, so Vercel never compiles TypeScript here.
module.exports = require("../server-dist/index.js").default;
