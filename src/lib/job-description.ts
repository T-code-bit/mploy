import DOMPurify from "dompurify";

const formattedDescription = /<\/?(?:p|div|br|h[1-6]|strong|b|em|i|u|s|ul|ol|li|blockquote|a)(?:\s[^>]*|\s*)>/i;

export function jobDescriptionHtml(value: string) {
  if (!formattedDescription.test(value)) {
    const paragraph = document.createElement("p");
    paragraph.textContent = value;
    return paragraph.innerHTML.replace(/\r?\n/g, "<br>");
  }
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ["p", "div", "br", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "blockquote", "a"],
    ALLOWED_ATTR: ["href", "title"],
  });
}

export function jobDescriptionText(value: string) {
  const container = document.createElement("div");
  container.innerHTML = jobDescriptionHtml(value).replace(/<\/(?:p|div|h[1-6]|li|blockquote)>|<br\s*\/?\s*>/gi, " $&");
  return container.textContent?.replace(/\s+/g, " ").trim() ?? "";
}