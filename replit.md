# 스테이온

호텔·모텔 파트너가 객실을 등록하고 여행객이 숙소를 검색해 예약 요청을 보내는 한국어 숙박 플랫폼입니다.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/stay-on` — customer booking experience and partner portal
- `artifacts/api-server` — shared API routes, including stays, bookings, and partner operations
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema/` — PostgreSQL tables for partners, stays, rooms, and bookings

## Architecture decisions

- Clerk sign-in is required for hotel partners; guest reservations use contact details and do not require an account.
- A reservation starts as a request. Partners can confirm or cancel it; online payment is not included in this MVP.
- Partner ownership is tied to the signed-in Clerk user on the server.

## Product

Guests can browse stays by location and dates, compare room types and prices, submit a reservation request, and look up its status with a confirmation code. Hotel partners can register, publish property and room details, and manage incoming requests.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
