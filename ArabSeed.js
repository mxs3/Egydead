async function searchResults(keyword) {
  try {
    const searchUrl = `https://a.asd.homes/find/?find=${encodeURIComponent(keyword)}`;
    const response = await fetchv2(searchUrl);
    if (!response) return [];

    const html = await response.text();
    const results = [];

    const regex = /<a href="([^"]+)"[^>]*>\s*<div class="Poster">\s*<img[^>]+data-src="([^"]+)"[^>]+alt="([^"]+)"/g;

    let match;
    while ((match = regex.exec(html)) !== null) {
      results.push({
        title: match[3].trim(),
        url: match[1],
        poster: match[2],
      });
    }

    return results;
  } catch (err) {
    console.log("Search error:", err);
    return [];
  }
}
