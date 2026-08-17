"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import SectionLabel from "./SectionLabel";
import { API } from "@/app/apiBase";

type Certificate = {
  id: number;
  name: string;
  issuer: string | null;
  acquiredDate: string | null;
};

/**
 * 05 자격증 섹션.
 * 방문자에게는 카드 목록만 보이고, 로그인(관리자)하면 등록·수정·삭제 버튼이 붙는다.
 * 입력 항목이 셋뿐이라 별도 페이지 대신 모달 폼 하나로 등록과 수정을 같이 처리한다.
 */
export default function CertificatesSection() {
  const { isLoggedIn, getToken } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // 폼 상태 — editingId가 null이면 새로 등록, 값이 있으면 그 자격증 수정
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [acquiredDate, setAcquiredDate] = useState("");
  const [busy, setBusy] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const fetchCertificates = useCallback(() => {
    return axios
      .get<Certificate[]>(`${API}/api/certificates`)
      .then((res) => res.data);
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchCertificates()
      .then((data) => {
        if (!ignore) setCertificates(data);
      })
      .catch(console.error);
    return () => {
      ignore = true;
    };
  }, [fetchCertificates]);

  // formOpen 상태에 맞춰 모달을 열고 닫는다 (LoginBox와 같은 방식)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (formOpen) {
      if (!dialog.open) dialog.showModal();
      // 모달이 떠 있는 동안 뒤 페이지는 스크롤되지 않게 잠근다
      document.body.style.overflow = "hidden";
    } else {
      if (dialog.open) dialog.close();
      document.body.style.overflow = "";
    }

    // 열린 채로 화면을 벗어나도 잠금이 남지 않도록 정리
    return () => {
      document.body.style.overflow = "";
    };
  }, [formOpen]);

  function openForm(certificate: Certificate | null) {
    setEditingId(certificate?.id ?? null);
    setName(certificate?.name ?? "");
    setIssuer(certificate?.issuer ?? "");
    setAcquiredDate(certificate?.acquiredDate ?? "");
    setFormOpen(true);
  }

  async function handleSave() {
    const token = getToken();
    if (!token || !name) return;
    setBusy(true);
    try {
      const body = { name, issuer, acquiredDate };
      const headers = { Authorization: `Bearer ${token}` };
      // 수정이면 PUT, 새로 등록이면 POST
      if (editingId === null) {
        await axios.post(`${API}/api/certificates`, body, { headers });
      } else {
        await axios.put(`${API}/api/certificates/${editingId}`, body, {
          headers,
        });
      }
      setFormOpen(false);
      setCertificates(await fetchCertificates());
    } catch {
      alert("저장에 실패했어. 로그인 상태를 확인해 봐.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    const token = getToken();
    if (!token || !confirm("이 자격증을 삭제할까?")) return;
    try {
      await axios.delete(`${API}/api/certificates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCertificates(await fetchCertificates());
    } catch {
      alert("삭제에 실패했어. 권한을 확인해 봐.");
    }
  }

  // 방문자에게는 등록된 자격증이 하나도 없으면 섹션 자체를 안 보여준다.
  // (관리자는 등록해야 하니 항상 보인다)
  if (!isLoggedIn && certificates.length === 0) return null;

  return (
    <section
      id="certificates"
      className="scroll-mt-20 border-t border-slate-200 py-20"
    >
      <SectionLabel en="Certificates" />
      <h2 className="mt-4 text-3xl font-semibold tracking-tight">자격증</h2>

      {isLoggedIn && (
        <div className="mt-8">
          <button
            onClick={() => openForm(null)}
            className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium hover:border-accent hover:text-accent"
          >
            ＋ 자격증 등록
          </button>
        </div>
      )}

      {certificates.length === 0 ? (
        <p className="mt-8 text-slate-500">아직 등록된 자격증이 없어요.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {certificates.map((certificate) => (
            <li
              key={certificate.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <h3 className="font-semibold">{certificate.name}</h3>
                {certificate.issuer && (
                  <p className="mt-1 text-sm text-slate-600">
                    {certificate.issuer}
                  </p>
                )}
                {isLoggedIn && (
                  <div className="mt-3 flex gap-3 text-sm">
                    <button
                      onClick={() => openForm(certificate)}
                      className="text-slate-500 hover:text-accent"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(certificate.id)}
                      className="text-red-600 hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
              {certificate.acquiredDate && (
                <p className="shrink-0 text-sm font-medium text-accent tabular-nums">
                  {certificate.acquiredDate}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 등록·수정 폼 (관리자 전용) */}
      <dialog
        ref={dialogRef}
        className="fixed inset-0 m-auto h-fit max-h-[85vh] w-full max-w-sm overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-black/40"
        onClose={() => setFormOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <div className="flex flex-col gap-3 p-6">
          <h3 className="text-lg font-semibold">
            {editingId === null ? "자격증 등록" : "자격증 수정"}
          </h3>
          <input
            className="rounded border border-slate-300 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="자격증 이름 (예: 정보처리기사)"
          />
          <input
            className="rounded border border-slate-300 px-3 py-2"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="발급기관 (예: 한국산업인력공단)"
          />
          <input
            className="rounded border border-slate-300 px-3 py-2"
            value={acquiredDate}
            onChange={(e) => setAcquiredDate(e.target.value)}
            placeholder="취득일 (예: 2018.08)"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setFormOpen(false)}
              className="rounded border border-slate-300 px-4 py-2 text-sm"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={busy || !name}
              className="rounded bg-accent px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {busy ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
