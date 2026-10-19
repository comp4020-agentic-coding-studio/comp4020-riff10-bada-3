# Plenty, finished: make the argument legible, and make the marker's hour land

## Where this is

Plenty works. It's live at <https://comp4020-riff10-bada-3.fly.dev>, the factory
chain, claims, networks and the Green Lobby all ship, and the spec is green. Read
the [final project brief](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/assessments/final-project/)
before you start, because this run is about **answering that brief**, not the
crit 10 one. The game keeps its rules. What changes is how the repo makes its case
and how the app behaves during a marker's visit.

The brief, in short: a multi-user, real-time, persistent site that's *good*. Its
definition of good has to appear in three places that agree: `README.md` (the
argument, 400–600 words, served at `/readme/`), `CLAUDE.md` (rules derived from
it) and `spec/` (tests for the parts of it that can be tested). Process is half
the mark, so `PROCESS.md` (900–1100 words) has to show how the work got here and
argue for the stack and the workflow. Markers start at `/readme/`. They play with
two Chrome profiles side by side, come back the next day after a restart, and
reward an app that holds up under simultaneous actions and slow connections.
They take marks off for features with no reason to exist, and for README
promises that never reach a rule or a check.

Right now the repo fails that reading in ways that have nothing to do with the
game:

- `README.md` is ~1,700 words of player guide. The argument (*every convenience
  has a dependency; being careful gets more out of the same world; it doesn't
  make a new one*) is one section near the bottom.
- `PROCESS.md` is about a different app ("Long Scroll", from crit 8). None of it
  describes Plenty.
- `CLAUDE.md` below the riff block lists good engineering rules, but nothing ties
  them to a claim in the README.
- At normal pace two players take ~14 minutes on Earth alone, so a marker who
  plays for 15 minutes never sees Mars, the World Engines or the ending, which
  is where the argument pays off. The faster preset exists, but it's labelled
  "testing".
- A browser coming back the next day only gets its world back if it kept the
  room code.

## What to do, in priority order

Work top to bottom. Commit at each checkpoint, only with `pnpm check` and
`pnpm check:evidence` green against a running server (`pnpm build && pnpm start`).
If you run short of time, everything you've finished should already be
committed and coherent.

### 1. The marker's visit works end to end

Act out the marker's path yourself, with two separate browser profiles or a
browser plus `scripts/playbot.ts`, at desktop size and at a phone width of about
390 px. Fix whatever gets in the way:

- **`/readme/` → playing together within a minute.** `/readme/` links to the
  game. Starting a world gives you an invite link you can copy in one click
  (not just a five-letter code to retype). When the second profile opens that
  link, it's in the same world, both players see each other within about a
  second, and the HUD shows who's present by name.
- **Coming back.** The front page lists the worlds this browser has joined
  (from what's already in `localStorage`: room code, world name or stage, when
  you last played) so a marker who returns tomorrow is one click from their
  world, with their own identity. Finished campaigns still open and show their
  ending. Nothing new on the server is needed for this, and no accounts.
- **A session that fits an afternoon.** Promote the rapid preset to an honest
  first-class choice ("Short campaign: about N minutes for two"), with N
  measured using two bots, not guessed. Keep normal pace. Say on the front page
  how long each takes. Don't add timers or fake progress. If the short preset
  reaches the ending too fast for the argument to land, tune it in
  `shared/content.ts`, re-measure, and update the `docs/DESIGN.md` tables.
- **Unexpected use.** Check, and fix if they're broken: two players taking the
  last unit of a deposit at the same instant; two people claiming overlapping
  ground; one player's connection throttled (Chrome's "Slow 4G", or a delayed
  socket in a test) while the other plays; a tab closed mid-build; the server
  restarted under both of them. Wherever behaviour is a decision (who gets the
  last unit, what a slow client sees), it should appear in the docs as one.
- **Phone width.** The front page, `/readme/` and the play screen have no
  horizontal overflow at 390 px, the HUD doesn't cover the player, and the
  core loop (walk, harvest, build, load) works by touch. Line laying can stay
  "fiddly" if it's honestly documented as a limit.

### 2. README.md becomes the argument (400–600 words)

Rewrite it as a case, not a manual. It should cover:

- **What good means for this app**, in this repo's own terms: a small group
  co-operating on one finite world, where co-presence is the point (more hands
  consume faster; the stockpile is shared; the ending needs everyone to agree)
  and the cost shows up in the land, not in a lecture.
