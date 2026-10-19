// The worlds this browser has joined, kept in localStorage beside each room's
// identity token, so the front page can offer them back without accounts or
// anything new on the server. Pure over a Storage-shaped object so the spec can
// run it without a browser.

export interface WorldEntry {
  code: string;
  /** the world they were on last time, e.g. "Mars"; "" if never seen in play */
  world: string;
  /** 1-based stage */
  stage: number;
  /** when this browser last had the world open (ms since epoch); 0 if unknown */
  last: number;
  ended: boolean;
  short: boolean;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "key" | "length">;

const KEY = "plenty:worlds";
const TOKEN = /^plenty:token:([A-Z0-9]{5})$/;

function read(store: StorageLike): Record<string, WorldEntry> {
  try {
    const raw = JSON.parse(store.getItem(KEY) ?? "{}") as unknown;
    return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, WorldEntry>) : {};
  } catch {
    return {};
  }
}

/** Record (or refresh) a world this browser is playing. */
export function rememberWorld(store: StorageLike, e: WorldEntry): void {
  const all = read(store);
  all[e.code] = e;
  try {
    store.setItem(KEY, JSON.stringify(all));
  } catch {
    // storage full or blocked: the world still plays, it just won't be listed
  }
}

/**
 * Every world this browser holds an identity for, most recently played first.
 * A room with a token but no record (joined before the list existed) is
 * still listed, with what little is known.
 */
export function listWorlds(store: StorageLike): WorldEntry[] {
  const all = read(store);
  const out = new Map<string, WorldEntry>();
  for (let i = 0; i < store.length; i++) {
    const m = store.key(i)?.match(TOKEN);
    if (m) out.set(m[1], all[m[1]] ?? { code: m[1], world: "", stage: 0, last: 0, ended: false, short: false });
  }
  return [...out.values()].sort((a, b) => b.last - a.last || a.code.localeCompare(b.code));
}
