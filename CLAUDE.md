# This repo is a pod riff: pods write the prompt, the agent does the work

This repo is a copy of [`comp4020-riff8-baishi-2`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff8-baishi-2) at
`cb6b77a6` --- bada's crit agent's final project as it stood at
`10-fly-by-instruments`. Their repo is untouched and off limits. From here to the end of
semester, each crit a pod picks this repo up from wherever the last run left
it.

**Pods: the only file you change is `prompt.md`, at the repo root.** Read the
live app, the code and the history, then write the prompt that would take
this app to a strong, interesting answer to the next brief (the crit runsheet
links it). The prompt can point at any file here. After the session,
bada's crit agent runs `prompt.md` once, unattended, start to finish, and
nobody is there to answer its questions --- so say what you want, what good
looks like and what to leave alone. Push it before you leave.

**Crit agent: when `prompt.md` exists, it is your brief.** Run it to
completion in one go, keep `main` deployable, and delete `prompt.md` in your
last commit. Leave this block of `CLAUDE.md` as it is.

**Nothing here is marked.** No cutoff, no reflection, no `PROCESS.md` entry.
The next crit opens by looking at where each pod repo ended up, beside the
prompt that got it there (the `prompt-crit<N>` tag).

**The agent's own spec tests are `spec/server.test.ts` and `spec/sim.test.ts`.** They encode the brief it was
working to, and they gate the deploy. A prompt aimed at a different brief can
have them changed or deleted; keep `spec/invariants.test.ts` green, since that
one is true of any good site.

Everything below this line was written for the agent's graded submission. Its
marks, cutoff and weekly skills don't govern this repo: read it for how the
agent was directed, not for what anyone owes.

---

# Your harness

Plenty is a multiplayer game: one Node process (`server/`) owns every room's simulation (`shared/sim.ts`) and serves a statically exported Next.js shell (`app/`, `client/`). [`README.md`](README.md) is the argument: what good means here. Every rule below names the README claim it protects; `spec/docs.test.ts` fails if a claim the README enforces isn't named here, or cites a test that doesn't exist. `docs/PLAYING.md` is the player guide and `docs/` holds the design, architecture, decisions and test evidence. Read `docs/ARCHITECTURE.md` before changing the protocol, persistence or deployment.

## What the game must never do

- **The world is finite.** Never make or lose natural stock off the books. Every family keeps `initial + restored = remaining + extracted + destroyed`, and `ledgerHolds` must stay true on every tick. The Green Lobby's finite, per-family seed bank is the only source of `restored`; nothing else creates stock. Goods and machine buffers are separate whole-number stores outside the ledger, never negative, and transfers conserve them. Salvage stays strictly below cost, goods and kits included; buffered contents come back once. No world comes back fresh, and the next world is a pure function of seed and stage.
- **Care pays, but only within the same world.** Efficient choices (careful harvesting, kits, sealed pipe, Sun Gardens) must get more useful work from the same stock and never create stock. Keep the rushed and sustainable bots' measured trade-off true after any balance change in `shared/content.ts`, and re-measure the tables in `docs/DESIGN.md`.
- **The server decides contention.** Never let a browser decide an outcome. Clients send intentions; `applyCommand` and `tick` decide, one at a time, first command read wins, and the loser is told why. Validate every field server-side, whatever the UI allows. Economy allocation runs in a fixed order (building id, tile order), never message order. Idle, blocked or disconnected machines consume nothing.
- **The restraint ending needs everyone present.** Only in the last world, only when every connected player agrees; a harvest withdraws a vote and a dropped connection never completes one. The ending is permanent; a new campaign is a new room.
- **You can come back tomorrow.** Never advance a world without its players or wipe a finished campaign: empty rooms pause ([ADR 0001](docs/adr/0001-empty-rooms-pause.md)). A browser's identity is its per-room token in localStorage, and the front page lists those worlds from localStorage alone. A marker's world from yesterday must still open: bump `SCHEMA_VERSION` with a migration in `server/migrate.ts` for an incompatible saved-state change, and `PROTOCOL_VERSION` for an incompatible wire change.
- **It survives a restart.** A stage boundary is saved before it's announced; rooms save every 5 s, when they empty and on SIGTERM. A restarted server refuses in-flight commands from the old incarnation rather than replaying them.
- **You see each other act.** A change reaches every open session within a second, with no reload. A slow client is never waited for; past 1 MB queued it's dropped and rejoins from a snapshot. React never renders per-entity updates: the renderer reads `GameClient.state` in its own frame loop; the HUD polls at 5 Hz.
- **It fits an afternoon.** The short campaign stays within the time the front page states (asserted in `spec/sim.test.ts`); change the copy and the bound together. No timers, fake progress or skips: pace comes from `PACES` only.
- Leave a deposit unreachable. Buildings can't cover a deposit with stock left, nothing blocks movement, and claims never stop walking or harvesting. Leaving a world is gated on exact exhaustion only; the chain guides play and never blocks a transition, and the lobby stops the moment a world is spent.
- Accept a write or a WebSocket from another origin, or render user text as anything but text (React children, `textContent`, `fillText`).
- Log a token. Every player and lobby action is an event (`Changes.events`) the server prints as one logfmt line with the actor's id and name, so the log tells who did what.

## What a change must not break

- One owner per room: one process, one Fly machine, `--ha=false`. Replicas need owner routing first.
- Shared code is imported with explicit `.ts` extensions and uses erasable TypeScript only, because node runs `server/` and `shared/` with type stripping.
- What the README leaves out stays out (accounts, chat, a public room list, leaderboards, combat, offline progress) unless the README's argument changes first.
- A feature has to serve a README claim. If it serves none, cut it or argue for it in the README.
- `pnpm check` and `pnpm check:evidence` pass before a commit. The spec needs a running server: `pnpm build && pnpm start`, or `APP_URL`.

## Working on it

- `node scripts/playbot.ts <ROOM> [url] [name] [rush|green|hand]` fills a room with a bot that plays the chain; its decisions are `scripts/brain.ts`, which the spec also runs. Use bots plus a browser to see later worlds and dense scenes.
- When you change behaviour, update the doc that describes it in the same commit. A contention behaviour (who wins, what a slow client sees) is a decision: record it in `docs/DECISIONS.md` with the test that holds it.
- `README.md` is 400--600 words and `PROCESS.md` 900--1100, both checked by `spec/docs.test.ts`. When you add a test the README cites, use its exact name.
