"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import TiptapEditor from "../../TiptapEditor";
import { useAuth } from "../../../AuthProvider";
import { API } from "@/app/apiBase";
import { CATEGORIES, isCategory, PART_SUGGESTIONS } from "../../projectConfig";

// 소속 프로젝트를 고르는 select용 (id와 이름만 있으면 된다)
type GroupOption = { id: number; name: string };

// useSearchParams를 쓰는 부분은 Suspense로 감싸야 해서 폼을 따로 뒀다
export default function NewProjectPage() {
  return (
    <Suspense fallback={null}>
      <NewProjectForm />
    </Suspense>
  );
}

function NewProjectForm() {
  const router = useRouter();
  const { category } = useParams<{ category: string }>();
  const { isLoggedIn, getToken } = useAuth();

  // 모달의 "＋ 한 일 추가"로 들어오면 ?groupId=3 이 붙어 있다 → 소속을 미리 골라둔다
  const presetGroupId = useSearchParams().get("groupId") ?? "";

  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [groupId, setGroupId] = useState(presetGroupId); // "" = 소속 없음
  const [part, setPart] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true); // true=공개, false=작성 중(비공개)
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = isCategory(category) ? CATEGORIES[category] : null;

  // 로그인 안 했으면 메인으로 돌려보냄 (글쓰기는 관리자만)
  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  // 이 카테고리의 프로젝트(그룹) 목록 — 이 글을 어디에 넣을지 고르는 용도
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

  async function handleCreate() {
    const token = getToken();
    if (!cfg || !token) return;
    setBusy(true);
    setError(null);
    try {
      // 썸네일은 프로젝트(그룹)에만 있다. 글은 카드로 안 보이니 필요 없음.
      await axios.post(
        `${API}/api/${cfg.api}`,
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

      router.back(); // 저장 후 목록으로 (뒤로가기로 나가야 히스토리에 글쓰기가 안 남음)
    } catch {
      setError("저장 실패 (로그인 상태/입력값 확인)");
    } finally {
      setBusy(false);
    }
  }

  if (!isLoggedIn) return null; // 리다이렉트 중

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <button
          onClick={() => router.back()}
          className="text-sm text-slate-500 hover:underline"
        >
          ← 목록으로
        </button>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          새 글 작성 {cfg && `(${cfg.label})`}
        </h1>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-6 flex flex-col gap-3">
          {/* 어느 프로젝트의 어느 파트인지 — 둘 다 비워두면 낱개 글이 된다 */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
              소속 프로젝트
              <select
                className="rounded border border-slate-300 bg-white px-3 py-2 text-base text-foreground"
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
              {/* list=datalist라 제안값을 고를 수도, 직접 칠 수도 있다 */}
              <input
                className="rounded border border-slate-300 bg-white px-3 py-2 text-base text-foreground"
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
            placeholder="요약 (목록 카드에 보임)"
          />
          <div>
            <p className="mb-1 text-sm text-slate-600">
              본문 (이미지를 편집영역으로 드래그하거나 🖼 버튼으로 추가)
            </p>
            <TiptapEditor token={getToken() ?? ""} onChange={setContent} />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={!published}
              onChange={(e) => setPublished(!e.target.checked)}
            />
            🔒 비공개로 저장 (작성 중 — 나만 볼 수 있어요)
          </label>

          <div className="flex gap-2">
            <button
              className="rounded bg-accent px-5 py-2 text-white disabled:opacity-50"
              onClick={handleCreate}
              disabled={busy || !title}
            >
              {busy ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={() => router.back()}
              className="rounded border border-slate-300 px-5 py-2"
            >
              취소
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
