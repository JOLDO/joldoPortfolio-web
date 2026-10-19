/**
 * 기술 스택 데이터.
 * level = 숙련도. 카드 안 항목의 왼쪽 선 색으로 표시된다.
 *   상   — 스스로 설계하고 문제까지 해결할 수 있는 수준
 *   보통 — 실무에서 맡아 개발·유지보수한 수준
 *   경험 — 프로젝트에서 써 본 수준
 * detail = 어디서 어떻게 썼는지. 근거가 있어야 숙련도가 설득력을 갖는다.
 */
export type Level = "상" | "보통" | "경험";

export type Skill = {
  name: string;
  level: Level;
  detail: string;
};

export const SKILL_GROUPS: { title: string; skills: Skill[] }[] = [
  {
    title: "서버",
    skills: [
      {
        name: "Java",
        level: "보통",
        detail: "팀 프로젝트 : Spring Boot 서버 개발에 사용",
      },
      {
        name: "Spring Boot",
        level: "보통",
        detail:
          "팀 프로젝트 : 팀 프로젝트 서버 개발\n                      (도서관 웹, 여행 앱, 숙소 대여 서비스)",
      },
      {
        name: "Swagger UI",
        level: "보통",
        detail: "론픽 · 팀 프로젝트 : API 테스트",
      },
      {
        name: "JWT",
        level: "경험",
        detail:
          "팀 프로젝트 : Spring Security 기반\n                      Access·Refresh 토큰 인증 처리",
      },
      {
        name: "PHP",
        level: "경험",
        detail: "론픽 : 운영 중인 서버 스크립트 확인·수정",
      },
    ],
  },
  {
    title: "앱",
    skills: [
      {
        name: "Android (Kotlin · Java)",
        level: "보통",
        detail:
          "장비 탑재형 안드로이드 앱 6년\nJava (약 2년)\n   - C# WinForm -> Android 마이그레이션\n   - Service로 USB 시리얼 통신 분리\n   - BroadcastReceiver로 장치 연결 감지\nKotlin (약 4년)\n   - Java 앱을 Kotlin·MVVM 구조로 전환\n   - Coroutines·StateFlow 비동기 처리\n   - Jetpack(ViewModel, LiveData,\n      ViewBinding·DataBinding, Lifecycle)\n   - 외부 장비(트레드밀)와 시리얼 통신 및 UI 개발",
      },
      {
        name: "MVVM",
        level: "보통",
        detail:
          "론픽 : Kotlin 전환 시 팀 아키텍처로 도입\n          ViewModel과 StateFlow로 화면 상태 관리",
      },
      {
        name: "Hilt",
        level: "보통",
        detail:
          "론픽 : 인터페이스 구현체는 @Binds,\n          외부 라이브러리는 @Provides로 의존성 주입",
      },
      {
        name: "Room (SQLite)",
        level: "보통",
        detail:
          "론픽 : 의료인증 대응 데이터 암호화 저장,\n          행 단위 전자서명 무결성 검증",
      },
      {
        name: "Flutter",
        level: "경험",
        detail: "팀 프로젝트 : 앱 개발 (여행 앱, 숙소 대여 앱)",
      },
    ],
  },
  {
    title: "웹",
    skills: [
      { name: "React", level: "경험", detail: "팀 프로젝트 : 웹 개발" },
      {
        // TODO: 이 포트폴리오를 만들며 쓴 기술입니다. 빼고 싶으면 이 항목만 지우세요.
        name: "TypeScript · Next.js",
        level: "경험",
        detail: "웹 포트폴리오 : 사이트 개발",
      },
      { name: "HTML", level: "경험", detail: "AJAX 및 기본" },
      {
        name: "Thymeleaf",
        level: "경험",
        detail: "팀 프로젝트 : 1차 프로젝트 개발",
      },
      {
        name: "Bootstrap",
        level: "경험",
        detail: "팀 프로젝트 : 1차 프로젝트 개발",
      },
    ],
  },
  {
    // C# WinForm은 PC에서 도는 데스크톱 프로그램, 아두이노·라즈베리파이는
    // 보드 위에서 도는 임베디드. 성격이 달라서 제목에 둘 다 적는다.
    title: "데스크톱 · 하드웨어",
    skills: [
      {
        name: "C# WinForm",
        level: "보통",
        detail:
          "론픽 : 장비 프로그램 개발·유지보수,\n          외부 장비(ACCUNIQ) 연동 UI",
      },
      {
        name: "Arduino",
        level: "경험",
        detail: "센서 컨트롤, LCD 연결, 모터 제어 테스트",
      },
      {
        name: "라즈베리파이",
        level: "경험",
        detail: "Android Things로 안드로이드 OS 설치·구동",
      },
    ],
  },
  {
    title: "데이터 · 도구",
    skills: [
      {
        name: "MariaDB",
        level: "보통",
        detail: "팀 프로젝트 : 데이터베이스로 사용",
      },
      {
        name: "MySQL",
        level: "보통",
        detail: "론픽 : 테이블 설계·쿼리 작성 및 유지보수",
      },
      {
        name: "Git",
        level: "보통",
        detail: "론픽 : 버전 관리\n웹 포트폴리오 : GitHub Actions CI",
      },
      {
        name: "Postman",
        level: "보통",
        detail: "론픽 · 팀 프로젝트 : API 테스트",
      },
      {
        name: "Docker",
        level: "경험",
        detail: "팀 프로젝트 : MariaDB 서버 구성",
      },
      {
        name: "Python",
        level: "경험",
        detail:
          "팀 프로젝트 : 웹 크롤링(Selenium),\n                      RAG·벡터 검색(임베딩, 유사도 검색)\n학습 : 데이터 처리·시각화(pandas, matplotlib)",
      },
    ],
  },
];

/** 숙련도별 색. 왼쪽 선(border)과 배지에 같은 계열을 쓴다. */
export const LEVEL_STYLE: Record<Level, { bar: string; badge: string }> = {
  상: {
    bar: "border-l-accent",
    badge: "bg-accent text-white",
  },
  보통: {
    bar: "border-l-accent/45",
    badge: "bg-accent-soft text-accent-hover",
  },
  경험: {
    bar: "border-l-slate-300",
    badge: "bg-slate-100 text-slate-500",
  },
};
