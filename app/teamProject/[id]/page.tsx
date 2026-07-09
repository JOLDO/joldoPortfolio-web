"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import ContentViewer from "../ContentViewer";
import TiptapEditor from "../TiptapEditor";
import { useAuth } from "../../AuthProvider";
import { API } from "@/app/apiBase";

type TeamProjectDetail = {
  id: number;
  title: string;
  summary: string | null;
  content: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function TeamProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoggedIn, getToken } = useAuth();

  const [project, setProject] = useState<TeamProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── 수정 모드 상태 ────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchProject = useCallback(
    () =>
      axios
        .get<TeamProjectDetail>(`${API}/api/team-projects/${id}`)
        .then((res) => res.data),
    [id],
  );

  useEffect(() => {
    fetchProject()
      .then(setProject)
      .catch(() => setError("불러오기 실패 (없는 프로젝트일 수 있어요)"));
  }, [fetchProject]);

  const goToList = () => router.replace("/teamProject");

  // "수정" 클릭 → 기존 값 세팅 후 편집 모드 진입
  function startEdit() {
    if (!project) return;
    setTitle(project.title);
    setSummary(project.summary ?? "");
    setContent(project.content ?? "");
    setThumbnailFile(null);
    setThumbnailPreview(project.thumbnailUrl);
    setEditing(true);
  }

  // 썸네일 파일 선택 → 메모리 해제 + 파일 유효성 검사 추가
  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; //파일 이 변경되었을때 변경한 파일을 변수에 담는다.
    if (!file) return; // 취소 버튼 눌렀을 때 기존 상태 유지되도록 방어(취소를 누르면 실제적으로 변경은 없지만 원래 가지고 있던 것도 없애버리기 때문에)

    // 기존에 생성된 blob URL이 있다면 메모리 해제 (메모리 누수 방지)
    //이전에 있을수도 있는 썸네일임시 주소를 메모리에서 해제
    //썸네일 프리뷰는 처음에는 url에서 읽어와 그리지만 파일 선택은 내 컴퓨터의 파일중에 골라서 하는거기 때문에 외부에서 다운받지 않는 blob:이라는 이름표가 붙음
    //보통 컴퓨터의 파일은 file://이라고 붙이지만 웹페이지(웹사이트)는 보안상 그 실제 경로를 알 수 없어서 blob:이 사용됨
    if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file)); //새로 만듦
  }

  // 저장 요청
  async function handleUpdate() {
    const token = getToken();
    if (!token || !project) return;

    setBusy(true);
    setError(null);

    try {
      let thumbnailUrl = project.thumbnailUrl;

      if (thumbnailFile) {
        const formData = new FormData(); //file다룰때 formdata로 감싸서 사용
        formData.append("file", thumbnailFile);
        const up = await axios.post(`${API}/api/images`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        thumbnailUrl = up.data.url; //파일 넣고 나서 썸네일url을 읽어오고
      }

      await axios.put(
        `${API}/api/team-projects/${id}`,
        { title, summary, content, thumbnailUrl }, //썸네일과 데이터를 넣어줌
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

        {/* ── 1. 수정 모드 ──────────────────────────────── */}
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
                accept="image/*" //image/jpg 이런식으로 다 들어올수 있게
                onChange={handleThumbnailChange}
              />
            </div>

            <TiptapEditor
              token={getToken() ?? ""}
              initialContent={project.content ?? ""}
              onChange={setContent}
            />

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

        {/* ── 2. 보기 모드 ──────────────────────────────── */}
        {project && !editing && (
          <article className="mt-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
                {project.title}
              </h1>
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
