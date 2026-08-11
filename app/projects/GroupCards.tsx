"use client";

import { useRef, useState } from "react";
import Image from "next/image";

/** 프로젝트(그룹) 카드 한 장에 필요한 정보. 목록 API가 내려주는 모양 그대로. */
export type GroupSummary = {
  id: number;
  name: string;
  summary: string | null;
  period: string | null;
  thumbnailUrl: string | null;
  published: boolean;
};

/**
 * 프로젝트를 한 장씩 크게 보여주는 캐러셀.
 * 카드 폭을 컨테이너보다 좁게(86%) 잡아서 다음 장이 오른쪽에 살짝 걸쳐 보이고,
 * 마지막 장에서는 더 갈 데가 없으니 이전 장이 왼쪽에 걸쳐 보인다.
 * 넘기기는 아래 인디케이터(막대)와 좌우 버튼으로 한다.
 */
export default function GroupCards({
  groups,
  onSelect,
}: {
  groups: GroupSummary[];
  onSelect: (id: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0); // 지금 주로 보이는 카드

  // index번째 카드로 부드럽게 이동 (마지막 장은 브라우저가 알아서 끝까지만 민다)
  function scrollToCard(index: number) {
    const scroller = scrollerRef.current;
    const card = scroller?.children[index] as HTMLElement | undefined;
    if (!scroller || !card) return;
    scroller.scrollTo({
      left: card.offsetLeft - scroller.offsetLeft,
      behavior: "smooth",
    });
  }

  // 화면 한가운데에 가장 가까운 카드를 "주로 보이는 카드"로 본다.
  // (왼쪽 끝 기준으로 재면 마지막 장이 끝에 밀려 있어서 어긋난다)
  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = Array.from(scroller.children) as HTMLElement[];
    const viewCenter = scroller.scrollLeft + scroller.clientWidth / 2;

    let nearest = 0;
    let shortest = Infinity;
    cards.forEach((card, index) => {
      const cardCenter =
        card.offsetLeft - scroller.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - viewCenter);
      if (distance < shortest) {
        shortest = distance;
        nearest = index;
      }
    });
    setActive(nearest);
  }

  if (groups.length === 0) {
    return <p className="text-slate-500">아직 등록된 프로젝트가 없어요.</p>;
  }

  const current = Math.min(active, groups.length - 1);

  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        // overscroll-x-none: 캐러셀 끝에서 더 밀어도 스크롤이 브라우저로 넘어가지 않게 한다
        // (트랙패드 가로 스와이프가 뒤로가기/앞으로가기로 먹히는 걸 막음)
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-none pb-2"
      >
        {groups.map((group, index) => (
          <button
            key={group.id}
            onClick={() => onSelect(group.id)}
            // 옆 카드는 살짝만 걸치게 두고, 흐리게 해서 지금 볼 카드가 뚜렷하게 보이도록
            className={`group w-[92%] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-300 hover:border-accent ${
              index === current ? "opacity-100" : "opacity-60"
            }`}
          >
            <div className="flex flex-col sm:flex-row">
              {group.thumbnailUrl ? (
                <div className="relative h-56 w-full sm:h-80 sm:w-2/5">
                  <Image
                    src={group.thumbnailUrl}
                    alt={group.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 92vw, 37vw"
                  />
                </div>
              ) : (
                <div className="h-56 w-full bg-accent-soft sm:h-80 sm:w-2/5" />
              )}

              <div className="flex flex-1 flex-col justify-center p-6 sm:p-10">
                {group.published === false && (
                  <span className="mb-2 inline-block w-fit rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    🔒 비공개
                  </span>
                )}
                {group.period && (
                  <p className="text-xs font-medium tracking-widest text-accent uppercase">
                    {group.period}
                  </p>
                )}
                <h3 className="mt-2 text-3xl font-semibold tracking-tight group-hover:text-accent">
                  {group.name}
                </h3>
                {group.summary && (
                  <p className="mt-3 text-lg leading-8 text-slate-600">
                    {group.summary}
                  </p>
                )}
                <span className="mt-6 text-sm text-accent">자세히 보기 →</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 툴바: 번호 · 막대 인디케이터 · 좌우 버튼 */}
      {groups.length > 1 && (
        <div className="mt-4 flex items-center gap-4">
          <p className="text-sm font-medium text-slate-500 tabular-nums">
            {String(current + 1).padStart(2, "0")} /{" "}
            {String(groups.length).padStart(2, "0")}
          </p>

          <div className="flex flex-1 gap-2">
            {groups.map((group, index) => (
              <button
                key={group.id}
                onClick={() => scrollToCard(index)}
                aria-label={`${index + 1}번째 프로젝트 보기`}
                className={
                  index === current
                    ? "h-1 flex-1 rounded-full bg-accent transition-colors"
                    : "h-1 flex-1 rounded-full bg-slate-200 transition-colors hover:bg-slate-300"
                }
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => scrollToCard(current - 1)}
              disabled={current === 0}
              aria-label="이전 프로젝트"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition-colors hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-slate-300 disabled:hover:text-slate-600"
            >
              ‹
            </button>
            <button
              onClick={() => scrollToCard(current + 1)}
              disabled={current === groups.length - 1}
              aria-label="다음 프로젝트"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition-colors hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-slate-300 disabled:hover:text-slate-600"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
