import type { NuclidePage } from "./nuclides";
import { halfLifeForSearch, sciText, betaEndpointBranch, gammaVs } from "./nuclides";

/** 낱장 147장의 **검색 제목·설명**을 데이터에서 만든다 — 쪽마다 손으로 적지 않는다.
 *
 *  ★★ **비어 있는 질의를 겨냥한다**(2026-09-17, 실측으로 골랐다). 도구 7쪽의 제목은
 *    「gamma dose rate calculator」처럼 **레드오션**을 정면으로 친다 — 그 1페이지는
 *    Rad Pro Calculator 가 **두 자리씩** 차지하고 있고 Ionactive·WISE·Dosismart 가 나머지다.
 *    반면 핵종 단위로 물으면 답하는 **도구 페이지가 없다** —
 *    · `Cs-137 half value layer lead` → PhysicsForums · brainly(숙제 사이트) · ResearchGate 그림.
 *      게다가 답이 **6.6 mm 와 8 mm 로 갈린다**(둘 다 축적 포함 값이다).
 *    · `Sr-90 beta range / bremsstrahlung` → 전부 논문(PubMed·ScienceDirect). 도구 0개.
 *    우리는 그 답을 147장에 **이미 들고 있었고 제목이 그것을 말하지 않고 있었다.**
 *
 *  ★★ **숫자를 제목에 넣지 않는다.** 「Cs-137 — 납 반가층 5.3 mm」는 눈에 띄지만,
 *    핸드북의 6.6~8 mm 와 비교한 사람이 **우리가 틀렸다고 읽는다.** 다른 것은 정의다 —
 *    우리 값은 **좁은 빔(축적 없음)** 이고 본문이 그렇게 적는다. 그러나 제목과 **구워 둔 OG**
 *    는 그 설명을 들고 다니지 못한다. 그래서 제목은 **무엇을 답하는 쪽인가**만 말한다.
 *    (덤으로, 값이 바뀌어도 OG 33장 + 147장이 낡지 않는다.)
 *
 *  ★★ **앞머리는 반감기다**(2026-10-31, Search Console 9/9~10/30 실측). 위 판단은 「비어 있는 질의」를
 *    짐작으로 골랐고, 실제 노출은 **반감기 질의**에서 왔다 — U-236 「half life of u236」 외 변형 7개 ·
 *    Co-60 「cobalt 60 half life」 · 「ra-224 half life」 · 「ba-133 half life」, 순위 5~10 에 클릭 0.
 *    차폐 질의는 거의 없었다. 그래서 각은 그대로 두고 **`<핵종> half-life,` 를 맨 앞에** 둔다.
 *    값은 여전히 넣지 않는다 — 설명 첫머리가 반감기 값을 든다.
 *  ★ **새 주장을 만들지 않는다** — 제목이 말하는 것은 전부 그 쪽이 이미 그리는 것이다.
 *    감마가 없는 핵종에 「half-value layer」를 달면 찾아온 사람이 없는 것을 찾게 된다.
 *  ★ **없는 것을 「없다」고 쓰지 않는다**(`nuclide-prose.ts` 와 같은 규칙) — 임계 아래
 *    방출이 실제로 있을 수 있다. 「이 자료에 기록이 없다」까지만 쓴다.
 */
export type SeoAngle = "gamma" | "beta" | "alpha" | "plain";

export interface NuclideSeo {
  /** `<title>` 에 들어가는 몫. 뒤에 ` · Radiation Lab` 이 붙는다(`Base.astro` 의 `SITE_NAME`). */
  title: string;
  /** `<meta name="description">`. */
  description: string;
  /** 어느 자리를 겨냥했는가 — 게이트가 이것으로 갈라 잰다. */
  angle: SeoAngle;
}

/** 제목 길이 예산 — **꼬리를 뺀 몫**이다. 구글이 대략 60자를 보이고 꼬리 ` · Radiation Lab` 이 16자를 먹는다.
 *  ★ 2026-11-02(작업지시 40-1 ⑥) — 전에는 58 이 이 몫에만 걸려 실제 `<title>` 은 68~70자였다(Co-60 68 · Lu-177 69 · Pu-239 70).
 *    꼬리가 바뀌면 `nuclide-seo.test.ts` 가 전체 길이로 다시 잰다. */
export const TITLE_MAX = 60 - " · Radiation Lab".length;
/** 설명 길이 예산. 155자를 넘으면 뒤가 잘린다. */
export const DESC_MAX = 165;
export const DESC_MIN = 90;
/** 쪽이 실제로 있는 핵종(`PAGE_KEYS`)의 설명 예산 — 검색 결과에 나가는 것은 이쪽이다.
 *  `DESC_MAX` 는 쪽이 없는 나머지까지 포함해 자료 전체에 거는 상한이다. */
export const DESC_PAGE_MAX = 155;

