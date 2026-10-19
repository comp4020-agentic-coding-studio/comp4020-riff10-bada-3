import { JSDOM } from "jsdom";
import { describe, expect, inject, it } from "vitest";
import { listWorlds, rememberWorld } from "../client/worlds.ts";

// The marker's visit: arriving from /readme/, choosing a campaign that fits,
// and coming back the next day to the same world.
const baseUrl = inject("baseUrl");

/** localStorage, as far as the front page uses it. */
function storage(seed: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(seed));
  return {
    get length() {
      return m.size;
    },
    key: (i: number) => [...m.keys()][i] ?? null,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
  };
}

describe("the marker's visit", () => {
  it("the front page links to the argument and says how long each campaign takes", async () => {
    const doc = new JSDOM(await (await fetch(new URL("/", baseUrl))).text()).window.document;
    expect([...doc.querySelectorAll("a")].some((a) => a.getAttribute("href") === "/readme/")).toBe(true);
    const text = doc.body.textContent ?? "";
    expect(text).toMatch(/Short campaign\s*about 10–20 minutes for two/);
    expect(text).toMatch(/Full campaign\s*about 30–75 minutes for two/);
  });

  it("the argument at /readme/ links straight to the game", async () => {
    const doc = new JSDOM(await (await fetch(new URL("/readme/", baseUrl))).text()).window.document;
    expect([...doc.querySelectorAll("a")].some((a) => a.getAttribute("href") === "/")).toBe(true);
  });

  it("a returning browser finds every world it joined, newest first, finished ones included", () => {
    // a browser that joined QQQQQ before the list existed has only its token
    const store = storage({ "plenty:token:QQQQQ": "t0", "plenty:name": "Ada" });
    store.setItem("plenty:token:AAAAA", "t1");
    rememberWorld(store, { code: "AAAAA", world: "Mars", stage: 2, last: 1_000, ended: false, short: true });
    store.setItem("plenty:token:BBBBB", "t2");
    rememberWorld(store, { code: "BBBBB", world: "The Universe", stage: 5, last: 2_000, ended: true, short: false });
    const worlds = listWorlds(store);
    expect(worlds.map((w) => w.code)).toEqual(["BBBBB", "AAAAA", "QQQQQ"]);
    expect(worlds[0]).toMatchObject({ world: "The Universe", ended: true });
    expect(worlds[2]).toMatchObject({ world: "", stage: 0 });
    // a corrupted list never hides the worlds the tokens still prove
    store.setItem("plenty:worlds", "{not json");
    expect(listWorlds(store).map((w) => w.code).sort()).toEqual(["AAAAA", "BBBBB", "QQQQQ"]);
  });
});
