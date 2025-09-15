// DescriptionEditor.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import "../CourseForm.css";


interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function DescriptionEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value]);

  return (
    
  <div className="editor-wrapper-offset">
    <div className="editor-container">
      <div className="editor-toolbar">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive("bold") ? "active" : ""}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={editor?.isActive("bulletList") ? "active" : ""}
        >
          •
        </button>
      </div>
      <div className="editor-box">
        <EditorContent editor={editor} />
      </div>
    </div>
    </div>
  );
}
