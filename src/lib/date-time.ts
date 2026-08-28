export const formatExactDateTime = (value?: string | null) => {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
};

export type ApplicationTimestamps = {
  created_at: string;
  reviewing_at?: string | null;
  reviewed_at?: string | null;
  shortlisted_at?: string | null;
  hired_at?: string | null;
  rejected_at?: string | null;
};

export const currentStatusTimestamp = (
  application: ApplicationTimestamps & { status?: string | null },
) => {
  switch ((application.status || "").toLowerCase()) {
    case "reviewing":
      return application.reviewing_at;
    case "reviewed":
      return application.reviewed_at;
    case "shortlisted":
      return application.shortlisted_at;
    case "hired":
    case "accepted":
      return application.hired_at;
    case "rejected":
      return application.rejected_at;
    default:
      return application.created_at;
  }
};