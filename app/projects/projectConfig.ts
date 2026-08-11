// 프로젝트 카테고리 3종을 한 곳에서 관리.
// label = 화면에 보일 이름, api = 백엔드 엔드포인트 경로(/api/{api}).
// 팀은 기존 /api/team-projects 그대로 → 안 깨짐. 개인/회사는 Spring에 추가 필요.

export type Category = "team" | "personal" | "company";

// api = 글 엔드포인트(/api/{api}), groupApi = 글을 묶는 프로젝트 그룹 엔드포인트(/api/{groupApi}).
// 그룹 = 팀의 "1차/2차/3차", 회사의 "미플/모듈" 같은 묶음.
export const CATEGORIES: Record<
  Category,
  { label: string; api: string; groupApi: string }
> = {
  team: { label: "팀 프로젝트", api: "team-projects", groupApi: "team-groups" },
  personal: {
    label: "개인 프로젝트",
    api: "personal-projects",
    groupApi: "personal-groups",
  },
  company: {
    label: "회사 프로젝트",
    api: "company-projects",
    groupApi: "company-groups",
  },
};

// 글을 작성할 때 고를 수 있는 파트. 직접 입력도 되도록 datalist 제안값으로만 쓴다.
export const PART_SUGGESTIONS = ["웹", "앱", "서버", "기획", "디자인"];

// 메인 화면 버튼 순서용
export const CATEGORY_ORDER: Category[] = ["team", "personal", "company"];

// URL로 들어온 문자열이 유효한 카테고리인지 확인 (타입 가드)
export function isCategory(value: string | undefined): value is Category {
  return value === "team" || value === "personal" || value === "company";
}
