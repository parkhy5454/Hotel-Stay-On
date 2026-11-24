// Bundled into server-dist/index.js at build time (see vercel.json).
// Vercel runs the bundle; the Express app is the default export.
import app from "../artifacts/api-server/src/app";

export default app;
