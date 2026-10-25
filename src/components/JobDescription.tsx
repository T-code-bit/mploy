import { jobDescriptionHtml } from "@/lib/job-description";

export const jobDescriptionClasses = "text-sm leading-relaxed text-muted-foreground break-words [&_p]:my-2 [&_h1]:my-3 [&_h1]:text-xl [&_h2]:my-3 [&_h2]:text-lg [&_h3]:my-2 [&_h3]:text-base [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_a]:text-primary [&_a]:underline [&_strong]:font-bold";

export default function JobDescription({ value }: { value: string }) {
  return <div className={jobDescriptionClasses} dangerouslySetInnerHTML={{ __html: jobDescriptionHtml(value) }} />;
}