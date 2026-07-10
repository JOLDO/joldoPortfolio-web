"use client";

import { useEffect, useState, useCallback, ViewTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "../../AuthProvider";
import { API } from "@/app/apiBase";
import { CATEGORIES, isCategory } from "../projectConfig";

type ProjectSummary = {
  id: number;
  title: string;
  summary: string | null;
  thumbnailUrl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function ProjectListPage() {
  const { category } = useParams<{ category: string }>();
  const { isLoggedIn, getToken } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);

  // 유효한 카테고리면 설정을 꺼냄 (아니면 null → 아래에서 안내)
  const cfg = isCategory(category) ? CATEGORIES[category] : null;

  // 화살표 함수로 딱 한 줄로 다이어트 (axios 자체가 promise를 뱉으므로 async/await 제거 가능)
  // category가 바뀌면 fetch도 새로 생성되도록 useCallback([cfg])
  // 로그인(관리자)이면 토큰을 실어 보내 비공개 글까지 받아온다. 비로그인은 공개 글만.
  const fetchProjects = useCallback(() => {
    const token = isLoggedIn ? getToken() : null;
    return axios
      .get<
        ProjectSummary[]
      >(`${API}/api/${cfg?.api}`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      .then((res) => res.data); //데이터 받아오고
  }, [cfg, isLoggedIn, getToken]);

  useEffect(() => {
    if (!cfg) return;
    // (data) => setProjects(data)를 then 내부에서 setProjects만 적으면 적용해줌
    // catch도 (error) => console.error(error)를 console.error로 적어도 적용됨
    fetchProjects().then(setProjects).catch(console.error); //데이터를 넣고
  }, [cfg, fetchProjects]);

  // 삭제 요청
  async function handleDelete(id: number) {
    const token = getToken();
    if (!cfg || !token || !confirm("정말 이 프로젝트를 삭제할 거야?")) return;
    try {
      await axios.delete(`${API}/api/${cfg.api}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // 서버에서 새로 긁어와서 한 줄로 세팅
      fetchProjects().then(setProjects);
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제에 실패했어. 권한을 확인해 봐.");
    }
  }

  // 잘못된 카테고리로 들어온 경우
  if (!cfg) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <main className="mx-auto max-w-3xl px-6 py-12">
          <Link href="/" className="text-sm text-zinc-500 hover:underline">
            ← 메인으로
          </Link>
          <p className="mt-6 text-zinc-500">존재하지 않는 프로젝트 종류예요.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* 상단 네비게이션 */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← 메인으로
        </Link>

        {/* 헤더 영역 */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
            <ViewTransition
              name={`project-title-${category}`}
              share={{ "nav-forward": "morph", default: "none" }}
            >
              <span>{cfg.label}</span>
            </ViewTransition>
          </h1>
          {isLoggedIn && (
            <Link
              href={`/projects/${category}/new`}
              replace
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              ✏️ 글쓰기
            </Link>
          )}
        </div>

        {/* 리스트 영역 */}
        <section className="mt-10">
          {projects.length === 0 ? (
            <p className="text-zinc-500">아직 프로젝트가 없어요.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <Link
                    href={`/projects/${category}/${project.id}`}
                    replace
                    className="flex-1"
                  >
                    {project.thumbnailUrl && (
                      <div className="relative h-40 w-full">
                        <Image
                          src={project.thumbnailUrl}
                          alt={project.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      {project.published === false && (
                        <span className="mb-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                          🔒 비공개
                        </span>
                      )}
                      <h3 className="font-semibold text-black dark:text-zinc-50">
                        {project.title}
                      </h3>
                      {project.summary && (
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                          {project.summary}
                        </p>
                      )}
                    </div>
                  </Link>

                  {isLoggedIn && (
                    <div className="px-4 pb-4 mt-auto">
                      <button
                        className="text-sm font-medium text-red-600 hover:underline"
                        onClick={() => handleDelete(project.id)}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
