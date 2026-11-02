import { test } from "node:test";
import assert from "node:assert/strict";
import { decayDefaultResult, mdaDefaultResult, saDefaultResult, DECAY_DEFAULT, MDA_DEFAULT, SA_DEFAULT } from "./tool-defaults";

/* ★ 2026-11-02(작업지시 40-1 PR B ①) — 쪽의 정적 HTML 에 적는 숫자가 엔진 값에서 나오는지 본다.
   ★ 계산기 컴포넌트를 여기서 그리지 않는다 — 계산기가 딸고 오는 `site.ts` · `features.ts` · `auth.ts` 는
     `import.meta.env.VITE_*` 를 읽는데 Node(tsx)에는 `import.meta.env` 가 없다. 그 셋을 `?.` 로 바꾸면 Vite 가
     그 값을 정적으로 바꿔 넣지 못해 운영 빌드에서 저장 · 로그인이 꺼진다(감독 검토 2026-11-02). 그래서
     **정적 문장 = 계산기 첫 화면** 대조는 실제 브라우저로 `gate/check-render.mjs`(「정적 결과 = 첫 화면」 절)가 한다. */

test("decay 기본 예시 — Co-60 37 GBq 5 년", () => {
  assert.equal(DECAY_DEFAULT.nuclide, "Co-60");
  const r = decayDefaultResult();
  assert.equal(r.remaining, "19.17");
  assert.equal(r.pct, "51.8");
  assert.equal(r.halves, "0.949");
  assert.equal(r.decayed, "17.83");
});

test("mda 기본 예시 — 300 cpm · 600 s · 25%", () => {
  assert.equal(MDA_DEFAULT.bgCpm, 300);
  const r = mdaDefaultResult();
  assert.equal(r.mda, "1.717");
  assert.equal(r.lc, "127.4");
  assert.equal(r.ld, "257.5");
  assert.equal(r.mdaFour, "0.854");
});

test("specific-activity 기본 예시 — Pu-239 1 GBq", () => {
  assert.equal(SA_DEFAULT.nuclide, "Pu-239");
  const r = saDefaultResult();
  assert.equal(`${r.mass} ${r.massUnit}`, "435.7 mg");
});
