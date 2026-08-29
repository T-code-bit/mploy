import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = { value: string; onChange: (html: string) => void };

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value.trim());
    return (url.protocol === "http:" || url.protocol === "https:") && !/\s/.test(value);
  } catch { return false; }
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character] ?? character));

export default function RichEmailEditor({ value, onChange }: Props) {
  const editor = useRef<HTMLDivElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value;
  }, [value]);

  const command = (name: string, argument?: string) => {
    editor.current?.focus();
    document.execCommand(name, false, argument);
    onChange(editor.current?.innerHTML ?? "");
  };
  const pastePlainText = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    // Do not carry arbitrary pasted markup into an email. Line breaks remain
    // readable while the editor's own formatting controls stay available.
    command("insertText", text);
  };
  const addLink = () => {
    if (!linkTitle.trim() || !isHttpUrl(linkUrl)) {
      setError("Enter link text and a valid http(s) URL.");
      return;
    }
    const title = escapeHtml(linkTitle.trim()), url = escapeHtml(linkUrl.trim());
    command("insertHTML", `<a href="${url}" title="${title}" target="_blank" rel="noopener noreferrer">${title}</a>`);
    setLinkOpen(false); setLinkTitle(""); setLinkUrl(""); setError("");
  };
  const addImage = () => {
    if (!isHttpUrl(imageUrl)) { setError("Enter a valid http(s) image URL."); return; }
    command("insertHTML", `<img src="${escapeHtml(imageUrl.trim())}" alt="" style="max-width:100%;height:auto;border-radius:8px" />`);
    setImageOpen(false); setImageUrl(""); setError("");
  };
  const tool = (label: string, action: () => void, title = label) => (
    <Button key={title} type="button" variant="outline" size="sm" className="h-8 min-w-8 px-2 font-serif" title={title} onMouseDown={(e) => e.preventDefault()} onClick={action}>{label}</Button>
  );

  return <div className="space-y-2">
    <div className="flex flex-wrap gap-1 rounded-xl border bg-muted/40 p-2">
      {tool("B", () => command("bold"), "Bold")}
      {tool("I", () => command("italic"), "Italic")}
      {tool("U", () => command("underline"), "Underline")}
      {tool("S", () => command("strikeThrough"), "Strike through")}
      {tool("H1", () => command("formatBlock", "h1"), "Heading 1")}
      {tool("H2", () => command("formatBlock", "h2"), "Heading 2")}
      {tool("❝", () => command("formatBlock", "blockquote"), "Quote")}
      {tool("•", () => command("insertUnorderedList"), "Bulleted list")}
      {tool("1.", () => command("insertOrderedList"), "Numbered list")}
      {tool("≡", () => command("justifyLeft"), "Align left")}
      {tool("≣", () => command("justifyCenter"), "Align center")}
      {tool("≡", () => command("justifyRight"), "Align right")}
      <label className="flex h-8 items-center gap-1 rounded-md border bg-background px-2 text-xs" title="Text color">A <input aria-label="Text color" type="color" className="h-5 w-5 border-0 p-0" onChange={(e) => command("foreColor", e.target.value)} /></label>
      <label className="flex h-8 items-center gap-1 rounded-md border bg-background px-2 text-xs" title="Highlight color">▰ <input aria-label="Highlight color" type="color" className="h-5 w-5 border-0 p-0" defaultValue="#fef08a" onChange={(e) => command("hiliteColor", e.target.value)} /></label>
      {tool("Link", () => { setError(""); setLinkOpen(true); }, "Insert link")}
      {tool("Image", () => { setError(""); setImageOpen(true); }, "Insert image")}
      {tool("Clear", () => command("removeFormat"), "Clear formatting")}
    </div>
    <div ref={editor} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true"
      className="min-h-64 rounded-xl border bg-background p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      data-placeholder="Write your message…" onPaste={pastePlainText} onInput={() => onChange(editor.current?.innerHTML ?? "")} />
    <p className="text-xs text-muted-foreground">Formatting is preserved in the delivered email. Only public http(s) links and images are accepted.</p>
    <Dialog open={linkOpen} onOpenChange={setLinkOpen}><DialogContent><DialogHeader><DialogTitle>Insert link</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>Link title</Label><Input value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} /></div><div><Label>URL</Label><Input placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} /></div>{error && <p className="text-sm text-destructive">{error}</p>}</div><DialogFooter><Button variant="outline" onClick={() => setLinkOpen(false)}>Cancel</Button><Button onClick={addLink}>Insert link</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={imageOpen} onOpenChange={setImageOpen}><DialogContent><DialogHeader><DialogTitle>Insert image</DialogTitle></DialogHeader><div className="space-y-3"><Label>Image URL</Label><Input placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />{error && <p className="text-sm text-destructive">{error}</p>}</div><DialogFooter><Button variant="outline" onClick={() => setImageOpen(false)}>Cancel</Button><Button onClick={addImage}>Insert image</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}