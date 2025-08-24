// 🔎 EgyDead Search Function (tv3.egydead.live)
async function searchResults(keyword) {
  const results = [];
  try {
    const url = `https://tv3.egydead.live/?s=${encodeURIComponent(keyword)}`;
    const res = await fetchv2(url);
    if (!res) return results;

    // ✅ نجبره يقرأ HTML
    const html = typeof res.text === "function" ? await res.text() : res;

    const regex = /<li class="movieItem">[\s\S]*?<a href="([^"]+)"[^>]*title="([^"]+)">[\s\S]*?<img src="([^"]+)"[^>]*>[\s\S]*?<h1 class="BottomTitle">([^<]+)<\/h1>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      results.push({
        title: (match[2] || match[4]).trim(),
        url: match[1].trim(),
        poster: match[3].trim()
      });
    }
  } catch (err) {
    console.log("❌ searchResults error:", err);
  }
  return results;
}
