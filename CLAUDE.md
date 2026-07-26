# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (tsx runs `server.ts`, which serves the API/WebSocket and mounts Vite in middleware mode). App runs on http://localhost:3000.
- `npm run build` — Vite build of the frontend + esbuild bundle of `server.ts` to `dist/server.cjs`.
- `npm run start` — run the production bundle (`node dist/server.cjs`; serves static files from `dist/` when `NODE_ENV=production`).
- `npm run lint` — type check only (`tsc --noEmit`). There is no separate linter and no test suite.

Note: `npm run clean` uses `rm -rf`, which fails on Windows PowerShell — use `Remove-Item -Recurse -Force dist` instead.

## What this is

A real-time Solana DEX arbitrage opportunity dashboard (originally scaffolded from Google AI Studio). A single Express server (`server.ts`) hosts everything on port 3000:

- **WebSocket server** (`ws` attached to the HTTP server) — broadcasts `ArbOpportunity` events to all connected clients and accepts inbound messages (post opportunities, ping, clear, simulation controls).
- **REST API** — `GET/POST/DELETE /api/opportunities`, `POST /api/simulation/toggle`, `POST /api/simulation/speed`, `GET /api/status`. External bots can push opportunities via either WS or REST.
- **Simulation mode** — server-side mock opportunity generator (disabled by default, toggled via API/WS) producing realistic PumpSwap/Meteora/Raydium/Orca arb data.
- **Frontend hosting** — Vite middleware in dev, static `dist/` in production.

State is entirely in-memory: `opportunities` array capped at 1000 server-side, 500 client-side.

## Architecture

- **`src/types.ts` is the shared contract** between server and client: `ArbOpportunity` (the core event schema), `WSClientMessage` / `WSServerMessage` (discriminated unions for the WS protocol), `ServerStatus`, `FilterState`, `MetricSummary`. Any protocol change must be made here first; server (`server.ts`) and client (`src/hooks/useArbWebSocket.ts`) both consume it.
- **`src/hooks/useArbWebSocket.ts`** is the single source of client state. It connects first to `ws://localhost:8787/ws` (external bot endpoint), falls back to the page host (this server), auto-reconnects every 2s alternating between the two, pings every 10s for latency, dedupes opportunities by `id`, and tracks `newOppIds` for the 2.5s highlight animation. All components receive data as props from `App.tsx` — there is no other state management.
- **`src/components/`** are presentational: `Header` (connection status + simulation controls), `MetricsCards`/`AnalyticsCharts` (aggregates computed from the opportunities array), `OpportunityGrid` (main table), `TelemetryConsole` (raw packet log), `OpportunityDetailModal`, `WebSocketDocs` and `PayloadTester` (overlay panels for integrating external bots).
- The server accepts opportunities in three shapes (raw `ArbOpportunity`, `{type:'post_opportunity', opportunity}`, `{type:'opportunity', data}`) and backfills `id`/`timestamp`/`detectedAt` if missing — keep this tolerance when modifying ingestion.

## Conventions

- Styling: Tailwind CSS v4 (via `@tailwindcss/vite`), dark terminal aesthetic (`bg-[#0A0A0B]`, monospace font), inline utility classes only — no CSS modules.
- SOL price is hardcoded (`solPriceUsd={185}` in `App.tsx`) for USD conversions.
- `vite.config.ts` honors `DISABLE_HMR=true` (AI Studio agent-edit mode) — do not remove that handling.
