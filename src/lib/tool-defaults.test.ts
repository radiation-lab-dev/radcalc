import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Decay from "../components/calc/Decay";
import Mda from "../components/calc/Mda";
import SpecificActivity from "../components/calc/SpecificActivity";
import { decayDefaultResult, mdaDefaultResult, saDefaultResult } from "./tool-defaults";

/* ★ 2026-11-02(작업지시 40-1 PR B ①) — 쪽의 정적 HTML 에 적는 숫자가 **계산기가 처음 그리는 숫자**와 같은지 본다.
   계산기를 서버에서 한 번 그려(주소에 저장본이 없으면 칸은 `tool-defaults.ts` 의 기본값) 그 글자 안에서 찾는다.
   기본값이나 엔진이 바뀌어 둘이 갈라지면 여기서 먼저 깨진다.
   ★ 계산기가 딸고 오는 `site.ts` · `features.ts` · `auth.ts` 는 `import.meta.env?.` 로 읽는다 — Node(tsx)에는
     `import.meta.env` 가 없어 `.` 로 읽으면 불러오는 순간 던진다. Vite 빌드에서는 전과 같은 값으로 바뀐다. */
const html = (c: () => unknown) => renderToStaticMarkup(createElement(c as never));

test("decay 정적 결과 = 계산기 첫 화면", () => {
  const r = decayDefaultResult();
  const h = html(Decay);
  for (const s of [`>${r.remaining}<`, `${r.pct}% of the starting activity`, `${r.halves} half-lives elapsed`,
    `${r.decayed} GBq`, `${r.bq} Bq`, r.halfLife]) assert.ok(h.includes(s), `계산기 화면에 「${s}」가 없다`);
});

test("mda 정적 결과 = 계산기 첫 화면", () => {
  const r = mdaDefaultResult();
  const h = html(Mda);
  for (const s of [`>${r.mda}<`, `>${r.bgCounts}<`, `${r.lc} counts`, `${r.ld} counts`, `${r.mdaFour} Bq`])
    assert.ok(h.includes(s), `계산기 화면에 「${s}」가 없다`);
});

test("specific-activity 정적 결과 = 계산기 첫 화면", () => {
  const r = saDefaultResult();
  const h = html(SpecificActivity);
  for (const s of [`>${r.mass}<`, `>${r.massUnit}<`, `${r.saBqG} Bq/g`, `${r.saCiG} Ci/g`, r.halfLife])
    assert.ok(h.includes(s), `계산기 화면에 「${s}」가 없다`);
});
