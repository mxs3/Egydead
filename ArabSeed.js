async function searchResults(keyword) {
  try {
    const url = `https://a.asd.homes/?s=${encodeURIComponent(keyword)}`;
    const html = await fetchv2(url);
    if (!html) return [];

    const results = [];
    const regex = /<a href="([^"]+)"[^>]*>\s*<div class="Poster">\s*<img[^>]+data-src="([^"]+)"[^>]+alt="([^"]+)"[\s\S]*?<div class="Story">([\s\S]*?)<\/div>/g;

    let match;
    while ((match = regex.exec(html)) !== null) {
      results.push({
        title: match[3].trim(),
        url: match[1],
        poster: match[2],
        description: match[4].trim()
      });
    }

    return results;
  } catch (err) {
    console.log("searchResults error:", err);
    return [];
  }
}
