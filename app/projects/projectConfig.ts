// 프로젝트 카테고리 3종을 한 곳에서 관리.
// label = 화면에 보일 이름, api = 백엔드 엔드포인트 경로(/api/{api}).
// 팀은 기존 /api/team-projects 그대로 → 안 깨짐. 개인/회사는 Spring에 추가 필요.

export type Category = "team" | "personal" | "company";

export const CATEGORIES: Record<Category, { label: string; api: string }> = {
  team: { label: "팀 프로젝트", api: "team-projects" },
  personal: { label: "개인 프로젝트", api: "personal-projects" },
  company: { label: "회사 프로젝트", api: "company-projects" },
};

// 메인 화면 버튼 순서용
export const CATEGORY_ORDER: Category[] = ["team", "personal", "company"];

// URL로 들어온 문자열이 유효한 카테고리인지 확인 (타입 가드)
export function isCategory(value: string | undefined): value is Category {
  return value === "team" || value === "personal" || value === "company";
}
