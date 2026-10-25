import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Underline, Heading2, List, ListOrdered, Undo2, Redo2, RemoveFormatting } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { jobDescriptionHtml } from "@/lib/job-description";
import { jobDescriptionClasses } from "@/components/JobDescription";

export default function JobDescriptionEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: false })],
    content: jobDescriptionHtml(value),
    editorProps: { attributes: { role: "textbox", "aria-label": "Job description", "aria-multiline": "true", class: `${jobDescriptionClasses} min-h-40 max-h-72 overflow-y-auto p-3 outline-none text-foreground` } },
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? "" : current.getHTML()),
  });

  useEffect(() => {
    if (editor && jobDescriptionHtml(value) !== editor.getHTML()) {
      editor.commands.setContent(jobDescriptionHtml(value), { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;
  const tools = [
    { label: "Bold", icon: Bold, active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Underline", icon: Underline, active: editor.isActive("underline"), run: () => editor.chain().focus().toggleUnderline().run() },
    { label: "Heading", icon: Heading2, active: editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Bulleted list", icon: List, active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: ListOrdered, active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Clear formatting", icon: RemoveFormatting, run: () => editor.chain().focus().unsetAllMarks().clearNodes().run() },
    { label: "Undo", icon: Undo2, disabled: !editor.can().undo(), run: () => editor.chain().focus().undo().run() },
    { label: "Redo", icon: Redo2, disabled: !editor.can().redo(), run: () => editor.chain().focus().redo().run() },
  ];

  return <div className="rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
    <TooltipProvider delayDuration={200}>
      <div role="toolbar" aria-label="Description formatting" className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-2">
        {tools.map(({ label, icon: Icon, active, disabled, run }) => <Tooltip key={label}>
          <TooltipTrigger asChild><Button type="button" size="icon" variant={active ? "secondary" : "ghost"} className="h-8 w-8" aria-label={label} aria-pressed={active} disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={run}><Icon className="h-4 w-4" /></Button></TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>)}
      </div>
    </TooltipProvider>
    <EditorContent editor={editor} />
  </div>;
}