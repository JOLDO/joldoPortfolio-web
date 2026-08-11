import { Suspense } from "react";
import Link from "next/link";
import LoginBox from "./LoginBox";
import NavLinks from "./NavLinks";
import ProjectsSection from "./ProjectsSection";
import CertificatesSection from "./CertificatesSection";
import SectionLabel from "./SectionLabel";
import { SKILL_GROUPS, LEVEL_STYLE } from "./skillsData";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col font-sans">
      {/* ── 상단 고정 네비게이션 ─────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-background/80 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold tracking-tight"></Link>
          <div className="flex items-center gap-5 text-sm text-slate-600">
            {/* 스크롤 위치에 따라 현재 섹션을 강조 (클라이언트 컴포넌트) */}
            <NavLinks />
            {/* 관리자 로그인 */}
            <LoginBox />
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6">
        {/* ── 히어로 ────────────────────────────────── */}
        <section className="relative flex flex-col gap-6 py-24 sm:py-32">
          {/* 뒤에 깔리는 옅은 파란 빛 (배경만 살짝 물들이는 용도) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-32 -z-10 h-[420px] w-[620px] rounded-full bg-accent-soft blur-3xl"
          />
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Frontend &amp; Backend Developer
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.25] tracking-tight sm:text-6xl">
            <span className="text-accent">화면부터 서버까지</span>
            <br />
            전부 만듭니다.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-600">
            안녕하세요, 오태흔입니다. 앱 프론트엔드를 주로 맡아왔고,
            {/* 좁은 화면은 어차피 줄이 짧게 끊기니 넓은 화면에서만 줄을 바꾼다 */}
            <br className="hidden sm:inline" />
            이제는 서버와 DB까지 직접 다루며 서비스 전체를 만들 수 있는
            개발자입니다.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#projects"
              className="flex h-12 items-center rounded-full bg-accent px-6 font-medium text-white shadow-sm transition-colors hover:bg-accent-hover"
            >
              프로젝트 보기 →
            </a>
            <a
              href="https://github.com/JOLDO"
              target="_blank"
              rel="noreferrer"
              className="flex h-12 items-center rounded-full border border-slate-300 bg-white px-6 font-medium transition-colors hover:border-accent hover:text-accent"
            >
              GitHub
            </a>
          </div>
        </section>

        {/* ── 01 소개 ───────────────────────────────── */}
        <section
          id="about"
          className="scroll-mt-20 border-t border-slate-200 py-20"
        >
          {/* 라벨·제목까지 왼쪽 칸에 넣어야 오른쪽 카드가 섹션 전체 기준으로 가운데 온다 */}
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
            <div>
              <SectionLabel en="About" />
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                어떤 개발자인가
              </h2>

              {/* TODO: 아래 문단은 초안입니다. 본인 경험으로 구체적으로 고쳐 쓰세요.
                  (어떤 문제를 / 어떻게 해결했고 / 결과가 어땠는지 순서로 쓰면 잘 읽힙니다) */}
              <div className="mt-8 flex flex-col gap-4 text-lg leading-8 text-slate-600">
                <p>
                  2019년부터 2025년까지 론픽에서 개발자로 일하며 장비의 기능
                  개발과 유지보수를 맡아왔습니다.
                </p>
                <p>
                  해보지 않은 영역이라고 피하지 않습니다. 필요하면 그 부분을
                  공부해서 최대한 이해한 다음 적용하는 편입니다. 그래야 문제가
                  생겼을 때 원인을 제대로 찾을 수 있다고 생각합니다.
                </p>
                <p>
                  새로운 기술은 문서를 읽고 직접 만들어보며 익히고, 팀과 함께
                  맞춰가며 일하는 방식을 좋아합니다.
                </p>
              </div>
            </div>

            {/* 강점 3가지 (섹션 전체 기준으로 세로 가운데) */}
            <div className="flex flex-col justify-center gap-3">
              {[
                {
                  title: "사용자 경험 우선",
                  desc: "쓰는 사람 입장에서 불편한 지점을 먼저 찾고 고칩니다.",
                },
                {
                  title: "프론트 + 백엔드",
                  desc: "화면부터 API·DB까지 흐름 전체를 이해하고 개발합니다.",
                },
                {
                  title: "끝까지 확인",
                  desc: "동작 결과만 보지 않고 요청·응답·예외까지 점검합니다.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="font-semibold">{item.title}</h3>
                  {/* TODO: 강점마다 실제 사례 한 줄씩 붙이면 훨씬 설득력 있습니다 */}
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 02 경력 ───────────────────────────────── */}
        <section
          id="career"
          className="scroll-mt-20 border-t border-slate-200 py-20"
        >
          <SectionLabel en="Career" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">경력</h2>

          {/* TODO: 회사/교육과정이 더 있으면 li를 복사해서 추가하세요 */}
          {/* 최근 경력이 위로 오게 정렬 */}
          <ol className="mt-8 flex flex-col gap-10 border-l-2 border-slate-200">
            <li className="relative pl-6">
              <span className="absolute -left-[7px] top-2 h-3 w-3 rounded-full border-2 border-white bg-accent" />
              <p className="text-sm font-medium text-accent">
                2019.11 — 2025.11
              </p>
              <h3 className="mt-1 text-xl font-semibold">
                론픽 · 프론트엔드 개발자
              </h3>
              {/* TODO: 담당 업무 2~3줄 (무엇을 만들었고 무엇을 개선했는지) */}
              <p className="mt-2 max-w-2xl leading-7 text-slate-600">
                웹/앱 프론트엔드 개발을 담당했습니다.
              </p>
            </li>
            <li className="relative pl-6">
              <span className="absolute -left-[7px] top-2 h-3 w-3 rounded-full border-2 border-white bg-accent" />
              <p className="text-sm font-medium text-accent">
                2018.02 — 2019.07
              </p>
              {/* TODO: 제이코퍼레이션에서의 직무를 회사명 뒤에 적으세요 (예: · 프론트엔드 개발자) */}
              <h3 className="mt-1 text-xl font-semibold">
                제이코퍼레이션 · 기술부
              </h3>
              {/* TODO: 담당 업무 2~3줄 */}
              <p className="mt-2 max-w-2xl leading-7 text-slate-600">
                비전 설치 및 세팅
              </p>
            </li>
          </ol>
        </section>

        {/* ── 03 기술 스택 ──────────────────────────── */}
        <section
          id="skills"
          className="scroll-mt-20 border-t border-slate-200 py-20"
        >
          <SectionLabel en="Skills" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            기술 스택
          </h2>

          {/* 색 안내 — 왼쪽 선 색이 숙련도를 뜻한다는 걸 먼저 알려준다 */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {(["상", "보통", "경험"] as const).map((level) => (
              <span key={level} className="flex items-center gap-2">
                <span
                  className={`h-4 w-1 rounded-full ${
                    level === "상"
                      ? "bg-accent"
                      : level === "보통"
                        ? "bg-accent/45"
                        : "bg-slate-300"
                  }`}
                />
                {level}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SKILL_GROUPS.map(({ title, skills }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold">{title}</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {skills.map((skill) => (
                    <li
                      key={skill.name}
                      className={`border-l-4 pl-3 ${LEVEL_STYLE[skill.level].bar}`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium">{skill.name}</span>
                        <span
                          className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${LEVEL_STYLE[skill.level].badge}`}
                        >
                          {skill.level}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {skill.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── 04 프로젝트 ───────────────────────────── */}
        <section
          id="projects"
          className="scroll-mt-20 border-t border-slate-200 py-20"
        >
          <SectionLabel en="Projects" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            프로젝트
          </h2>

          {/* 탭 + 캐러셀 + 모달 (클라이언트 컴포넌트).
              주소의 ?category=를 읽으므로 Suspense로 감싼다 */}
          <Suspense fallback={null}>
            <ProjectsSection />
          </Suspense>
        </section>

        {/* ── 자격증 (등록된 게 없고 로그아웃 상태면 섹션 자체가 안 나온다) ── */}
        <CertificatesSection />

        {/* ── 연락처 ─────────────────────────────── */}
        <section
          id="contact"
          className="scroll-mt-20 border-t border-slate-200 py-20"
        >
          <SectionLabel en="Contact" />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">연락처</h2>

          {/* 카드 수에 맞춰 칸을 나눈다 (지금은 이메일·전화 둘) */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Email",
                value: "bbat115@gmail.com",
                href: "mailto:bbat115@gmail.com",
              },
              {
                label: "Phone",
                value: "010-7233-8179",
                href: "tel:01072338179",
              },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-accent"
              >
                <p className="text-xs font-medium tracking-widest text-slate-500 uppercase">
                  {item.label}
                </p>
                <p className="mt-2 font-medium break-all">{item.value}</p>
              </a>
            ))}
          </div>
        </section>
      </main>

      {/* ── 푸터 (저작권만) ───────────────────────── */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto w-full max-w-5xl px-6 py-6 text-right text-sm text-slate-400">
          © {new Date().getFullYear()} 오태흔
        </div>
      </footer>
    </div>
  );
}
