"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import { API } from "@/app/apiBase";

export default function LoginBox() {
  const { isLoggedIn, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDialogElement>(null); //다이얼로그 요소타입의 변수

  // 이펙트 안에서는 오직 대화상자 open/close 상태만 '동기화' 해준다 (useState 호출 금지)
  useEffect(() => {
    const dialog = dialogRef.current; //다이얼로그 객체를 변수에 담음
    if (!dialog) return; //다이얼로그가 없다면

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [open]); //open의 상태가 달라질때마다 useEffect를 실행

  // 모달이 실제로 닫힐 때 실행될 핸들러 (ESC, close() 등 모든 닫기 상황 대응)
  function handleClose() {
    setOpen(false);
    setUsername("");
    setPassword("");
    setError(null);
  }

  async function handleLogin() {
    setError(null);
    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        username,
        password,
      });
      login(res.data.token); // 토큰·쿠키 저장 + 로그인 상태 갱신 (Provider가 처리)
      setOpen(false); // 여기서 open을 false로 바꾸면 이펙트가 알아서 dialog.close()를 실행함
    } catch {
      setError("로그인 실패 (아이디/비번 확인)");
    }
  }

  function handleLogout() {
    logout(); // 토큰·쿠키 삭제 + 로그인 상태 갱신 (Provider가 처리)
  }

  return (
    <>
      <button
        className="min-w-[96px] rounded-full border border-zinc-300 px-4 py-2 text-center text-sm dark:border-zinc-700"
        onClick={isLoggedIn ? handleLogout : () => setOpen(true)}
      >
        {isLoggedIn ? "로그아웃" : "로그인"}
      </button>

      <dialog
        ref={dialogRef} //ref로 등록하면서 dialogRef는 다이얼로그 객체가 됨
        className="fixed inset-0 m-auto h-fit w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-0 shadow-xl backdrop:bg-black/40 dark:border-zinc-800 dark:bg-zinc-900"
        onClose={handleClose} // 브라우저에 의해 dialog가 닫히면 여기서 안전하게 상태 초기화!
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close(); //다이얼로그는 카드내용이고, 어두운 배경은 backdrop인데 이거는 타겟이 될수없어서 dialog가 타겟이 됨. 카드 내용은 div로 감쌌기 때문에 div로 나와서 이렇게함
        }}
      >
        {/* 패딩은 안쪽 div로: 바깥 여백 클릭 시 닫히는 문제 방지 */}
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-black dark:text-zinc-50">
            관리자 로그인
          </h2>

          <form
            className="flex flex-col gap-3"
            autoComplete="off" //브라우저의 자동채움, 자동완성 사용x
            onSubmit={(e) => {
              e.preventDefault(); //submit을 하면 기본적으로 새로고침또는 주소이동이 기본 동작이라서 기본동작을 막고 내가 원하는 동작을 하게 함, 대신 form을 사용하면 엔터를 치면 제출이되기 때문에 사용했음
              handleLogin();
            }}
          >
            <input
              className="rounded border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디"
              autoFocus
            />
            <input
              className="rounded border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete="new-password" //autoComplete=off으로 자동채움이 안막히는 경우가 있어서 새 비번입력칸이라고 명시해 자동채움을 막기 위해서
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="mt-1 flex justify-end gap-2">
              <button
                type="button"
                className="rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
                onClick={() => dialogRef.current?.close()} // 직접 close()를 때려도 onClose가 실행됨
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
              >
                로그인
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
