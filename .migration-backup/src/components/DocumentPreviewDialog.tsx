import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Download, ExternalLink, FileText, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  APPLICATION_DOCUMENTS_BUCKET,
  getDocumentKind,
  getFileExtension,
} from "@/lib/file-storage";

interface Props {
  document: { path: string; label: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentPreviewDialog = ({ document, open, onOpenChange }: Props) => {
  const [signedUrl, setSignedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);

  const kind = useMemo(
    () => (document ? getDocumentKind(document.path) : "unknown"),
    [document],
  );
  const extension = document ? getFileExtension(document.path).toUpperCase() : "";

  const loadDocument = async () => {
    if (!document) return;
    setLoading(true);
    setError("");
    setPreviewFailed(false);

    try {
      if (/^https?:\/\//i.test(document.path)) {
        setSignedUrl(document.path);
      } else {
        const { data, error: signError } = await supabase.storage
          .from(APPLICATION_DOCUMENTS_BUCKET)
          .createSignedUrl(document.path, 60 * 60);
        if (signError || !data?.signedUrl) {
          throw signError || new Error("The document link could not be created.");
        }
        setSignedUrl(data.signedUrl);
      }
    } catch (loadError) {
      setSignedUrl("");
      setError(loadError instanceof Error ? loadError.message : "Unable to load this document.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !document) {
      setSignedUrl("");
      setError("");
      setPreviewFailed(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");
    setPreviewFailed(false);

    const resolveUrl = async () => {
      try {
        if (/^https?:\/\//i.test(document.path)) {
          if (active) setSignedUrl(document.path);
          return;
        }
        const { data, error: signError } = await supabase.storage
          .from(APPLICATION_DOCUMENTS_BUCKET)
          .createSignedUrl(document.path, 60 * 60);
        if (signError || !data?.signedUrl) {
          throw signError || new Error("The document link could not be created.");
        }
        if (active) setSignedUrl(data.signedUrl);
      } catch (loadError) {
        if (active) {
          setSignedUrl("");
          setError(loadError instanceof Error ? loadError.message : "Unable to load this document.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void resolveUrl();
    return () => {
      active = false;
    };
  }, [open, document]);

  const canPreview = kind === "image" || kind === "pdf";
  const previewUnavailable = !canPreview || previewFailed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-4xl h-[min(90vh,800px)] rounded-2xl p-0 overflow-hidden flex flex-col gap-0">
        <DialogHeader className="flex flex-row items-center justify-between gap-4 border-b border-border p-4 sm:p-6">
          <div className="min-w-0">
            <DialogTitle className="font-display truncate">{document?.label || "Document"}</DialogTitle>
            {extension && <p className="text-xs text-muted-foreground mt-1">{extension} document</p>}
          </div>
          {signedUrl && (
            <Button variant="outline" size="sm" asChild className="shrink-0 rounded-xl gap-2">
              <a href={signedUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </a>
            </Button>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          {loading ? (
            <div className="h-full min-h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm">Preparing secure document access…</p>
            </div>
          ) : error ? (
            <div className="h-full min-h-64 flex flex-col items-center justify-center gap-4 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div>
                <p className="font-semibold text-foreground">Document unavailable</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">{error}</p>
              </div>
              <Button variant="outline" onClick={() => void loadDocument()} className="rounded-xl gap-2">
                <RotateCcw className="h-4 w-4" /> Try again
              </Button>
            </div>
          ) : signedUrl && !previewUnavailable ? (
            kind === "image" ? (
              <div className="h-full flex items-center justify-center">
                <img
                  src={signedUrl}
                  alt={document?.label || "Uploaded document"}
                  className="max-h-full max-w-full object-contain rounded-xl"
                  onError={() => setPreviewFailed(true)}
                />
              </div>
            ) : (
              <iframe
                title={document?.label || "Document preview"}
                src={signedUrl}
                className="h-full min-h-[55vh] w-full rounded-xl border border-border bg-muted"
                onError={() => setPreviewFailed(true)}
              />
            )
          ) : signedUrl ? (
            <div className="h-full min-h-64 flex flex-col items-center justify-center gap-4 text-center">
              <FileText className="h-12 w-12 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Preview unavailable in this browser</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Download the file and open it with Microsoft Word or another compatible app.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" asChild className="rounded-xl gap-2">
                  <a href={signedUrl} target="_blank" rel="noopener noreferrer" download>
                    <Download className="h-4 w-4" /> Download {extension || "file"}
                  </a>
                </Button>
                <Button variant="ghost" asChild className="rounded-xl gap-2">
                  <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> Open externally
                  </a>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewDialog;