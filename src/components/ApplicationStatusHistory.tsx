import { BriefcaseBusiness, CircleCheck, Eye, Star, UserCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApplicationTimestamps, formatExactDateTime } from "@/lib/date-time";

type Props = ApplicationTimestamps & {
  className?: string;
  compact?: boolean;
};

const ApplicationStatusHistory = ({
  created_at,
  reviewed_at,
  shortlisted_at,
  hired_at,
  rejected_at,
  className,
  compact = false,
}: Props) => {
  const events = [
    { label: "Applied", value: created_at, icon: BriefcaseBusiness, color: "text-primary" },
    { label: "Reviewed", value: reviewed_at, icon: Eye, color: "text-primary" },
    { label: "Shortlisted", value: shortlisted_at, icon: Star, color: "text-warning" },
    { label: "Hired", value: hired_at, icon: UserCheck, color: "text-success" },
    { label: "Rejected", value: rejected_at, icon: XCircle, color: "text-destructive" },
  ].filter((event) => Boolean(event.value));

  return (
    <div className={cn(compact ? "space-y-1" : "grid gap-2 sm:grid-cols-2", className)}>
      {events.map((event) => (
        <div key={event.label} className="flex min-w-0 items-start gap-2 text-xs">
          <event.icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", event.color)} aria-hidden="true" />
          <span className="min-w-0">
            <span className="font-semibold text-foreground">{event.label}</span>
            <span className="block break-words text-muted-foreground">{formatExactDateTime(event.value)}</span>
          </span>
        </div>
      ))}
      {events.length === 1 && !compact && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Updates will appear here.
        </div>
      )}
    </div>
  );
};

export default ApplicationStatusHistory;