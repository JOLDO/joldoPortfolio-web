"use client";

import { useEffect, useState, ViewTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "../AuthProvider";
import { API } from "@/app/apiBase";

type TeamProjectSummary = {
  id: number;
  title: string;
  summary: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function TeamProjectPage() {
  const [projects, setProjects] = useState<TeamProjectSummary[]>([]);
  const { isLoggedIn, getToken } = useAuth();

  // 1. 화살표 함수로 딱 한 줄로 다이어트 (axios 자체가 promise를 뱉으므로 async/await 제거 가능)
  const fetchProjects = () =>
    axios
      .get<TeamProjectSummary[]>(`${API}/api/team-projects`)
      .then((res) => res.data); //데이터 받아오고

  useEffect(() => {
    fetchProjects().then(setProjects).catch(console.error); //(data) => setProjects(data)를 then 내부에서 setProject만 적으면 적용해줌, catch도 (error) => console.error(error)를 console.error로 적어도 적용해줌 //데이터를 넣고
  }, []);

  // 삭제 요청
  async function handleDelete(id: number) {
    const token = getToken();
    if (!token || !confirm("정말 이 프로젝트를 삭제할 거야?")) return;

    try {
      await axios.delete(`${API}/api/team-projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2. 서버에서 새로 긁어와서 한 줄로 세팅
      fetchProjects().then(setProjects);
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제에 실패했어. 권한을 확인해 봐.");
    }
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
              name="team-project-title"
              share={{ "nav-forward": "morph", default: "none" }}
            >
              <span>팀 프로젝트</span>
            </ViewTransition>
          </h1>
          {isLoggedIn && (
            <Link
              href="/teamProject/new"
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
                    href={`/teamProject/${project.id}`}
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
