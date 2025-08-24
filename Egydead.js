async function searchResults(keyword) {
    try {
        const url = `https://a.asd.homes/find/?find=${encodeURIComponent(keyword)}`;
        const response = await fetchv2(url);
        const html = await response.text();

        // أسرع Regex ويمسك النتائج كلها
        const regex = /<a href="([^"]+)" class="Movielist">[\s\S]*?<img[^>]+src="([^"]+)"[^>]*alt="([^"]+)"/g;

        const results = [];
        const seen = new Set();
        let match;

        while ((match = regex.exec(html)) !== null) {
            const title = match[3].replace(/الموسم\s+\S+\s+الحلقة\s+\S+.*$/u, '').trim();
            if (!seen.has(title)) {
                seen.add(title);
                results.push({
                    href: match[1].trim(),
                    image: match[2].trim(),
                    title: title
                });
            }
        }

        return JSON.stringify(results);
    } catch (err) {
        return JSON.stringify([{ title: "Error", image: "Error", href: "Error" }]);
    }
}

async function extractDetails(url) {
    try {
        const res = await fetchv2(url);
        const html = await res.text();
        const match = html.match(/<p class="descrip">(.*?)<\/p>/s);
        return JSON.stringify([{
            description: match ? match[1].trim() : "N/A",
            aliases: "N/A",
            airdate: "N/A"
        }]);
    } catch {
        return JSON.stringify([{ description: "Error", aliases: "Error", airdate: "Error" }]);
    }
}

async function extractEpisodes(url) {
    try {
        const results = [];
        let nextPage = url;

        // لف على كل الصفحات لحد ما يخلص (بيجيب كله مش صفحة واحدة بس)
        while (nextPage) {
            const res = await fetchv2(nextPage);
            const html = await res.text();

            // الحلقات
            const regex = /<a[^>]+href="([^"]+)"[^>]*>\s*<em>(\d+)<\/em>/g;
            let match;
            while ((match = regex.exec(html)) !== null) {
                results.push({
                    href: match[1].trim(),
                    number: parseInt(match[2], 10)
                });
            }

            // شوف لو فيه صفحة تانية
            const nextMatch = html.match(/<a class="next page-numbers" href="([^"]+)"/);
            nextPage = nextMatch ? nextMatch[1] : null;
        }

        return JSON.stringify(results.reverse());
    } catch {
        return JSON.stringify([{ href: url, number: 1 }]);
    }
}

async function extractStreamUrl(url) {
    try {
        const res = await fetchv2(url);
        const html = await res.text();

        // رابط زر المشاهدة
        const watchMatch = html.match(/href="([^"]+)"[^>]*class="watchBTn"/);
        if (!watchMatch) return "https://files.catbox.moe/avolvc.mp4";

        const watchUrl = watchMatch[1].replace(/&amp;/g, '&');
        const headers = { Referer: "https://a.asd.homes/" };

        // صفحة السيرفرات
        const res2 = await fetchv2(watchUrl, headers);
        const html2 = await res2.text();

        // امسك كل روابط السيرفرات
        const serverMatches = [...html2.matchAll(/data-link="([^"]+)"/g)];
        if (!serverMatches.length) return "https://files.catbox.moe/avolvc.mp4";

        // جرّب السيرفرات واحد واحد
        for (const m of serverMatches) {
            const embedUrl = m[1];

            // === Vidmoly Extractor مدموج ===
            if (/vidmoly/i.test(embedUrl)) {
                try {
                    const resV = await fetchv2(embedUrl, { headers: { Referer: embedUrl } });
                    const htmlV = await resV.text();

                    // <source src="">
                    const direct = htmlV.match(/<source[^>]+src="([^"]+)"/);
                    if (direct) return direct[1];

                    // أو "file": "..."
                    const fileMatch = htmlV.match(/"file"\s*:\s*"([^"]+)"/);
                    if (fileMatch) return fileMatch[1];
                } catch (err) {
                    console.log("Vidmoly extractor error:", err);
                }
            } else {
                // === أي سيرفر تاني (fallback) ===
                try {
                    const res3 = await fetchv2(embedUrl, headers);
                    const html3 = await res3.text();
                    const sourceMatch = html3.match(/<source[^>]+src="([^"]+)"/);
                    if (sourceMatch) return sourceMatch[1];
                } catch (err) {
                    console.log("Other server extractor error:", err);
                }
            }
        }

    } catch (err) {
        console.log("Stream extraction error:", err);
    }

    // fallback لو فشل كل شيء
    return "https://files.catbox.moe/avolvc.mp4";
}
