// Vercel serverless entry for the Express API.
// Vercel invokes the default-exported Express app per request; it does not
// call app.listen(). The local dev server still lives in
// artifacts/api-server/src/index.ts.
import app from "../artifacts/api-server/src/app";

export default app;
