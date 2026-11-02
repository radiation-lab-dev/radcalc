/** 계산기 셋(decay · mda · specific-activity)이 처음 열릴 때 칸에 든 값과, 그 값으로 나오는 결과.
 *
 *  ★ 2026-11-02(작업지시 40-1 PR B ①) — 세 계산기는 `client:only` 라 결과가 JS 로만 그려진다. 검색 엔진과
 *    JS 를 끈 독자가 받는 HTML 에는 숫자가 하나도 없었다. 처음 화면에 서는 결과를 빌드 때 **같은 엔진 함수와
 *    같은 `fmt`** 로 구해 정적 HTML 에 적는다.
 *  ★★ 칸의 처음 값은 **여기 한 곳**에만 있다 — 계산기(`components/calc/*.tsx`)가 이 객체를 기본값으로 쓴다.
 *    쪽에 적는 숫자와 화면이 처음 내는 숫자가 갈라지지 않게 하려는 것이다. `tool-defaults.test.ts` 가
 *    계산기를 서버에서 그려 이 글자들이 그대로 나오는지 단정한다.
 *  ★ 엔진의 수치 · 식은 건드리지 않는다 — 여기서는 부르기만 한다. */
import nuclides from "../data/nuclides.json";
import type { NuclideMap } from "../engine/types";
import { decayActivity, massFromActivity } from "../engine/decay";
import { minimumDetectableActivity } from "../engine/mda";
import { TIME_S } from "../engine/constants";
import { convert } from "../engine/units";
import { fmt } from "../components/ui/Result";

const N = nuclides as unknown as NuclideMap;

type TimeUnit = keyof typeof TIME_S;

export const DECAY_DEFAULT: {
  mode: "remaining"; nuclide: string; a0: number; unit: string; t: number; tu: TimeUnit; target: number; a1: number;
} = { mode: "remaining", nuclide: "Co-60", a0: 37, unit: "GBq", t: 5, tu: "y", target: 1, a1: 18.5 };

export const MDA_DEFAULT: {
  mode: "scaler"; k: string; bgCpm: number; timeS: number; eff: number; useSurface: boolean; surfEff: number;
  areaCm2: number; unit: "Bq"; speed: number; width: number; obsEff: number; dPrime: number;
} = { mode: "scaler", k: "1.645", bgCpm: 300, timeS: 600, eff: 25, useSurface: false, surfEff: 50,
      areaCm2: 100, unit: "Bq", speed: 5, width: 10, obsEff: 50, dPrime: 1.38 };

export const SA_DEFAULT: {
  dir: "toMass"; nuclide: string; act: number; actU: string; mass: number; massU: "g";
} = { dir: "toMass", nuclide: "Pu-239", act: 1, actU: "GBq", mass: 1, massU: "g" };

/** 「How much is left」 — 계산기 `Decay.tsx` 의 첫 결과와 같은 식 · 같은 자릿수. */
export function decayDefaultResult() {
  const d = DECAY_DEFAULT;
  const n = N[d.nuclide];
  const seconds = d.t * TIME_S[d.tu];
  const a = decayActivity(d.a0, n.t_half_s, seconds);
  return {
    remaining: fmt(a),
    pct: fmt((a / d.a0) * 100, 3),
    halves: fmt(seconds / n.t_half_s, 3),
    decayed: fmt(d.a0 - a, 4),
    bq: fmt(convert(a, d.unit, "Bq", "activity"), 4),
    halfLife: `${n.hl} ${n.hl_unit}`,
  };
}

/** 「Fixed count」 — 계산기 `Mda.tsx` 의 첫 결과(면 보고 끔, Bq). */
export function mdaDefaultResult() {
  const d = MDA_DEFAULT;
  const k = Number(d.k);
  const eff = d.eff / 100;
  const r = minimumDetectableActivity({ bgCps: d.bgCpm / 60, countTimeS: d.timeS, efficiency: eff, sampleQty: 1, k });
  const four = minimumDetectableActivity({ bgCps: d.bgCpm / 60, countTimeS: d.timeS * 4, efficiency: eff, sampleQty: 1, k });
  return {
    mda: fmt(r.mda),
    bgCounts: fmt(r.bgCounts, 5),
    lc: fmt(r.lc, 4),
    ld: fmt(r.ld, 4),
    mdaFour: fmt(four.mda, 4),
  };
}

/** 「Activity → mass」 — 계산기 `SpecificActivity.tsx` 의 첫 결과. 질량 단위는 계산기와 같은 규칙으로 고른다. */
export function saDefaultResult() {
  const d = SA_DEFAULT;
  const n = N[d.nuclide];
  const g = massFromActivity(convert(d.act, d.actU, "Bq", "activity"), n.sa_bq_g);
  const a = Math.abs(g);
  const m = a >= 1e3 ? { v: g / 1e3, u: "kg" } : a >= 1 ? { v: g, u: "g" } : a >= 1e-3 ? { v: g * 1e3, u: "mg" }
    : a >= 1e-6 ? { v: g * 1e6, u: "µg" } : { v: g * 1e9, u: "ng" };
  return {
    mass: fmt(m.v),
    massUnit: m.u,
    saBqG: fmt(n.sa_bq_g, 5),
    saCiG: fmt(n.sa_bq_g / 3.7e10, 5),
    halfLife: `${n.hl} ${n.hl_unit}`,
  };
}
