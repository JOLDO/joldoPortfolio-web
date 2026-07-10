"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { EditorView } from "@tiptap/pm/view";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import axios from "axios";
import { useRef } from "react";
import { API } from "@/app/apiBase";

type Props = {
  token: string;
  onChange: (json: string) => void; //onChange는 변경만 하지 반환값이 없음
  initialContent?: string;
};

function parseContent(content?: string) {
  if (!content) return "";
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

export default function TiptapEditor({
  token,
  onChange,
  initialContent,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 이미지 파일을 백엔드에 업로드하고 주소(URL)를 받아오는 함수
  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData(); // 파일 전송 전용 특수 주머니
    formData.append("file", file); // @RequestParam("file") 이름 매칭

    const res = await axios.post(`${API}/api/images`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.url; // 서버 하드디스크에 저장 완료된 진짜 주소 리턴
  }

  // 2. [가독성 치트키] 에디터의 특정 위치(pos)에 이미지를 쏙 박아주는 심부름꾼 함수
  function insertImageToPos(view: EditorView, pos: number, url: string) {
    //ProseMirror에디터 엔진은 HTML 문자열이 아닌 노드들로 구조를 이룬다.
    const node = view.state.schema.nodes.image.create({ src: url });
    //view:에디터뷰, state:에디터의 현재상태, schema:어떤노드가 가능한지에 대한 규칙, nodes:노드종류 목록, image:이미지 타입, create({ src: url }):url을 가진 이미지 노드 생성
    //schema.nodes.image:스키마 규칙의 노드 목록중 이미지타입을 만듦
    view.dispatch(view.state.tr.insert(pos, node));
    //dispatch:적용, state:현재 상태, tr(transaction): 지시사항, insert(pos, node): pos에 node를 삽입
    //tr.insert: 삽입을 지시
  }

  const editor = useEditor({
    extensions: [StarterKit, Image], //사용할 기능
    content: parseContent(initialContent), //시작 내용
    immediatelyRender: false, //Next.js 대응
    onUpdate: ({ editor }) => onChange(JSON.stringify(editor.getJSON())), //바뀌면 부모의 onChange로 전달 //json형식을 string으로 바꾸는데 내용은 문서 전체의 내용+서식+이미지+구조 가 들어있다

    editorProps: {
      //handleDrop, handlePaste, handleKeyDown, handleClick, handleClickOn, handleDoubleClick, handleTextInput등의 이벤트 핸들러를 넣어줌
      // 이미지 파일을 에디터 안 원하는 위치로 "드래그" 했을 때
      handleDrop(view, event, _slice, moved) {
        //언더바가 붙은 매게변수는 사용하지 않는다는 표시
        const files = event.dataTransfer?.files; //event:드롭이벤트, dataTransfer:옮겨진 데이터들, files: 데이터중 파일 목록
        const isImage = files?.[0]?.type.startsWith("image/"); //파일 목록중 처음이 이미지인지(파일 하나씩만 끌어넣게 하려고)

        if (!moved && files && files.length && isImage) {
          //!moved:에디터 내부에서의 이동이 아닐때(외부에서 끌어온건지 확인) + 존재하는 파일 + 이미지파일인지
          event.preventDefault(); //브라우저 기본 기능 막고 직접제어(기본은 새탭에서 열어버림)

          // 드롭한 마우스 좌표를 에디터 글자 위치(pos)로 변환
          //드롭한 마우스 좌표는 화면 픽셀좌표인데 그 좌표가 어느 글자 위치(2문단 22번째글자)인지
          const coords = view.posAtCoords({
            left: event.clientX, //마우스 가로 픽셀위치
            top: event.clientY, //마우스 세로 픽셀위치
          });
          const pos = coords?.pos ?? view.state.selection.from; //coords.pos는 픽셀 -> 문서 위치 ?? view.state.selection.from는 현재 커서 위치

          // 이미지 업로드가 완료되면(then) -> 지정된 위치에 이미지 삽입 순차 실행!
          uploadImage(files[0]).then((url) => {
            insertImageToPos(view, pos, url); //이미지를 서버에 저장 후, pos위치에 표시
          });

          return true; // 에디터한테 "드롭 처리는 내가 완료했음!" 하고 알림
        }
        return false;
      },
      // 이미지를 "붙여넣기(Ctrl+V)" 했을 때
      handlePaste(view, event) {
        const files = event.clipboardData?.files; //event:붙여넣기이벤트, clipboardData:클립보드의 데이터들, files:데이터중 파일 목록
        const isImage = files?.[0]?.type.startsWith("image/");

        if (files && files.length && isImage) {
          event.preventDefault();

          const pos = view.state.selection.from; // 현재 커서 위치

          // 이미지 업로드가 완료되면(then) -> 커서 위치에 이미지 삽입 순차 실행!
          uploadImage(files[0]).then((url) => {
            insertImageToPos(view, pos, url);
          });

          return true; // 에디터한테 "붙여넣기 처리는 내가 완료했음!" 하고 알림
        }
        return false;
      },
    },
  });

  // 툴바의 "🖼 이미지" 버튼으로 파일 직접 선택했을 때
  async function handlePickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; //선택한 파일
    if (!file || !editor) return;

    const url = await uploadImage(file); //파일 서버에 올리고
    // 이미지 + 뒤에 문단을 함께 삽입 → 커서가 이미지 다음 줄로 이동.
    // (이미지만 넣으면 그 이미지가 '선택된 상태'로 남아, 다음 삽입이 교체돼버림)
    editor
      .chain()
      .focus() //에디터에 포커스를 주는(커서를 에디터 안으로 되돌리는) 것
      .insertContent([
        //순서대로 삽입
        { type: "image", attrs: { src: url } }, //이미지 노드
        { type: "paragraph" }, //문단(이미지이후에 한줄 넣어줌)
      ])
      .run();
    e.target.value = ""; // 같은 파일 연속 선택 가능하도록 초기화(onchange가 발동하기 위해선 값이 변해야 함)
  }

  if (!editor) return null;

  const btn =
    "rounded px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800";

  return (
    <div className="rounded border border-zinc-300 dark:border-zinc-700">
      {/* 툴바 영역 */}
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 p-2 dark:border-zinc-800">
        <button
          type="button"
          className={btn}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </button>
        <button
          type="button"
          className={btn}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • 목록
        </button>

        {/* 이미지 커스텀 버튼 (클릭 시 숨겨진 input 활성화) */}
        <button
          type="button"
          className={btn}
          onClick={() => fileInputRef.current?.click()}
        >
          🖼 이미지
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handlePickImage}
        />
      </div>

      {/* 실제 텍스트가 타이핑되는 에디터 본문 (스타일은 globals.css의 .tiptap-content) */}
      <EditorContent
        editor={editor}
        className="tiptap-content tiptap-editable p-3"
      />
    </div>
  );
}
