async function searchResults(keyword) {
  try {
    const encoded = encodeURIComponent(keyword);
    const resText = await fetch(`https://egydead.com.co/search?s=${encoded}`);
    if (!resText) return JSON.stringify([]);

    const regex = /الحلق.? ([^ ]+).*?\s(انمى [^"]*)/g;

    const map = new Map();
    let m;
    while ((m = regex.exec(resText)) !== null) {
      const episode = m[1]; // مثلاً: "23"
      const fullTitle = m[2]; // مثلاً: "انمى Jujutsu Kaisen الموسم الثاني الحلقة 23 مترجمة"
      const baseTitle = fullTitle.replace(/ الموسم.*/g, "").trim();

      if (!map.has(baseTitle)) {
        // نجلب الرابط من الـ text من خلال البحث بين الأقواس [14] الخ...
        const linkMatch = /\[(\d+)†.*?\]\s*(.*?)\s/;
        const idx = m.index;
        // نفترض إن اللينك موجود بجوار التقسيم اللي فيه الرقم المرجعي.
        const snippet = resText.slice(idx - 100, idx + 100);
        const lm = snippet.match(/https?:\/\/[^ ]+/);
        const href = lm ? lm[0] : "";

        map.set(baseTitle, { title: baseTitle, href });
      }
    }

    return JSON.stringify(Array.from(map.values()));
  } catch (e) {
    console.log("searchResults error:", e);
    return JSON.stringify([]);
  }
}
