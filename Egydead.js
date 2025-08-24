// 🔎 EgyDead Search Function (tv3.egydead.live)
async function searchResults(keyword) {
  const results = [];
  try {
    // 🟢 رابط البحث
    const url = `https://tv3.egydead.live/?s=${encodeURIComponent(keyword)}`;

    // 🟢 جلب الصفحة
    const res = await fetchv2(url);
    if (!res) return results;
    const html = await res.text();

    // 🟢 Regex لاستخراج النتائج
    const regex = /<li class="movieItem">[\s\S]*?<a href="([^"]+)"[^>]*title="([^"]+)">[\s\S]*?<img src="([^"]+)"[^>]*>[\s\S]*?<h1 class="BottomTitle">([^<]+)<\/h1>/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const link = match[1].trim();
      const title = (match[2] || match[4]).trim();
      const poster = match[3].trim();

      results.push({
        title,
        url: link,
        poster
      });
    }
  } catch (err) {
    console.log("❌ searchResults error:", err);
  }

  return results;
}
