"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "../AuthProvider";
import { API } from "@/app/apiBase";

// 그룹 상세 = 그룹 정보 + 그 그룹에 속한 글(파트) 목록
type GroupDetail = {
  id: number;
  name: string;
  summary: string | null;
  description: string | null;
  contribution: string | null;
  period: string | null;
  thumbnailUrl: string | null;
  published: boolean;
  posts: {
    id: number;
    part: string | null;
    title: string;
    summary: string | null;
    published: boolean;
  }[];
};

type Props = {
  category: string;
  groupApi: string;
  /** 열려 있는 그룹 id. null이면 닫힌 상태. */
  groupId: number | null;
  onClose: () => void;
  /** 삭제 후 목록을 새로 받아오게 하려고 부모에게 알린다. */
  onDeleted: () => void;
};

export default function GroupModal({
  category,
  groupApi,
  groupId,
  onClose,
  onDeleted,
}: Props) {
  const { isLoggedIn, getToken } = useAuth();
  // 받아온 그룹과 에러는 "어느 그룹 것인지"까지 같이 들고 있는다.
  // 그래야 다른 카드를 눌렀을 때 이전 내용이 잠깐 비치지 않는다.
  const [loaded, setLoaded] = useState<GroupDetail | null>(null);
  const [failed, setFailed] = useState<{ id: number; message: string } | null>(
    null,
  );

  // 세로로 긴 사진인지 기억해 둔다. 주소까지 같이 들고 있어서 다른 프로젝트를 열면 자동으로 초기화된다.
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);

  const group = loaded && loaded.id === groupId ? loaded : null;
  const isPortrait =
    !!group?.thumbnailUrl && portraitUrl === group.thumbnailUrl;
  const error = failed && failed.id === groupId ? failed.message : null;
  const loading = groupId !== null && !group && !error;

  const dialogRef = useRef<HTMLDialogElement>(null);

  // groupId가 생기면 열고, null이 되면 닫는다 (LoginBox와 같은 방식)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (groupId !== null) {
      if (!dialog.open) dialog.showModal();
      // 모달이 떠 있는 동안 뒤 페이지는 스크롤되지 않게 잠근다.
      // (모달 내용이 짧아 스크롤바가 없을 때 휠을 굴리면 뒤 화면이 움직이던 문제)
      document.body.style.overflow = "hidden";
    } else {
      if (dialog.open) dialog.close();
      document.body.style.overflow = "";
    }

    // 모달이 열린 채로 이 컴포넌트가 사라져도 잠금이 남지 않도록 정리
    return () => {
      document.body.style.overflow = "";
    };
  }, [groupId]);

  // 열릴 때마다 그 그룹 내용을 받아온다
  useEffect(() => {
    if (groupId === null) return;
    let ignore = false; // 응답이 늦게 왔는데 이미 다른 카드를 열었다면 버린다

    const token = isLoggedIn ? getToken() : null;
    axios
      .get<GroupDetail>(
        `${API}/api/${groupApi}/${groupId}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      )
      .then((res) => {
        if (!ignore) setLoaded(res.data);
      })
      .catch(() => {
        if (!ignore)
          setFailed({
            id: groupId,
            message: "프로젝트 정보를 불러오지 못했어요.",
          });
      });

    return () => {
      ignore = true;
    };
  }, [groupId, groupApi, isLoggedIn, getToken]);

  async function handleDelete() {
    const token = getToken();
    if (!group || !token || !confirm("이 프로젝트를 삭제할까? (글은 남습니다)"))
      return;
    try {
      await axios.delete(`${API}/api/${groupApi}/${group.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onClose();
      onDeleted();
    } catch {
      setFailed({
        id: group.id,
        message: "삭제에 실패했어요. 권한을 확인해 주세요.",
      });
    }
  }

  return (
    <dialog
      ref={dialogRef}
      // overscroll-contain: 모달 안에서 끝까지 스크롤해도 그 힘이 뒤 페이지로 넘어가지 않는다
      className="fixed inset-0 m-auto max-h-[85vh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-black/40"
      onClose={onClose} // ESC로 닫아도 부모 상태가 같이 정리되도록
      onClick={(e) => {
        // 배경(dialog 자체)을 클릭했을 때만 닫는다. 내용은 div로 감싸져 있어 여기 안 걸린다.
        if (e.target === dialogRef.current) dialogRef.current.close();
      }}
    >
      <div className="p-6">
        {error && <p className="text-red-600">{error}</p>}
        {loading && <p className="text-slate-500">불러오는 중...</p>}

        {group && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                {group.published === false && (
                  <span className="mb-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    🔒 비공개
                  </span>
                )}
                <h2 className="text-2xl font-semibold tracking-tight">
                  {group.name}
                </h2>
                {group.period && (
                  <p className="mt-1 text-sm text-accent">{group.period}</p>
                )}
              </div>
              <button
                onClick={() => dialogRef.current?.close()}
                className="shrink-0 rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-500 hover:bg-slate-50"
              >
                닫기
              </button>
            </div>

            {/* 한 줄 설명은 제목에 딸린 문구라 구분선 없이 바로 아래 */}
            {group.summary && (
              <p className="mt-3 text-slate-600">{group.summary}</p>
            )}

            {group.thumbnailUrl && (
              // 카드와 같이 칸을 꽉 채워 보여준다(object-cover, 넘치는 부분은 잘림).
              // 다만 세로로 긴 사진은 칸 자체를 좁고 길게 바꿔서 덜 잘리게 한다.
              <div
                className={`relative mt-5 overflow-hidden rounded-xl bg-slate-100 ${
                  isPortrait ? "mx-auto h-96 w-72" : "h-72 w-full"
                }`}
              >
                <Image
                  src={group.thumbnailUrl}
                  alt={group.name}
                  fill
                  className="object-cover"
                  sizes={
                    isPortrait ? "288px" : "(max-width: 768px) 100vw, 672px"
                  }
                  // 실제 크기를 보고 세로 사진인지 판단한다 (미리 알 수 없으니 불러온 뒤에)
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    // img.src는 최적화된 /_next/image 주소라, 비교는 원본 주소로 해야 한다
                    setPortraitUrl(
                      img.naturalHeight > img.naturalWidth
                        ? group.thumbnailUrl
                        : null,
                    );
                  }}
                />
              </div>
            )}

            {/* 아래 덩어리들은 border-t로 구분선을 그어 내용이 섞여 보이지 않게 한다 */}

            {group.description && (
              <div className="mt-5 border-t border-accent/25 pt-5">
                <h3 className="text-sm font-semibold tracking-widest text-accent uppercase">
                  프로젝트 소개
                </h3>
                {/* 줄바꿈을 그대로 보여준다 (에디터가 아니라 그냥 긴 텍스트라서) */}
                <p className="mt-3 leading-8 whitespace-pre-line text-slate-600">
                  {group.description}
                </p>
              </div>
            )}

            {/* 프로젝트 등록/수정 때 적어둔 "내가 한 일" 글 */}
            {group.contribution && (
              <div className="mt-5 border-t border-accent/25 pt-5">
                <h3 className="text-sm font-semibold tracking-widest text-accent uppercase">
                  내가 한 일
                </h3>
                <p className="mt-3 leading-8 whitespace-pre-line text-slate-600">
                  {group.contribution}
                </p>
              </div>
            )}

            {/* 파트별 상세 글 — 눌러서 자세한 기록으로 들어간다 */}
            {group.posts.length > 0 && (
              <div className="mt-5 border-t border-accent/25 pt-5">
                <h3 className="text-sm font-semibold tracking-widest text-accent uppercase">
                  상세 기록
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/projects/${category}/${post.id}`}
                      className="rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-accent hover:text-accent"
                    >
                      <span className="block font-medium">
                        {post.part ?? "기타"}
                        {post.published === false && " 🔒"}
                      </span>
                      <span className="block text-sm text-slate-500">
                        {post.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 관리자 전용 */}
            {isLoggedIn && (
              <div className="mt-8 flex flex-wrap gap-2 border-t border-accent/25 pt-4">
                {/* ?groupId=를 달아 보내면 글쓰기 폼에서 소속이 미리 골라진다 */}
                <Link
                  href={`/projects/${category}/new?groupId=${group.id}`}
                  className="rounded bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover"
                >
                  ＋ 상세 글 추가
                </Link>
                <Link
                  href={`/projects/${category}/groups/${group.id}/edit`}
                  className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  프로젝트 수정
                </Link>
                <button
                  onClick={handleDelete}
                  className="rounded border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
