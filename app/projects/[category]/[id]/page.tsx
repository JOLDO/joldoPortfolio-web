"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import ContentViewer from "../../ContentViewer";
import TiptapEditor from "../../TiptapEditor";
import { useAuth } from "../../../AuthProvider";
import { API } from "@/app/apiBase";
import { CATEGORIES, isCategory, PART_SUGGESTIONS } from "../../projectConfig";

type GroupOption = { id: number; name: string };

type ProjectDetail = {
  id: number;
  groupId: number | null;
  part: string | null;
  title: string;
  summary: string | null;
  content: string | null;
  thumbnailUrl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function ProjectDetailPage() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const router = useRouter();
  const { isLoggedIn, getToken } = useAuth();

  const cfg = isCategory(category) ? CATEGORIES[category] : null;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── 수정 모드 상태 ────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [groups, setGroups] = useState<GroupOption[]>([]); // 소속 프로젝트 후보
  const [groupId, setGroupId] = useState(""); // "" = 소속 없음
  const [part, setPart] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true); // 수정폼용: true=공개, false=비공개
  const [busy, setBusy] = useState(false);

  // 로그인(관리자)이면 토큰을 실어야 비공개 글도 불러올 수 있다(방문자는 비공개면 404).
  const fetchProject = useCallback(() => {
    const token = isLoggedIn ? getToken() : null;
    return axios
      .get<ProjectDetail>(
        `${API}/api/${cfg?.api}/${id}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      )
      .then((res) => res.data);
  }, [cfg, id, isLoggedIn, getToken]);

  useEffect(() => {
    if (!cfg) return;
    fetchProject()
      .then(setProject)
      .catch(() => setError("불러오기 실패 (없는 프로젝트일 수 있어요)"));
  }, [cfg, fetchProject]);

  // 뒤로가기로 나가야 상세 기록이 히스토리에서 빠진다 (replace는 목록 기록을 지워서 홈으로 튐)
  const goToList = () => router.back();

  // 수정할 때 고를 소속 프로젝트 목록 (관리자만 필요)
  useEffect(() => {
    if (!cfg || !isLoggedIn) return;
    const token = getToken();
    axios
      .get<GroupOption[]>(`${API}/api/${cfg.groupApi}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setGroups(res.data))
      .catch(console.error);
  }, [cfg, isLoggedIn, getToken]);

  // "수정" 클릭 → 기존 값 세팅 후 편집 모드 진입
  function startEdit() {
    if (!project) return;
    setGroupId(project.groupId === null ? "" : String(project.groupId));
    setPart(project.part ?? "");
    setTitle(project.title);
    setSummary(project.summary ?? "");
    setContent(project.content ?? "");
    setPublished(project.published);
    setEditing(true);
  }

  // 저장 → PUT /api/{cfg.api}/{id}
  async function handleUpdate() {
    const token = getToken();
    if (!cfg || !token || !project) return;
    setBusy(true);
    setError(null);
    try {
      // 썸네일은 프로젝트(그룹)에만 있다 — 글에는 안 보낸다
      await axios.put(
        `${API}/api/${cfg.api}/${id}`,
        {
          groupId: groupId === "" ? null : Number(groupId), // "" = 소속 없는 낱개 글
          part: part || null,
          title,
          summary,
          content,
          published,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // 새 데이터를 먼저 받아 project를 갱신한 뒤 보기모드로 전환한다.
      // (순서를 바꾸면 ContentViewer가 옛 content로 마운트돼 화면이 안 바뀜)
      const fresh = await fetchProject();
      setProject(fresh);
      setEditing(false);
    } catch {
      setError("수정 실패 (로그인 상태/입력값 확인)");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <button
          onClick={goToList}
          className="text-sm text-slate-500 hover:underline"
        >
          ← 목록으로
        </button>

        {error && <p className="mt-6 text-red-600">{error}</p>}
        {!error && !project && <p className="mt-6 text-slate-500">로딩중...</p>}

        {/* ── 수정 모드 ──────────────────────────────── */}
        {project && editing && (
          <section className="mt-6 flex flex-col gap-3">
            {/* 어느 프로젝트의 어느 파트인지 (둘 다 비우면 낱개 글) */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
                소속 프로젝트
                <select
                  className="text-foreground rounded border border-slate-300 bg-white px-3 py-2 text-base"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                >
                  <option value="">소속 없음 (낱개 글)</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
                파트
                <input
                  className="text-foreground rounded border border-slate-300 bg-white px-3 py-2 text-base"
                  value={part}
                  onChange={(e) => setPart(e.target.value)}
                  placeholder="웹 / 앱 / 서버"
                  list="part-suggestions"
                />
                <datalist id="part-suggestions">
                  {PART_SUGGESTIONS.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
              </label>
            </div>

            <input
              className="rounded border border-slate-300 px-3 py-2 text-2xl font-semibold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목"
            />
            <input
              className="rounded border border-slate-300 px-3 py-2"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="요약"
            />

            <TiptapEditor
              token={getToken() ?? ""}
              initialContent={project.content ?? ""}
              onChange={setContent}
            />

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={!published}
                onChange={(e) => setPublished(!e.target.checked)}
              />
              🔒 비공개 (작성 중 — 나만 볼 수 있어요)
            </label>

            <div className="flex gap-2 mt-2">
              <button
                className="rounded bg-accent px-4 py-2 text-white disabled:opacity-50"
                onClick={handleUpdate}
                disabled={busy || !title}
              >
                {busy ? "저장 중..." : "저장"}
              </button>
              <button
                className="rounded border border-slate-300 px-4 py-2"
                onClick={() => setEditing(false)}
              >
                취소
              </button>
            </div>
          </section>
        )}

        {/* ── 보기 모드 ──────────────────────────────── */}
        {project && !editing && (
          <article className="mt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                {project.published === false && (
                  <span className="mb-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    🔒 비공개 (나만 보임)
                  </span>
                )}
                {/* 어느 프로젝트의 어느 파트였는지 */}
                {project.part && (
                  <span className="mb-2 mr-2 inline-block rounded bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-hover">
                    {project.part}
                  </span>
                )}
                <h1 className="text-4xl font-semibold tracking-tight text-black">
                  {project.title}
                </h1>
              </div>
              {isLoggedIn && (
                <button
                  className="shrink-0 rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
                  onClick={startEdit}
                >
                  수정
                </button>
              )}
            </div>

            {project.summary && (
              <p className="mt-2 text-lg text-slate-600">{project.summary}</p>
            )}

            <p className="mt-1 text-xs text-slate-400">
              작성: {new Date(project.createdAt).toLocaleString()}
            </p>

            <hr className="my-6 border-slate-200" />

            {project.content ? (
              <ContentViewer content={project.content} />
            ) : (
              <p className="text-slate-500">본문이 없습니다.</p>
            )}
          </article>
        )}
      </main>
    </div>
  );
}
