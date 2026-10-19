# Plenty

Friends share one finite world and play it down to nothing, or choose to stop. [Play it](https://comp4020-riff10-bada-3.fly.dev/).

## What good means here

Plenty is good if friends playing one afternoon together end up feeling what their convenience cost. Every convenience has a dependency. A datacentre needs parts, parts need ore, and its harvesters empty the land faster. Being careful gets more out of the same world. It doesn't make a new one.

Co-presence is the point. More hands consume faster. The stockpile is shared: one player's rush spends everyone's island. The ending where you leave the rest alone needs everyone present to agree. The cost shows in the land (grass browns, groves become stumps, the pond shrinks), never in a lecture.

## What we read

Robin Sloan's family messaging app: "It is ruthlessly simple; we love it; no one else will ever use it" ([2020](https://www.robinsloan.com/notes/home-cooked-app/)). Clay Shirky calls this situated software, "designed for use by a specific social group, rather than for a generic set of 'users'" ([2004](https://gwern.net/doc/technology/2004-03-30-shirky-situatedsoftware.html)). Plenty is for one table of friends.

It answers factory games. Factorio is "a game in which you build and maintain factories" ([factorio.com](https://www.factorio.com/)); Satisfactory promises "Nature is yours to harvest!" ([satisfactorygame.com](https://www.satisfactorygame.com/)). Frank Lantz's *Universal Paperclips* "gives you direct, first-hand experience of what it means to pursue an arbitrary goal with dogged determination" ([2017](https://www.pcgamesinsider.biz/interviews-and-opinion/66271/interview-paperclips-developer-frank-lantz/)). Plenty keeps that pleasure and puts your friends beside you.

## What we left out

No accounts: the browser keeps a token per world. No text chat, so nothing to moderate; emotes carry talk. No public room list: invites only. No leaderboards or combat: the island is shared, not contested. No offline progress: empty worlds pause ([ADR 0001](docs/adr/0001-empty-rooms-pause.md)).

## Enforced and judged

Enforced by `spec/`:

- the world is finite: spec/sim.test.ts: "keeps initial = remaining + extracted + destroyed through a whole campaign, and reaches the ending"
- care pays, but only within the same world: spec/sim.test.ts: "the rush reaches compute sooner and wastes more; the sustainable route gets more useful work from the same world"
- the restraint ending needs everyone present: spec/sim.test.ts: "ends the campaign with stock left only when everyone here agrees, and keeps the books"
- the server decides contention: spec/server.test.ts: "two clients racing for the same deposit at the same instant: each unit goes to exactly one of them"
- you see each other act: spec/server.test.ts: "one player's harvest reaches another open session within a second, without a reload"
- it survives a restart: spec/server.test.ts: "recovers a campaign after a graceful restart, under a new incarnation"
- you can come back tomorrow: spec/visit.test.ts: "a returning browser finds every world it joined, newest first, finished ones included"
- it fits an afternoon: spec/sim.test.ts: "the short campaign takes two players between 8 and 22 minutes, rushed or careful"

Rules in [`CLAUDE.md`](CLAUDE.md): browsers never decide outcomes, user text stays text, every action is logged with who did it.

Judged by people: whether the land's decline registers without words, and whether the ending lands. Bots and two-browser sessions checked the mechanics ([`docs/TESTING.md`](docs/TESTING.md)), not the feeling.

## How it's built

WebSockets, because traffic runs both ways many times a second: held-down walking up, each tick's changes down. Server-sent events would make every step a POST. One Node process on one machine owns every room, so commands apply one at a time and "first one wins" holds. The cost: deploys pause everyone briefly.

## How to play

Start a short campaign, send a friend the invite link. Walk with WASD or tap, harvest with `E`, build with `1`--`9`, load machines with `F`. The full guide is [`docs/PLAYING.md`](docs/PLAYING.md); `H` opens help in the game.
