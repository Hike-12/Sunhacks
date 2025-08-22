import { translateText } from "../services/translation.js";

export async function translatePage(targetLang = "mr") {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  const originalTexts = nodes.map(node => node.textContent);

  // Batch translate
  const translatedTexts = await translateText(originalTexts, targetLang);

  nodes.forEach((node, i) => {
    node.textContent = translatedTexts[i];
  });

  localStorage.setItem("translatedPage", JSON.stringify(translatedTexts));
}