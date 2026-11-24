---
name: Clerk web SDK compatibility
description: Runtime compatibility lessons for Clerk React package upgrades.
---

Match the installed Clerk React SDK with the actual `@clerk/shared` exports it imports. A Clerk React install can pass TypeScript but fail Vite dependency optimization if the resolved shared package is older than the SDK expects. The Clerk React 6 web API uses `Show` for signed-in/signed-out conditional rendering; `SignedIn` and `SignedOut` are not exported.

**Why:** The initial web dependency set failed at runtime because the Clerk React package imported a UI-script helper missing from the shared package resolved by pnpm.

**How to apply:** After changing Clerk package versions, inspect the resolved dependency tree and run the Vite workflow; use exports from the installed version rather than relying on prior SDK examples.
