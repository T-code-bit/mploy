import { Check, Eye, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { key: "pending", label: "Pending" },
  { key: "reviewing", label: "Reviewing" },
  { key: "reviewed", label: "Reviewed" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "hired", label: "Hired" },
] as const;

const STAGE_INDEX: Record<string, number> = {
  pending: 0,
  reviewing: 1,
  reviewed: 2,
  shortlisted: 3,
  hired: 4,
  accepted: 4,
};

interface Props {
  status: string;
  className?: string;
}

const ApplicationProgress = ({ status, className }: Props) => {
  const normalized = (status || "pending").toLowerCase();
  const isRejected = normalized === "rejected";
  const currentIdx = isRejected ? -1 : STAGE_INDEX[normalized] ?? 0;

  if (isRejected) {
    return (
      <div className={cn("flex items-center gap-2 text-xs", className)}>
        <div className="flex-1 h-1.5 rounded-full bg-destructive/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-destructive/60" />
        </div>
        <div className="flex items-center gap-1.5 text-destructive font-semibold">
          <X className="h-3.5 w-3.5" /> Not selected
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-1">
        {STAGES.map((stage, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={stage.key} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <div className="flex items-center w-full">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full shrink-0 transition-colors",
                    done && "bg-success",
                    active && "bg-primary ring-4 ring-primary/20",
                    !done && !active && "bg-muted"
                  )}
                />
                {i < STAGES.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 transition-colors",
                      i < currentIdx ? "bg-success" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium truncate w-full text-center",
                  active && "text-primary",
                  done && "text-success",
                  !done && !active && "text-muted-foreground"
                )}
              >
                {stage.label}
                {active && stage.key === "reviewing" && (
                  <Loader2 className="inline-block h-2.5 w-2.5 animate-spin ml-0.5" />
                )}
                {active && stage.key === "reviewed" && (
                  <Eye className="ml-0.5 inline-block h-2.5 w-2.5" />
                )}
                {active && stage.key === "hired" && (
                  <Check className="inline-block h-2.5 w-2.5 ml-0.5" />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationProgress;
