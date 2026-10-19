# Process

An agent did all of the work in this repo. Each crit, a pod of students wrote a `prompt.md`, and a Claude crit agent ran it once, unattended, with nobody to ask. The commits are the agents'; the briefs are the pods'. This account follows that record. Read it beside `git log` and the `prompt-crit*` tags.

## From a scroll to a game

The repo started as Long Scroll, a shared drawing wall on a Node and SQLite server ([`2bfeff5`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/2bfeff5)). The crit 9 pod first drafted a prompt to make the scroll live ([`57fb6e5`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/57fb6e5)). They then replaced it with their own brief, *Consume the Universe* ([`a46705d`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/a46705d)): a cosy multiplayer isometric game in which players exhaust Earth, Mars, the Sun, the Solar System and the Universe in turn.

The agent replaced the scroll outright in one commit ([`25927c4`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/25927c4)). Most of the stack was decided there. The next commit wrote the spec ([`897f642`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/897f642)), and a later one rewrote `CLAUDE.md` for the game ([`91159ad`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/91159ad)).

At crit 10 two pods each wrote a prompt. One made the datacentre the summit of a supply chain on claimed land ([`0926cc6`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/0926cc6)). The other added the Green Lobby, activists who replant what players take ([`cf85812`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/cf85812)). A student merged the two into one brief so the agent wouldn't run overlapping prompts ([`b2df341`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/b2df341)). That run built the factory chain, claims, four networks and the lobby ([`accd41a`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/accd41a)). It recorded each call the brief left open in the commit that deleted the prompt ([`2b64272`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/2b64272)).

The final-project pod's prompt is this run's brief. It changes none of the game's rules. It asks for the argument to be legible, for README, `CLAUDE.md` and `spec/` to agree, and for a marker's hour with two browsers to work.

## Corrections went into the harness

Each time the agent got something wrong, the fix landed as a test or a rule, so the same mistake fails a check next time.

- **Pacing.** The first playable Earth emptied in 2.8 minutes for two hand-only bots: too fast to grow attached, and too fast for machines to matter. The agent measured, slowed hand harvesting and deepened the stocks ([`9e1383e`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/9e1383e)); the measured tables now live in `docs/DESIGN.md`. This run adds a bound on the short campaign's length to `spec/sim.test.ts`, so a balance change can't silently break the front page's promise.
- **Loss before attachment.** Bots that drained the pond first browned the whole island before anything was built. The land's health now follows all of a world's stock, not only its water ([`d62a7ee`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/d62a7ee)).
- **Independent reviews.** Twice a subagent audited `server/` and `shared/` against the invariants. The first found a message that crashed the whole process, rooms that filled forever with departed browsers, and receipts for refused commands ([`a07e605`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/a07e605)). The second found a factory refunding the wrong batch's inputs ([`4a9acb8`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/4a9acb8)). The ones a test could reach became named tests: the crashing message is sent by the spec on every run.
- **The log lied once.** A live campaign's log showed a World Engine's name where the player's should be. The fix made the actor always win, and a test now checks every event names who did it ([`a824f5d`](https://github.com/comp4020-agentic-coding-studio/comp4020-riff10-bada-3/commit/a824f5d)).

The breakthrough of this run was treating "the three places agree" as something to test rather than proofread. Before, the README was 1,700 words of player guide with the argument in one late paragraph. `CLAUDE.md`'s rules were sound but traced to nothing. Nobody could check whether a README promise ever reached `spec/`. Now each enforced claim in the README names an exact test. `spec/docs.test.ts` fails if that test doesn't exist in the named file, or if `CLAUDE.md` doesn't name the claim, or if either document leaves its word budget. Checking the README's promises against reality also found real gaps. The race for a world's last unit was only tested inside the simulation, never over sockets. Nothing showed what a stalled client did to the other player. Nothing let a returning browser find its world without the room code. Each gap became a test and, where needed, a feature.

## Why this stack

- **Node with type stripping.** `node server/main.ts` runs the same TypeScript the browser imports from `shared/`, with no build step on the server. The cost is erasable syntax only (no enums), which `CLAUDE.md` states as a rule.
- **`ws`, not a room framework or server-sent events.** Play sends many small intentions a second and receives a delta each tick. Server-sent events would turn every step into a POST. Colyseus would have hidden sequencing, deduplication and resync, which are exactly what the briefs asked to get right. In `server/rooms.ts` they take about 300 lines.
- **Next.js exported static.** The first game brief asked for Next.js. Exporting it to files served by the game process keeps the loop out of Next and fits the course's one machine and one port.
- **Canvas 2D.** It is the one renderer with nothing to install. Every look is a few draw calls in `client/render.ts`, and the densest measured scene drew in about 1.2 ms a frame. PixiJS is the upgrade path if the art outgrows it.
- **SQLite snapshots on the volume.** Each room's state is one JSON row: one upsert per save, with world, sequence and receipts unable to disagree. `node:sqlite` needs no native module. A per-event log would allow replay, but nothing in the argument needs one.
- **One machine.** One process means commands apply one at a time, so "first one wins" holds without locks. The cost is a few seconds' pause for every room on a deploy, which the README says plainly.

## Why this workflow

- **Bots as playtesters.** `scripts/brain.ts` plays the whole chain as rush, green or hand. The spec runs it directly, and `scripts/playbot.ts` runs it over the real protocol. Every pacing number in the docs comes from bots: the short campaign's 10–20 minutes for two from four seeds, the full campaign's 30–75 from one. Bots know the recipes, so human pace is still judged at crits.
- **The spec as the deploy gate.** CI builds the Dockerfile, starts the image and runs `pnpm check` against it, so what passes is what deploys.
- **Logfmt logs.** One line per action, with the actor's id and name, so `flyctl logs` tells the story of a room. Crit 10 relied on reading them.
- **Real browsers.** Two `agent-browser` profiles joined by invite link, a server restarted under both, and a 390 px phone. This run found the phone HUD covering most of the screen and fixed it.
