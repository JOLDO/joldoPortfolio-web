"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import TiptapEditor from "../../TiptapEditor";
import { useAuth } from "../../../AuthProvider";
import { API } from "@/app/apiBase";
import { CATEGORIES, isCategory } from "../../projectConfig";

export default function NewProjectPage() {
  const router = useRouter();
  const { category } = useParams<{ category: string }>();
  const { isLoggedIn, getToken } = useAuth();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [published, setPublished] = useState(true); // true=공개, false=작성 중(비공개)
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = isCategory(category) ? CATEGORIES[category] : null;
  const listHref = `/projects/${category}`;

  // 로그인 안 했으면 메인으로 돌려보냄 (글쓰기는 관리자만)
  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  async function handleCreate() {
    const token = getToken();
    if (!cfg || !token) return;
    setBusy(true);
    setError(null);
    try {
      // 썸네일 이미지가 있으면 먼저 업로드
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
        `${API}/api/${cfg.api}`,
        { title, summary, content, thumbnailUrl, published },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      router.replace(listHref); // 저장 후 목록으로 (히스토리에 글쓰기 안 남김)
    } catch {
      setError("저장 실패 (로그인 상태/입력값 확인)");
    } finally {
      setBusy(false);
    }
  }

  if (!isLoggedIn) return null; // 리다이렉트 중

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href={listHref}
          replace
          className="text-sm text-zinc-500 hover:underline"
        >
          ← 목록으로
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          새 프로젝트 작성 {cfg && `(${cfg.label})`}
        </h1>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-6 flex flex-col gap-3">
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
            placeholder="요약 (목록 카드에 보임)"
          />
          <label className="text-sm text-zinc-600 dark:text-zinc-400">
            썸네일 이미지
            <input
              className="mt-1 block"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div>
            <p className="mb-1 text-sm text-zinc-600 dark:text-zinc-400">
              본문 (이미지를 편집영역으로 드래그하거나 🖼 버튼으로 추가)
            </p>
            <TiptapEditor token={getToken() ?? ""} onChange={setContent} />
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={!published}
              onChange={(e) => setPublished(!e.target.checked)}
            />
            🔒 비공개로 저장 (작성 중 — 나만 볼 수 있어요)
          </label>

          <div className="flex gap-2">
            <button
              className="rounded bg-black px-5 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
              onClick={handleCreate}
              disabled={busy || !title}
            >
              {busy ? "저장 중..." : "저장"}
            </button>
            <Link
              href={listHref}
              replace
              className="rounded border border-zinc-300 px-5 py-2 dark:border-zinc-700"
            >
              취소
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
