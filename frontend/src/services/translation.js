export async function translateText(texts, targetLang = "mr") {
  const results = [];
  
  for (const text of texts) {
    if (!text || typeof text !== "string" || text.trim() === "") {
      results.push(text);
      continue;
    }
    
    try {
      // Using MyMemory Translation API (free, no CORS issues)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      results.push(data.responseData.translatedText || text);
    } catch (error) {
      console.error("Translation error:", error);
      results.push(text); // Fallback to original text
    }
  }
  return results;
}