- **Sources.** Cite real small-web and small-scale writing, plus the
  games this one answers. Robin Sloan's "An app can be a home-cooked meal", Clay
  Shirky's "Situated Software", Frank Lantz's *Universal Paperclips* and the
  Factorio and Satisfactory references in `docs/DECISIONS.md` are candidates.
  Fetch each one and quote it only if you've read what it says. No invented
  citations.
- **What we left out, and why**: accounts, text chat, a public room list,
  leaderboards, combat, and anything else you choose not to build.
- **Enforced and judged.** List each claim and say how it's held: *enforced by*
  a named test in `spec/`, *a rule in* `CLAUDE.md`, or *judged by* a person
  (playtest, crit). Be honest about which claims are judged.
- **Why WebSockets** (the brief requires the real-time choice to be justified)
  and why one process on one machine, in a sentence or two each.
- A short "how to play" (a few lines) and links to the details.

Move the full player guide, the chain and the five-worlds table into
`docs/PLAYING.md` and link it. In-game help (`H`) stays. Keep `/readme/`
rendering the README in full; `spec/invariants.test.ts` checks its headings.

### 3. CLAUDE.md and spec/ agree with the README

- **CLAUDE.md**: leave the riff block above the `---` exactly as it is. Below
  it, rewrite the rules so each traces to a README claim (link or name the
  claim). Keep every existing invariant: the ledger, authority, origin checks,
  one owner per room, saved-before-announced, version bumps, logging, React
  never rendering per-entity updates, `.ts` imports. Drop anything that's only
  about the crit 8–10 marking.
- **spec/**: every claim the README marks as enforced has a test, and the
  test's name says the claim in plain words. Add the ones that are missing:
  at least a returning-browser-gets-its-worlds check, a two-clients-race-for-the-last-unit
  check and the short preset's pacing bound. Add `spec/docs.test.ts`, which
  checks that the README is 400–600 words, that `PROCESS.md` is 900–1100, and
  that every test name the README cites as enforcement exists in `spec/`. That
  makes "the three places agree" something a test enforces. Keep
  `spec/invariants.test.ts` untouched and green, and keep `server.test.ts` and
  `sim.test.ts` green (you may extend them).

### 4. PROCESS.md rewritten (900–1100 words)

Replace the Long Scroll text completely. Tell how Plenty got here from the git
history and the riff tags (`prompt-crit8`, `prompt-crit9`, the crit 10 merge
of two pod prompts in `b2df341`, this run): what each brief asked for, what
the agent built, what went wrong and how a correction ended up in `CLAUDE.md`
or `spec/` rather than as a retry. Argue for the stack (Node with type
stripping, `ws`, statically exported Next.js, Canvas 2D, SQLite snapshots on
the volume, one machine) against the alternatives you actually considered, and
for the workflow (bots as playtesters, spec as the deploy gate, logfmt logs).
Cite commits as markdown links whose text is the short SHA, since
`pnpm check:evidence` verifies every one exists. Say plainly that the work was
done by an agent running pod-written prompts, because that's the truth of this
repo.

### 5. Prune and polish, only if time remains

Audit features against the argument. Anything that serves no claim in the
README is a candidate to cut or fold in. Don't remove the economy, the
networks, the Green Lobby, the worlds or the ending. Then, the next items from
`docs/TESTING.md`'s list that make the marker's two-profile hour better.

## How to write

Write the docs in a plain, specific voice: numbers, file names and commit
links, not adjectives. Keep "not X, but Y" constructions and em-dash chains to
a minimum. Short sentences. `README.md` is for a stranger arriving from the
marker's link. `PROCESS.md` is for someone checking whether the process can be
followed.

## Leave alone

- The riff block at the top of `CLAUDE.md`, `spec/invariants.test.ts`,
  `fly.toml`, `Dockerfile`'s single-machine shape, `.github/workflows/`,
  `reflections/` and `docs/adr/0001`.
- Saved rooms on the live volume. If a stored shape changes, bump
  `SCHEMA_VERSION` and add a migration in `server/migrate.ts`. If the wire
  changes, bump `PROTOCOL_VERSION`. A marker's world from yesterday must still
  open.
- The rules in "What the game must never do". This brief changes none of them.

## Done looks like

- A stranger goes from `/readme/` to playing with a second profile in under a
  minute, finishes a short campaign in an afternoon sitting, and gets back to
  the same world the next day from the front page.
- The README is 400–600 words of argument with sources, omissions, and every
  claim marked enforced (and by which test) or judged. `CLAUDE.md` and `spec/`
  agree with it, and `spec/docs.test.ts` proves they do.
- `PROCESS.md` is 900–1100 words about this project, with verified commit links.
- `pnpm check` and `pnpm check:evidence` are green, `main` deploys, and the
  last commit deletes this `prompt.md`.
