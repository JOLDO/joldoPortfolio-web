"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import ContentViewer from "../../ContentViewer";
import TiptapEditor from "../../TiptapEditor";
import { useAuth } from "../../../AuthProvider";
import { API } from "@/app/apiBase";
import { CATEGORIES, isCategory } from "../../projectConfig";

type ProjectDetail = {
  id: number;
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
  const listHref = `/projects/${category}`;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── 수정 모드 상태 ────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
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

  const goToList = () => router.replace(listHref);

  // "수정" 클릭 → 기존 값 세팅 후 편집 모드 진입
  function startEdit() {
    if (!project) return;
    setTitle(project.title);
    setSummary(project.summary ?? "");
    setContent(project.content ?? "");
    setThumbnailFile(null);
    setThumbnailPreview(project.thumbnailUrl);
    setPublished(project.published);
    setEditing(true);
  }

  // 썸네일 파일 선택 → 미리보기 갱신 + 이전 blob 메모리 해제
  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; //파일이 변경되었을때 변경한 파일을 변수에 담는다.
    if (!file) return; // 취소 눌렀을 때 방어(취소해도 원래 갖고 있던 걸 없애버리는 것 방지)

    // 기존에 생성된 blob URL이 있다면 메모리 해제 (메모리 누수 방지)
    // 썸네일 프리뷰는 처음엔 서버 url로 그리지만, 파일 선택은 내 컴퓨터 파일이라 외부에서 안 받는 blob:이 붙음
    // 보통 컴퓨터 파일은 file://인데 웹페이지는 보안상 실제 경로를 알 수 없어서 blob:이 사용됨
    if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file)); //새로 만듦
  }

  // 저장 → PUT /api/{cfg.api}/{id}
  async function handleUpdate() {
    const token = getToken();
    if (!cfg || !token || !project) return;
    setBusy(true);
    setError(null);
    try {
      let thumbnailUrl = project.thumbnailUrl;
      if (thumbnailFile) {
        const formData = new FormData(); //file 다룰 때 formdata로 감싸서 사용
        formData.append("file", thumbnailFile);
        const up = await axios.post(`${API}/api/images`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        thumbnailUrl = up.data.url; //파일 넣고 나서 썸네일url을 읽어오고
      }
      await axios.put(
        `${API}/api/${cfg.api}/${id}`,
        { title, summary, content, thumbnailUrl, published }, //썸네일과 데이터를 넣어줌
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <button
          onClick={goToList}
          className="text-sm text-zinc-500 hover:underline"
        >
          ← 목록으로
        </button>

        {error && <p className="mt-6 text-red-600">{error}</p>}
        {!error && !project && <p className="mt-6 text-zinc-500">로딩중...</p>}

        {/* ── 수정 모드 ──────────────────────────────── */}
        {project && editing && (
          <section className="mt-6 flex flex-col gap-3">
            <input
              className="rounded border border-zinc-300 px-3 py-2 text-2xl font-semibold dark:border-zinc-700 dark:bg-zinc-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목"
            />
            <input
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="요약"
            />

            <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
              <span>썸네일 교체 (선택)</span>
              {thumbnailPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnailPreview}
                  alt="썸네일 미리보기"
                  className="mt-1 mb-2 h-32 w-full max-w-xs rounded object-cover border border-zinc-200 dark:border-zinc-800"
                />
              )}
              <input
                type="file"
                accept="image/*" //image/jpg 등 이미지면 다 들어올 수 있게
                onChange={handleThumbnailChange}
              />
            </div>

            <TiptapEditor
              token={getToken() ?? ""}
              initialContent={project.content ?? ""}
              onChange={setContent}
            />

            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={!published}
                onChange={(e) => setPublished(!e.target.checked)}
              />
              🔒 비공개 (작성 중 — 나만 볼 수 있어요)
            </label>

            <div className="flex gap-2 mt-2">
              <button
                className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
                onClick={handleUpdate}
                disabled={busy || !title}
              >
                {busy ? "저장 중..." : "저장"}
              </button>
              <button
                className="rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
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
                  <span className="mb-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    🔒 비공개 (나만 보임)
                  </span>
                )}
                <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
                  {project.title}
                </h1>
              </div>
              {isLoggedIn && (
                <button
                  className="shrink-0 rounded border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  onClick={startEdit}
                >
                  수정
                </button>
              )}
            </div>

            {project.summary && (
              <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
                {project.summary}
              </p>
            )}

            <p className="mt-1 text-xs text-zinc-400">
              작성: {new Date(project.createdAt).toLocaleString()}
            </p>

            <hr className="my-6 border-zinc-200 dark:border-zinc-800" />

            {project.content ? (
              <ContentViewer content={project.content} />
            ) : (
              <p className="text-zinc-500">본문이 없습니다.</p>
            )}
          </article>
        )}
      </main>
    </div>
  );
}
