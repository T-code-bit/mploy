import { describe, expect, it } from "vitest";
import { jobDescriptionHtml, jobDescriptionText } from "./job-description";

describe("job description formatting", () => {
  it("keeps supported formatting", () => {
    expect(jobDescriptionHtml("<h2>Responsibilities</h2><ul><li><strong>Lead</strong> a team</li></ul>"))
      .toBe("<h2>Responsibilities</h2><ul><li><strong>Lead</strong> a team</li></ul>");
  });
  it("removes unsafe scripts, handlers, and URLs", () => {
    expect(jobDescriptionHtml('<p onclick="alert(1)">Work<script>alert(1)</script><a href="javascript:alert(1)">here</a></p>'))
      .toBe("<p>Work<a>here</a></p>");
  });
  it("preserves legacy plain text and line breaks", () => {
    expect(jobDescriptionHtml("First line\nPay < 100 & benefits"))
      .toBe("First line<br>Pay &lt; 100 &amp; benefits");
  });
  it("shows readable summaries without HTML tags", () => {
    expect(jobDescriptionText("<h2>Responsibilities</h2><ul><li>Lead</li><li>Support</li></ul>"))
      .toBe("Responsibilities Lead Support");
  });
});