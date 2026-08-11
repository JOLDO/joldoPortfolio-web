"use client";

import { useEffect, useState, useCallback, ViewTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "../../AuthProvider";
import { API } from "@/app/apiBase";
import { CATEGORIES, isCategory } from "../projectConfig";
import GroupModal from "../GroupModal";
import GroupCards, { type GroupSummary } from "../GroupCards";

type ProjectSummary = {
  id: number;
  groupId: number | null;
  part: string | null;
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
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  // 모달에 띄울 그룹 id (null이면 닫힘)
  const [openGroupId, setOpenGroupId] = useState<number | null>(null);

  // 유효한 카테고리면 설정을 꺼냄 (아니면 null → 아래에서 안내)
  const cfg = isCategory(category) ? CATEGORIES[category] : null;

  // 로그인(관리자)이면 토큰을 실어 보내 비공개까지 받아온다. 비로그인은 공개된 것만.
  const authHeader = useCallback(() => {
    const token = isLoggedIn ? getToken() : null;
    return token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;
  }, [isLoggedIn, getToken]);

  const fetchGroups = useCallback(() => {
    return axios
      .get<GroupSummary[]>(`${API}/api/${cfg?.groupApi}`, authHeader())
      .then((res) => res.data);
  }, [cfg, authHeader]);

  const fetchProjects = useCallback(() => {
    return axios
      .get<ProjectSummary[]>(`${API}/api/${cfg?.api}`, authHeader())
      .then((res) => res.data);
  }, [cfg, authHeader]);

  useEffect(() => {
    if (!cfg) return;
    fetchGroups().then(setGroups).catch(console.error);
    fetchProjects().then(setProjects).catch(console.error);
  }, [cfg, fetchGroups, fetchProjects]);

  // 글 삭제 요청
  async function handleDelete(id: number) {
    const token = getToken();
    if (!cfg || !token || !confirm("정말 이 글을 삭제할 거야?")) return;
    try {
      await axios.delete(`${API}/api/${cfg.api}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects().then(setProjects);
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제에 실패했어. 권한을 확인해 봐.");
    }
  }

  // 잘못된 카테고리로 들어온 경우
  if (!cfg) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-3xl px-6 py-12">
          <Link href="/" className="text-sm text-slate-500 hover:underline">
            ← 메인으로
          </Link>
          <p className="mt-6 text-slate-500">
            존재하지 않는 프로젝트 종류예요.
          </p>
        </main>
      </div>
    );
  }

  // 그룹에 안 묶인 낱개 글만 아래쪽 목록에 보여준다 (묶인 글은 모달에서 접근)
  const looseProjects = projects.filter((p) => p.groupId === null);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* 상단 네비게이션 */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-accent"
        >
          ← 메인으로
        </Link>

        {/* 헤더 영역 */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-semibold tracking-tight">
            <ViewTransition
              name={`project-title-${category}`}
              share={{ "nav-forward": "morph", default: "none" }}
            >
              <span>{cfg.label}</span>
            </ViewTransition>
          </h1>
          {isLoggedIn && (
            <div className="flex gap-2">
              <Link
                href={`/projects/${category}/groups/new`}
                className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-white"
              >
                📁 프로젝트 등록
              </Link>
              <Link
                href={`/projects/${category}/new`}
                className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                ✏️ 글쓰기
              </Link>
            </div>
          )}
        </div>

        {/* 프로젝트(그룹) 가로 스크롤 — 홈 화면과 같은 카드를 쓴다 */}
        <section className="mt-10">
          <GroupCards groups={groups} onSelect={setOpenGroupId} />
        </section>

        {/* 그룹에 안 묶인 낱개 글 */}
        {looseProjects.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-semibold tracking-widest text-slate-500 uppercase">
              그 외 글
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {looseProjects.map((project) => (
                <li
                  key={project.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <Link
                    href={`/projects/${category}/${project.id}`}
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
                        <span className="mb-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          🔒 비공개
                        </span>
                      )}
                      <h3 className="font-semibold">{project.title}</h3>
                      {project.summary && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {project.summary}
                        </p>
                      )}
                    </div>
                  </Link>

                  {isLoggedIn && (
                    <div className="mt-auto px-4 pb-4">
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
          </section>
        )}
      </main>

      {/* 카드 클릭 시 뜨는 프로젝트 상세 모달 */}
      <GroupModal
        category={category}
        groupApi={cfg.groupApi}
        groupId={openGroupId}
        onClose={() => setOpenGroupId(null)}
        onDeleted={() => fetchGroups().then(setGroups)}
      />
    </div>
  );
}
