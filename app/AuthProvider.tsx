"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import axios from "axios";

type Auth = {
  //interface로 써도됨
  isLoggedIn: boolean;
  getToken: () => string | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<Auth | null>(null); //provider로 사용하기 위해서 createContext로 객체를 담을수 있게 만들고 초기값 null을 넣음

export function AuthProvider({
  children, //layout.tsx에 AuthProvider 내부의 값이 children : <ViewTransition default="page-fade-slide">{children}</ViewTransition>
  initialLoggedIn = false,
}: {
  children: ReactNode;
  initialLoggedIn?: boolean;
}) {
  // 로그인 여부(플래그)만 상태로 관리 (서버 쿠키 값으로 초기화)
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);

  // 필요할 때만 로컬 스토리지 직접 조회 (리렌더링 유발 방지), 최초 렌더시 한번 만들고 재사용
  const getToken = useCallback(() => localStorage.getItem("token"), []);

  // 로그인 처리, 최초 렌더시 한번 만들고 재사용
  const login = useCallback((token: string) => {
    localStorage.setItem("token", token);
    document.cookie = "loggedIn=1; path=/; max-age=3600; SameSite=Lax";
    setIsLoggedIn(true);
  }, []);

  // 로그아웃 처리
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    document.cookie = "loggedIn=; path=/; max-age=0; SameSite=Lax";
    setIsLoggedIn(false);
  }, []);

  // 토큰 만료 가로채기 (401, 403 에러 발생 시 자동 로그아웃)
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (res) => res,
      (error) => {
        const status = error.response?.status;
        // 헤더에 인증 정보가 실려 나갔었는지 깔끔하게 확인
        const hasAuth =
          error.config?.headers?.Authorization ||
          error.config?.headers?.authorization;

        if ((status === 401 || status === 403) && hasAuth) {
          logout();
          // 토큰 만료 → 메인으로 (전체 리로드로 편집 모드 등 상태 초기화)
          if (window.location.pathname !== "/") {
            window.location.href = "/";
          }
        }
        return Promise.reject(error); //실패 했다고 알림
      },
    );

    return () => axios.interceptors.response.eject(interceptorId); //메모리에서 인터셉터 제거, 클린업 함수
  }, [logout]);

  return (
    /* null인 AuthContext에 Auth를 넣어서 provider로 제공 */
    <AuthContext.Provider value={{ isLoggedIn, getToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  //AuthContext.Provider에서 제공 하는 { isLoggedIn, getToken, login, logout }을 사용하기 위해 외부에서 사용할수 있게 context 반환
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 안에서만 쓸 수 있어요");
  return ctx;
}
