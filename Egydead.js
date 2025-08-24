async function searchResults(keyword) {
  try {
    const url = `https://tv3.egydead.live/?s=${encodeURIComponent(keyword)}`;
    const html = await fetchv2(url);
    if (!html) return JSON.stringify([]);

    const results = [];
    const regex = /<div class="result-item">.*?<a href="([^"]+)"[^>]*title="([^"]+)".*?<img[^>]+src="([^"]+)"/gs;

    let match;
    while ((match = regex.exec(html)) !== null) {
      results.push({
        title: match[2].trim(),
        image: match[3],
        href: match[1],
      });
    }

    return JSON.stringify(results);
  } catch (err) {
    console.log("EgyDead search error:", err);
    return JSON.stringify([]);
  }
}
