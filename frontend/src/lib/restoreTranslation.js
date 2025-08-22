export function restoreTranslation() {
  const translatedTexts = JSON.parse(localStorage.getItem("translatedPage"));
  if (!translatedTexts) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node, i) => {
    if (translatedTexts[i]) node.textContent = translatedTexts[i];
  });
}