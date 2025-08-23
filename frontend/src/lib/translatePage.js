import { translateText } from "../services/translation.js";

/**
 * Translate visible text nodes on the page.
 * - Supports quick restore to English using stored original texts.
 * - Only stores text nodes that contain non-whitespace characters.
 * - Exports both named and default for compatibility.
 */
export async function translatePage(targetLang = "mr") {
  if (typeof window === "undefined") return;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    // skip script/style and empty nodes
    const parentTag = node.parentElement?.tagName;
    if (parentTag && ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parentTag))
      continue;
    if (!node.textContent || !node.textContent.trim()) continue;
    nodes.push(node);
  }

  const currentTexts = nodes.map((n) => n.textContent);

  // Quick restore: if user requests English and we previously saved originals, restore them without API call
  if (targetLang === "en") {
    try {
      const orig = localStorage.getItem("originalPageTexts");
      if (orig) {
        const origArr = JSON.parse(orig);
        if (Array.isArray(origArr) && origArr.length === nodes.length) {
          nodes.forEach(
            (n, i) => (n.textContent = origArr[i] ?? n.textContent)
          );
          localStorage.setItem("language", "en");
          localStorage.setItem("translatedLang", "en");
          return origArr;
        }
      }
    } catch (e) {
      console.error("translatePage restore error", e);
      // fallthrough to API translate as a fallback
    }
  }

  // If translating away from English, store originals (only store once to allow exact restore)
  if (targetLang !== "en") {
    try {
      if (!localStorage.getItem("originalPageTexts")) {
        localStorage.setItem("originalPageTexts", JSON.stringify(currentTexts));
      }
    } catch (e) {
      console.warn("Could not persist original page texts:", e);
    }
  }

  // Perform translation via translation service
  try {
    const translatedTexts = await translateText(currentTexts, targetLang);
    if (Array.isArray(translatedTexts) && translatedTexts.length) {
      nodes.forEach((n, i) => {
        if (translatedTexts[i]) n.textContent = translatedTexts[i];
      });
      localStorage.setItem("translatedPage", JSON.stringify(translatedTexts));
      localStorage.setItem("translatedLang", targetLang);
      localStorage.setItem("language", targetLang);
      return translatedTexts;
    } else {
      // fallback: do nothing and return current texts
      return currentTexts;
    }
  } catch (err) {
    console.error("translatePage error:", err);
    return currentTexts;
  }
}

export default translatePage;
