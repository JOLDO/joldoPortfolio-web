"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

// 저장된 content(TipTap JSON 문자열)를 파싱. 예전 textarea로 만든 평문이면 그대로 사용.
function parseContent(content: string) {
  if (!content) return "";
  try {
    return JSON.parse(content);
  } catch {
    return content; // JSON이 아니면 평문으로 렌더링
  }
}

export default function ContentViewer({ content }: { content: string }) {
  const editor = useEditor({
    editable: false, // 읽기전용 (편집 불가)
    extensions: [StarterKit, Image],
    content: parseContent(content),
    immediatelyRender: false,
  });

  if (!editor) return null;

  // 스타일은 globals.css의 .tiptap-content 로 통합됨
  return <EditorContent editor={editor} className="tiptap-content" />;
}