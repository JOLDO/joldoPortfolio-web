"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import { API } from "@/app/apiBase";
import {
  CATEGORIES,
  CATEGORY_ORDER,
  isCategory,
  type Category,
} from "./projects/projectConfig";
import GroupCards, { type GroupSummary } from "./projects/GroupCards";
import GroupModal from "./projects/GroupModal";

/**
 * 홈 화면의 프로젝트 섹션.
 * 팀/개인/회사 탭을 누르면 그 종류의 프로젝트가 가로 스크롤로 펼쳐지고,
 * 카드를 누르면 모달에서 파트(웹/앱/서버)로 들어갈 수 있다.
 */
export default function ProjectsSection() {
  const { isLoggedIn, getToken } = useAuth();

  // 고른 탭을 주소(?category=company)에 남긴다.
  // 글쓰기 같은 다른 화면에 갔다 돌아와도 보던 탭이 그대로 열려 있게 하려는 것.
  const fromUrl = useSearchParams().get("category");
  const [category, setCategory] = useState<Category>(
    isCategory(fromUrl ?? "") ? (fromUrl as Category) : "team",
  );

  function selectCategory(next: Category) {
    setCategory(next);
    // pushState가 아니라 replaceState — 탭을 누를 때마다 뒤로가기 기록이 쌓이면 곤란하다
    history.replaceState(null, "", `?category=${next}#projects`);
  }
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [openGroupId, setOpenGroupId] = useState<number | null>(null);

  const cfg = CATEGORIES[category];

  // 로그인(관리자)이면 비공개 프로젝트까지 받아온다
  const fetchGroups = useCallback(() => {
    const token = isLoggedIn ? getToken() : null;
    return axios
      .get<GroupSummary[]>(
        `${API}/api/${cfg.groupApi}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      )
      .then((res) => res.data);
  }, [cfg, isLoggedIn, getToken]);

  useEffect(() => {
    let ignore = false; // 탭을 빨리 바꿨을 때 늦게 온 응답은 버린다
    fetchGroups()
      .then((data) => {
        if (!ignore) setGroups(data);
      })
      .catch(console.error);
    return () => {
      ignore = true;
    };
  }, [fetchGroups]);

  return (
    <>
      {/* 카테고리 탭 */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {CATEGORY_ORDER.map((key) => (
          <button
            key={key}
            onClick={() => selectCategory(key)}
            className={
              key === category
                ? "rounded-full bg-accent px-5 py-2 text-sm font-medium text-white"
                : "rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-accent hover:text-accent"
            }
          >
            {CATEGORIES[key].label}
          </button>
        ))}

        {/* 관리자만 보이는 등록 버튼 (글은 모달 안 "＋ 상세 글 추가"로 쓴다) */}
        {isLoggedIn && (
          <Link
            href={`/projects/${category}/groups/new`}
            className="ml-auto rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium hover:border-accent hover:text-accent"
          >
            📁 프로젝트 등록
          </Link>
        )}
      </div>

      {/* 선택한 종류의 프로젝트들 (가로 스크롤) */}
      <div className="mt-6">
        <GroupCards groups={groups} onSelect={setOpenGroupId} />
      </div>

      {/* 전체 보기는 관리자용 목록(비공개 글·낱개 글까지 보임)이라 로그인했을 때만 */}
      {isLoggedIn && (
        <Link
          href={`/projects/${category}`}
          className="text-sm text-slate-500 hover:text-accent"
        >
          {cfg.label} 전체 보기 →
        </Link>
      )}

      {/* 카드 클릭 시 뜨는 프로젝트 상세 모달 */}
      <GroupModal
        category={category}
        groupApi={cfg.groupApi}
        groupId={openGroupId}
        onClose={() => setOpenGroupId(null)}
        onDeleted={() => fetchGroups().then(setGroups)}
      />
    </>
  );
}