/** ★★ **`Γ > 0` 은 제목을 고르는 자로 쓸 수 없다**(2026-09-17, Pu-239 가 드러냈다).
 *  Pu-239 의 Γ 는 8.23e-6 로 기술적으로 0 보다 크지만 **아무도 Pu-239 를 감마로 막지 않는다** —
 *  거기에 「lead half-value layer」를 달면 찾아온 사람이 쓸모없는 답을 받는다. 이 lab 이
 *  `Saved` 와 프리필에서 이미 밟은 **「없는 기능을 광고하지 않는다」** 와 같은 자리다.
 *  ★ 임계를 지어내지 않았다 — Γ 분포를 재니 **Cs-137 의 1/1000 에서 갈렸다**:
 *    위에는 Am-241(1/21)·U-235(1/4.0)·Ra-223(1/4.5)·Ra-226(1/88)·Th-228(1/340) 처럼
 *    **실제로 감마로 재고 감마로 막는 것**들이 있고, 아래에는 Pu-239·Pu-238·Pu-240·U-238·
 *    U-234·Cm-244·Th-232·Pm-147·Sr-89·Cl-36 처럼 **아무도 감마로 안 막는 것**들만 있다.
 *  ★ 판단이 섞인 선이므로 **사람이 검증할 수 있는 문장**으로 둔다 —
 *    「가장 흔한 감마 선원의 1/1000」. 숫자가 아니라 비(比)라서 자료가 갱신돼도 뜻이 안 변한다.
 *  ★ **쪽의 내용은 바뀌지 않는다** — 이들도 감마 구획과 반가층 표를 그대로 든다.
 *    바뀌는 것은 **제목이 무엇을 앞세우는가**뿐이다. */
export const GAMMA_LEAD_RATIO = 1 / 1000;
export const gammaLeadsFor = (key: string) =>
  key === "Cs-137" || gammaVs(key, "Cs-137") >= GAMMA_LEAD_RATIO;

/** ★ 2026-11-02(작업지시 40-1 ①) — 낱장 제목이 「decay」를 드는 핵종. 근거는 질의다: 「lu 177 decay calculator」(Search Console
 *  9/9~10/30, 순위 60). 짐작으로 늘리지 않는다 — 질의가 확인된 핵종만 넣는다. 이 낱장은 붕괴 보정 표와 계산기 프리셋으로 링크한다. */
export const DECAY_ASKED = new Set(["Lu-177"]);

const sig = (x: number, d = 3) => (Number.isFinite(x) ? x.toPrecision(d) : "—");

export function nuclideSeo(p: NuclidePage): NuclideSeo {
  const { n, key, name } = p;
  /* ★ 설명 첫머리가 **사람이 찾는 값 둘**을 든다(2026-10-31) — 반감기는 아는 단위로, 비방사능은 지수 표기 없이.
     「specific activity of pu-239」(순위 8.7, 클릭 0)가 알파 쪽만의 질의가 아니라서 네 각 모두에 넣는다.
     ★ 메타 설명만 바꾼다 — 본문에 틀 문장을 더하지 않는다(애드센스 T10-2). */
  const hl = halfLifeForSearch(n);
  const sa = `specific activity ${sciText(n.sa_bq_g)} Bq/g`;

  /* 감마가 **앞설 만한** 것 — **핵종별 차폐 두께**가 비어 있는 자리에서 답하는 것이다.
     ★ 2026-11-02 — 60자 안에 들이려고 「and dose rate」를 뺐다. 비어 있는 질의는 「<핵종> half value layer lead」 쪽이고,
       선량률은 설명의 Γ 가 든다. 「붕괴」를 묻는 핵종은 `DECAY_ASKED` 가 반가층 앞에 둔다. */
  if (p.gamma > 0 && gammaLeadsFor(key)) {
    return {
      angle: "gamma",
      title: DECAY_ASKED.has(key)
        ? `${key} half-life, decay correction, lead HVL`
        : `${key} half-life, lead half-value layer`,
      description:
        `${name} (${key}): half-life ${hl}, ${sa}, Γ = ${sig(p.gamma)} mGy·m²/(GBq·h). ` +
        `Lead and concrete half-value layers.`,
    };
  }

  /* 순수 베타 25종 — 논문만 있고 도구가 없는 자리. 비정과 제동복사가 실무의 질문이다. */
  if (n.beta?.length) {
    const end = betaEndpointBranch(key);
    return {
      angle: "beta",
      title: `${key} half-life, beta range, bremsstrahlung`,
      description:
        `${name} (${key}): half-life ${hl}, ${sa}` +
        (end ? `, beta endpoint ${sig(end.maxKeV, 4)} keV` : "") +
        `. Range in acrylic; lead adds bremsstrahlung.`,
    };
  }

  /* 알파 20종 — Γ 상수 하나로 도는 도구는 이들을 아예 목록에 넣지 않는다.
     ★ 2026-11-02 — 60자 안에 들이려고 「alpha energies」를 설명으로 넘겼다. 남긴 쪽은 실제 질의다(「specific activity of pu-239」, 순위 8.7). */
  if (n.alpha?.length) {
    return {
      angle: "alpha",
      title: `${key} half-life and specific activity`,
      description:
        `${name} (${key}): half-life ${hl}, ${sa}. ` +
        `Alpha line energies and emission probabilities from IAEA data.`,
    };
  }

  /* 나머지 6종 — 주장할 방출이 없다. 확실한 것만 든다. */
  return {
    angle: "plain",
    /* ★ 이 각은 처음부터 반감기가 앞이었다. 2026-11-02 — 60자 안에 들이려고 비방사능은 설명 첫머리에 맡겼다(Ir-192m2 처럼 기호가 8자다). */
    title: `${key} half-life and decay mode`,
    description:
      /* ★ 붕괴형식을 설명에서 뺐다 — 제목이 이미 들고, 문구가 길다(「electron capture with
         beta-plus」가 30자다). Ni-59·Ta-182m1 이 175·173자로 예산을 넘겼고 테스트가 잡았다. */
      `${name} (${key}): half-life ${hl}, ${sa}. ` +
      `Decay mode, mass-to-activity conversion and decay curve, from IAEA data.`,
  };
}
