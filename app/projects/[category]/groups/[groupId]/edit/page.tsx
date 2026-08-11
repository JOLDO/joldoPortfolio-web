"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "../../../../../AuthProvider";
import { API } from "@/app/apiBase";
import { CATEGORIES, isCategory } from "../../../../projectConfig";

type GroupDetail = {
  id: number;
  name: string;
  summary: string | null;
  description: string | null;
  contribution: string | null;
  period: string | null;
  thumbnailUrl: string | null;
  published: boolean;
};

/** 프로젝트(그룹) 수정 — 등록 화면과 같은 폼에 기존 값을 채워 넣은 것. */
export default function EditGroupPage() {
  const router = useRouter();
  const { category, groupId } = useParams<{
    category: string;
    groupId: string;
  }>();
  const { isLoggedIn, getToken } = useAuth();

  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [contribution, setContribution] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [published, setPublished] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = isCategory(category) ? CATEGORIES[category] : null;

  // 관리자만 수정할 수 있다
  useEffect(() => {
    if (!isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  // 기존 값 불러와서 폼에 채우기
  useEffect(() => {
    if (!cfg || !isLoggedIn) return;
    const token = getToken();
    axios
      .get<GroupDetail>(`${API}/api/${cfg.groupApi}/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setName(data.name);
        setSummary(data.summary ?? "");
        setPeriod(data.period ?? "");
        setDescription(data.description ?? "");
        setContribution(data.contribution ?? "");
        setThumbnailUrl(data.thumbnailUrl);
        setPublished(data.published);
      })
      .catch(() => setError("불러오기 실패 (없는 프로젝트일 수 있어요)"));
  }, [cfg, groupId, isLoggedIn, getToken]);

  async function handleUpdate() {
    const token = getToken();
    if (!cfg || !token) return;
    setBusy(true);
    setError(null);
    try {
      // 새 이미지를 골랐을 때만 업로드하고, 아니면 기존 URL을 그대로 보낸다
      let nextThumbnailUrl = thumbnailUrl;
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append("file", thumbnailFile);
        const up = await axios.post(`${API}/api/images`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        nextThumbnailUrl = up.data.url;
      }

      await axios.put(
        `${API}/api/${cfg.groupApi}/${groupId}`,
        {
          name,
          summary,
          period,
          description,
          contribution,
          thumbnailUrl: nextThumbnailUrl,
          published,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      router.back();
    } catch {
      setError("수정 실패 (로그인 상태/입력값 확인)");
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
          ← 돌아가기
        </button>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          프로젝트 수정 {cfg && `(${cfg.label})`}
        </h1>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-6 flex flex-col gap-3">
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2 text-2xl font-semibold"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 (예: 1차 프로젝트)"
          />
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="한 줄 설명 (카드에 보임)"
          />
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="기간 (예: 2024.03 ~ 2024.06)"
          />
          <textarea
            className="min-h-40 rounded border border-slate-300 bg-white px-3 py-2 leading-7"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="전체 설명 (모달에 보임)"
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
            대표 이미지 교체 (선택)
            {thumbnailUrl && !thumbnailFile && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt="현재 대표 이미지"
                className="mt-1 mb-2 h-32 w-full max-w-xs rounded border border-slate-200 object-cover"
              />
            )}
            <input
              className="mt-1 block"
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
            🔒 비공개 (작성 중 — 나만 볼 수 있어요)
          </label>

          <div className="flex gap-2">
            <button
              className="rounded bg-accent px-5 py-2 text-white disabled:opacity-50"
              onClick={handleUpdate}
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
