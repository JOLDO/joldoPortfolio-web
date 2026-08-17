"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "../../../../AuthProvider";
import { API } from "@/app/apiBase";
import { CATEGORIES, isCategory } from "../../../projectConfig";

/** 프로젝트(그룹) 등록 — 팀의 "1차", 회사의 "미플" 같은 묶음을 만든다. */
export default function NewGroupPage() {
  const router = useRouter();
  const { category } = useParams<{ category: string }>();
  const { isLoggedIn, getToken } = useAuth();

  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [contribution, setContribution] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [published, setPublished] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = isCategory(category) ? CATEGORIES[category] : null;

  // 관리자만 등록할 수 있다
  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  async function handleCreate() {
    const token = getToken();
    if (!cfg || !token) return;
    setBusy(true);
    setError(null);
    try {
      // 썸네일이 있으면 먼저 업로드해서 URL을 받는다
      let thumbnailUrl: string | null = null;
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append("file", thumbnailFile);
        const up = await axios.post(`${API}/api/images`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        thumbnailUrl = up.data.url;
      }

      await axios.post(
        `${API}/api/${cfg.groupApi}`,
        {
          name,
          summary,
          period,
          description,
          contribution,
          thumbnailUrl,
          published,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      router.back(); // 뒤로가기로 나가야 히스토리에 등록 화면이 안 남음
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
          새 프로젝트 등록 {cfg && `(${cfg.label})`}
        </h1>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-6 flex flex-col gap-3">
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2 text-2xl font-semibold"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="프로젝트 제목"
          />
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="한 줄 설명 (카드에서 보입니다)"
          />
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="기간 (예: 2026.07 ~ 2026.08)"
          />
          <textarea
            className="min-h-40 rounded border border-slate-300 bg-white px-3 py-2 leading-7"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="전체 설명 (모달 창에서 보입니다)"
          />

          <label className="flex flex-col gap-1 text-sm text-slate-600">
            내가 한 일
            <textarea
              className="text-foreground min-h-40 rounded border border-slate-300 bg-white px-3 py-2 text-base leading-7"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              placeholder={
                "이 프로젝트에서 내가 맡아 한 일을 적어주세요.\n줄바꿈은 그대로 보입니다."
              }
            />
          </label>

          <label className="text-sm text-slate-600">
            대표 이미지
            <input
              className="mt-2 block w-full text-sm text-slate-500 file:mr-3 file:cursor-pointer file:rounded-full file:border file:border-slate-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:border-accent hover:file:text-accent"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={!published}
              onChange={(e) => setPublished(!e.target.checked)}
            />
            🔒 비공개로 저장 (작성 중 — 관리자만 볼 수 있습니다)
          </label>

          <div className="flex gap-2">
            <button
              className="rounded bg-accent px-5 py-2 text-white disabled:opacity-50"
              onClick={handleCreate}
              disabled={busy || !name}
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
