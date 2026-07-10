import Link from "next/link";
import { ViewTransition } from "react";
import LoginBox from "./LoginBox";
import { CATEGORIES, CATEGORY_ORDER } from "./projects/projectConfig";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-start justify-center gap-8 py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
            안녕하세요, 개발자 오태흔입니다.
          </h1>
          <p className="max-w-lg text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            사용자 경험을 고민하며 웹/앱 프론트엔드, 백엔드를 개발하고 있습니다.
            새로운 기술을 배우고 팀과 함께 성장하는 것을 좋아합니다.
          </p>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            경력
          </h2>
          <ul className="flex flex-col gap-3 text-zinc-700 dark:text-zinc-300">
            <li>
              <span className="font-medium text-black dark:text-zinc-50">
                론픽
              </span>{" "}
              · 프론트엔드 개발자 (2019 ~ 2025)
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            기술 스택
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              "TypeScript",
              "React",
              "Next.js",
              "Flutter",
              "Spring boot",
              "Java",
              "Kotlin",
              "C# Winform",
            ].map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-black/[.08] px-3 py-1 text-sm text-zinc-700 dark:border-white/[.145] dark:text-zinc-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-4">
          {/* 카테고리별 프로젝트 버튼 (team/personal/company) */}
          {CATEGORY_ORDER.map((category) => (
            <Link
              key={category}
              href={`/projects/${category}`}
              transitionTypes={["nav-forward"]}
              className="flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-foreground px-6 text-background font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              <ViewTransition
                name={`project-title-${category}`}
                share={{ "nav-forward": "morph", default: "none" }}
              >
                <span>{CATEGORIES[category].label}</span>
              </ViewTransition>
              <span aria-hidden>→</span>
            </Link>
          ))}

          {/* 관리자 로그인 (메인 화면) */}
          <div>
            <LoginBox />
          </div>
        </div>
      </main>
    </div>
  );
}
