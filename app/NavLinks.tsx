"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import { API } from "@/app/apiBase";

// 네비에 보일 섹션들. id는 page.tsx의 <section id="..."> 와 같아야 한다.
const SECTIONS = [
  { id: "about", label: "소개" },
  { id: "career", label: "경력", onlyWide: true }, // 좁은 화면에선 숨김
  { id: "skills", label: "기술" },
  { id: "projects", label: "프로젝트" },
  { id: "certificates", label: "자격증", onlyWide: true },
  { id: "contact", label: "연락처" },
];

export default function NavLinks() {
  const { isLoggedIn } = useAuth();
  // 지금 보고 있는 섹션 id (없으면 빈 문자열)
  const [active, setActive] = useState("");
  const [hasCertificates, setHasCertificates] = useState(false);

  // 자격증 섹션이 나오는 조건과 똑같이 맞춘다 (CertificatesSection 참고).
  // 로그인했으면 등록하러 가야 하니 항상, 아니면 등록된 게 있을 때만.
  const showCertificates = isLoggedIn || hasCertificates;

  const sections = useMemo(
    () =>
      SECTIONS.filter(({ id }) => id !== "certificates" || showCertificates),
    [showCertificates],
  );

  useEffect(() => {
    let ignore = false;
    axios
      .get<unknown[]>(`${API}/api/certificates`)
      .then((res) => {
        if (!ignore) setHasCertificates(res.data.length > 0);
      })
      .catch(console.error);
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    // 화면 위에서 40% 지점에 가상의 기준선을 하나 긋고, 그 선을 품고 있는 섹션을
    // "지금 보고 있는 섹션"으로 본다. 섹션들이 빈틈없이 이어져 있으므로 항상 하나만 걸린다.
    //
    // 예전에는 IntersectionObserver로 "얇은 띠에 들어오는 순간"만 잡았는데,
    // 위로 스크롤할 때 경계에서 두 섹션의 이벤트가 한 번에 몰리면 가운데 것이 씹혀서
    // 프로젝트를 건너뛰고 기술이 켜지는 일이 있었다. 위치로 직접 재면 그런 일이 없다.
    function update() {
      const line = window.innerHeight * 0.4;
      let current = "";

      // 기준선을 이미 지나쳐 올라간 섹션들 중 마지막 것 = 지금 보고 있는 섹션
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = id;
      }

      // 마지막 섹션(연락처)은 짧아서 페이지를 끝까지 내려도 기준선까지 못 올라온다.
      // 그래서 바닥 근처(화면 높이의 20% 남았을 때)부터 미리 마지막 섹션을 켜준다.
      const slack = window.innerHeight * 0.1;
      const nearBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - slack;
      if (nearBottom && sections.length > 0) {
        current = sections[sections.length - 1].id;
      }

      setActive(current); // 히어로처럼 id 없는 곳에 있으면 빈 문자열 → 아무것도 강조 안 함
    }

    // 첫 계산은 다음 프레임에 (렌더가 끝난 뒤 위치를 재야 정확하다)
    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
    // 자격증 섹션이 생기거나 사라지면 목록이 바뀌므로 다시 건다
  }, [sections]);

  return (
    <>
      {sections.map(({ id, label, onlyWide }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => {
            // 기본 동작(#이동)은 히스토리에 항목을 하나씩 쌓아서, 다른 페이지에 갔다
            // 돌아올 때 뒤로가기를 두 번 눌러야 한다. 직접 스크롤하고 주소만 갈아끼운다.
            e.preventDefault();
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            history.replaceState(null, "", `#${id}`);
          }}
          className={[
            "transition-colors",
            onlyWide ? "hidden sm:inline" : "",
            active === id
              ? "font-semibold text-accent-hover" // 현재 섹션: 더 굵고 더 진하게
              : "hover:text-accent",
          ].join(" ")}
        >
          {label}
        </a>
      ))}
    </>
  );
}
