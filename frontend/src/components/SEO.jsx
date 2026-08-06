import { useEffect } from "react";

const BASE = "SKL Enterprises";

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

// Lightweight, dependency-free SEO manager. Updates title + meta tags per page.
export default function SEO({ title, description, path = "" }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE}` : `${BASE} | Technology-Driven Public Service Solutions`;
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:card", "summary_large_image");
    // canonical
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", `${window.location.origin}${path}`);
  }, [title, description, path]);
  return null;
}
