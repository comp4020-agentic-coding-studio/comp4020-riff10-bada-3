import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The definition of good lives in three places that have to agree: README.md
// (the argument), CLAUDE.md (the rules) and spec/ (the checks). This holds the
// word budgets the brief sets and makes every enforcement the README claims
// point at a test that exists.

/** Prose words: link targets, markup and bare punctuation don't count. */
function words(md: string): number {
  const text = md
    .replace(/^ {0,3}(```|~~~)[\s\S]*?^ {0,3}\1/gm, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\]\([^)]*\)/g, "]");
  return text.match(/\S*[\p{L}\p{N}]\S*/gu)?.length ?? 0;
}

/** Every it("...") title in spec/. */
function testNames(): Map<string, string> {
  const names = new Map<string, string>();
  for (const f of readdirSync("spec").filter((f) => f.endsWith(".test.ts"))) {
    for (const m of readFileSync(`spec/${f}`, "utf8").matchAll(/\bit\(\s*"((?:[^"\\]|\\.)*)"/g)) names.set(m[1], f);
  }
  return names;
}

describe("the three places agree", () => {
  const readme = readFileSync("README.md", "utf8");

  it("the README argues in 400 to 600 words", () => {
    const n = words(readme);
    expect(n).toBeGreaterThanOrEqual(400);
    expect(n).toBeLessThanOrEqual(600);
  });

  it("PROCESS.md tells the story in 900 to 1100 words", () => {
    const n = words(readFileSync("PROCESS.md", "utf8"));
    expect(n).toBeGreaterThanOrEqual(900);
    expect(n).toBeLessThanOrEqual(1100);
  });

  it("every test the README names as enforcement exists, in the file it names", () => {
    const names = testNames();
    const cited = [...readme.matchAll(/(spec\/[\w.-]+\.test\.ts): "([^"]+)"/g)].map((m) => [m[1], m[2]] as const);
    expect(cited.length, "the README cites no tests as enforcement").toBeGreaterThanOrEqual(5);
    for (const [file, name] of cited) expect(names.get(name), `README cites "${name}"`).toBe(file.slice("spec/".length));
  });

  it("CLAUDE.md derives its rules from the README's claims", () => {
    const claude = readFileSync("CLAUDE.md", "utf8");
    const rules = claude.slice(claude.indexOf("\n---\n")).toLowerCase();
    // every claim heading the README enforces is named in the rules
    for (const claim of [...readme.matchAll(/^- ([^:\n]+): spec\//gm)].map((m) => m[1])) expect(rules, `CLAUDE.md never names "${claim}"`).toContain(claim.toLowerCase());
  });
});
