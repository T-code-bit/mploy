import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Paperclip, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { supabase, supabaseAnonKey, supabaseUrl } from "@/integrations/supabase/client";
import mployLogo from "@/assets/mploy-logo.png";
import { toast } from "sonner";

// Stylized robot head launcher with M-Ploy logo as the "face screen"
const RobotHead = ({ open }: { open: boolean }) => (
  <div className="relative h-14 w-14">
    {/* Antenna */}
    <div className="absolute left-1/2 -top-2 -translate-x-1/2 flex flex-col items-center">
      <div className="h-2.5 w-2.5 rounded-full bg-secondary shadow-[0_0_8px_hsl(var(--secondary))] animate-pulse" />
      <div className="h-2 w-0.5 bg-primary-foreground/70" />
    </div>
    {/* Head shell */}
    <div className="absolute inset-0 rounded-[1.25rem] bg-gradient-primary shadow-lg border-2 border-primary-foreground/20 flex items-center justify-center overflow-hidden">
      {/* Side "ears" */}
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-3 w-1.5 rounded-l-sm bg-primary-foreground/30" />
      <div className="absolute -right-1 top-1/2 -translate-y-1/2 h-3 w-1.5 rounded-r-sm bg-primary-foreground/30" />
      {/* Face screen showing logo */}
      <div className="h-9 w-9 rounded-lg bg-background/95 flex items-center justify-center ring-2 ring-primary-foreground/30">
        {open ? (
          <X className="h-5 w-5 text-primary" />
        ) : (
          <img src={mployLogo} alt="M-Ploy" className="h-7 w-7 object-contain" />
        )}
      </div>
      {/* Mouth */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full bg-primary-foreground/40" />
    </div>
  </div>
);

type Attachment = { name: string; mime: string; dataUrl: string; size: number };
type Msg = { role: "user" | "assistant"; content: string; attachments?: Attachment[] };
const MAX_CHAT_ATTACHMENTS = 3;
const MAX_CHAT_ATTACHMENT_SIZE = 4 * 1024 * 1024;
const MAX_CHAT_ATTACHMENTS_TOTAL = 8 * 1024 * 1024;

const toApiContent = (m: Msg) => {
  if (!m.attachments?.length) return m.content;
  const blocks: any[] = [{ type: "text", text: m.content || "Please review the attached file(s)." }];
  for (const a of m.attachments) {
    if (a.mime.startsWith("image/")) {
      blocks.push({ type: "image_url", image_url: { url: a.dataUrl } });
    } else {
      blocks.push({ type: "file", file: { filename: a.name, file_data: a.dataUrl } });
    }
  }
  return blocks;
};

const readFile = (file: File) =>
  new Promise<Attachment>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      name: file.name,
      mime: file.type || "application/octet-stream",
      dataUrl: String(reader.result),
      size: file.size,
    });
    reader.onerror = () => reject(new Error(`${file.name}: the browser could not read this file.`));
    reader.readAsDataURL(file);
  });

const validateChatAttachment = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const supported = file.type.startsWith("image/")
    || ["pdf", "doc", "docx", "txt"].includes(extension || "");

  if (!supported) {
    throw new Error(`${file.name}: use an image, PDF, DOC, DOCX, or TXT file.`);
  }
  if (file.size === 0) {
    throw new Error(`${file.name}: the file is empty.`);
  }
  if (file.size > MAX_CHAT_ATTACHMENT_SIZE) {
    throw new Error(`${file.name}: files must be 4MB or smaller.`);
  }
};

const responseErrorMessage = async (response: Response) => {
  try {
    const payload = await response.json();
    if (typeof payload?.error === "string") return payload.error;
  } catch {
    // Use the status-specific fallback below.
  }

  if (response.status === 413) return "The attachments are too large. Use smaller files.";
  if (response.status === 429) return "The AI service is busy. Please retry shortly.";
  if (response.status === 402) return "The configured AI account has no available quota.";
  return "The Career Coach is temporarily unavailable.";
};

const CareerCoachChatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi 👋 I'm **M-Ploy Coach** — your flexible career and life assistant. Ask me anything: jobs, CV tips, interviews, study advice, motivation, or life questions. How can I help today?",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || loading) return;
    const next = [...messages, { role: "user" as const, content: text, attachments }];
    setMessages(next);
    setInput("");
    setAttachments([]);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${supabaseUrl}/functions/v1/career-coach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${session?.access_token || supabaseAnonKey}`,
        },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: toApiContent(m) })),
        }),
      });

      if (!res.ok || !res.body) {
        const errorMsg = await responseErrorMessage(res);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: errorMsg,
          },
        ]);
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistant = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: assistant };
                return copy;
              });
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Connection problem: ${errorMessage}. Please check your network and try again.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[60] flex items-center justify-center"
        aria-label="Open M-Ploy Coach chat"
      >
        <RobotHead open={open} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[400px] h-[70vh] sm:h-[560px] max-h-[600px] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-gradient-primary text-primary-foreground p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-background/95 flex items-center justify-center ring-2 ring-primary-foreground/30">
                <img src={mployLogo} alt="M-Ploy" className="h-7 w-7 object-contain" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">M-Ploy Coach</p>
                <p className="text-xs opacity-80">Career & life assistant • Online</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border text-foreground rounded-bl-sm"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                        <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {m.attachments?.map((a, ai) =>
                          a.mime.startsWith("image/") ? (
                            <img key={ai} src={a.dataUrl} alt={a.name} className="rounded-lg max-h-40 object-cover" />
                          ) : (
                            <div key={ai} className="flex items-center gap-1.5 text-xs opacity-90">
                              <FileText className="h-3.5 w-3.5" /> {a.name}
                            </div>
                          )
                        )}
                        {m.content && <div className="whitespace-pre-wrap">{m.content}</div>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="p-3 border-t border-border bg-card flex flex-col gap-2"
            >
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {attachments.map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-muted rounded-full px-2 py-1">
                      <FileText className="h-3 w-3" />
                      <span className="max-w-[120px] truncate">{a.name}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${a.name}`}
                        onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                onClick={(event) => {
                  event.currentTarget.value = "";
                }}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  const remainingSlots = MAX_CHAT_ATTACHMENTS - attachments.length;
                  const selected = files.slice(0, Math.max(0, remainingSlots));

                  if (files.length > selected.length) {
                    toast.error(`You can attach up to ${MAX_CHAT_ATTACHMENTS} files at a time.`);
                  }

                  try {
                    selected.forEach(validateChatAttachment);
                    const totalSize = attachments.reduce((sum, attachment) => sum + attachment.size, 0)
                      + selected.reduce((sum, file) => sum + file.size, 0);
                    if (totalSize > MAX_CHAT_ATTACHMENTS_TOTAL) {
                      throw new Error("Keep the combined attachment size under 8MB.");
                    }
                    const parsed = await Promise.all(selected.map(readFile));
                    setAttachments((prev) => [...prev, ...parsed]);
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "One or more attachments could not be read.");
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="rounded-full shrink-0"
                aria-label="Attach image or document"
                onClick={() => fileRef.current?.click()}
                disabled={loading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything or attach a CV…"
                className="rounded-full"
                disabled={loading}
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full bg-gradient-primary text-primary-foreground shrink-0"
                disabled={loading || (!input.trim() && attachments.length === 0)}
              >
                <Send className="h-4 w-4" />
              </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CareerCoachChatbot;
