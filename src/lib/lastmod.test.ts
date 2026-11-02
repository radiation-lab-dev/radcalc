import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { lastmodFor } from "./lastmod.mjs";

const git = (...a: string[]) => execFileSync("git", a, { encoding: "utf8" }).trim();
const deep = (() => { try { return git("rev-parse", "--is-shallow-repository") === "false"; } catch { return false; } })();

/* ★ 2026-11-02(작업지시 40-1 ②) — 도구 쪽의 제목 · 설명은 `tools.ts` 에서 온다. #99(0a0d46c, 10-31)가 beta · specific-activity 의
   제목을 바꾸었는데 `.astro` 만 세던 동안 두 쪽의 lastmod 가 10-25 에 머물렀다. 얕은 클론에서는 일부러 비우므로 깊을 때만 잰다. */
test("도구 쪽 lastmod 가 등록부에서 그 도구 항목이 바뀐 날을 따른다", { skip: !deep }, () => {
  const changed = git("log", "-1", "--format=%cI", "0a0d46c");
  for (const p of ["/beta/", "/specific-activity/"]) {
    const d = lastmodFor(p);
    assert.ok(d && Date.parse(d) >= Date.parse(changed), `${p} lastmod ${d} 가 제목을 바꾼 ${changed} 보다 이르다`);
  }
});

test("도구 쪽 lastmod 는 등록부 파일 통째의 날짜가 아니다 — 한 도구를 고친 날 열 쪽이 함께 바뀌지 않는다", { skip: !deep }, () => {
  /* 등록부 파일의 마지막 커밋보다 이른 도구가 하나는 있어야 한다(전부 같으면 파일 통째로 센 것이다). */
  const whole = git("log", "-1", "--format=%cI", "--", "src/lib/tools.ts", "src/data/tool-faq.ts");
  const dates = ["/gamma-shielding/", "/beta/", "/alara/", "/units/", "/decay/", "/specific-activity/", "/mda/", "/xray-spectrum/"]
    .map((p) => lastmodFor(p));
  assert.ok(dates.every(Boolean), `날짜가 빈 도구 쪽: ${dates}`);
  assert.ok(dates.some((d) => Date.parse(d!) < Date.parse(whole)), `모든 도구 쪽이 등록부 파일 날짜(${whole})를 받았다`);
});
