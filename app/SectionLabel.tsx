/**
 * 섹션 제목 위에 붙는 작은 라벨 (01 ─ ABOUT).
 * 번호는 globals.css의 CSS 카운터가 매기므로 여기서 넘겨줄 필요가 없다.
 * (자격증 섹션이 빠지면 뒤 섹션 번호가 자동으로 당겨진다)
 */
export default function SectionLabel({ en }: { en: string }) {
  return (
    <p className="flex items-center gap-3 text-sm font-medium tracking-widest">
      <span className="section-no text-accent" />
      <span className="h-px w-8 bg-slate-300" />
      <span className="text-slate-500 uppercase">{en}</span>
    </p>
  );
}
