const axios = require('axios');
const { cmd, commands } = require('../command');
const sharp = require('sharp'); // Thumbnail process කිරීම සඳහා
const config = require('../config'); // ප්‍රධාන config ෆයිල් එක සම්බන්ධ කිරීම
const  fetch = (..._0x528df7) =>
    import('node-fetch').then(({ default: _0x1863f6 }) =>
      _0x1863f6(..._0x528df7)
    ),
  { Buffer } = require('buffer'),
  FormData = require('form-data'),
  fs = require('fs'),
  path = require('path'),
  fileType = require('file-type'),
  l = console.log;


// API Key එක විචල්‍යයක් ලෙස තබා ගනිමු
const TAMILMV_KEY = process.env.NADEEN_KEY;

// ==================== 1. TAMILMV MOVIE SEARCH ====================
cmd({
    pattern: "tamilmv",
    react: "🎬",
    category: "movie",
    desc: "Search movies from TamilMV via list button",
    use: ".tamilmv 2025",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Authorization Check
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }

        if (!q) return reply("*❗ Please provide a query to search! (e.g., .tamilmv 2025)*");

        // Search API Call
        const searchApi = `https://nadeen-apis.koyeb.app/api/tamilmv/search?q=${encodeURIComponent(q)}&key=${TAMILMV_KEY}`;
        const response = await axios.get(searchApi);
        const data = response.data;

        if (!data || data.success !== true || !Array.isArray(data.results) || data.results.length === 0) {
            return reply("*❌ No results found for your search query!*");
        }

        let captionText = `🎬 *TAMILMV MOVIE SEARCH RESULTS*\n\n*🕵️‍♂️ Input:* ${q}\n*📌 Results Found:* ${data.results.length}\n\n*Select a movie from the option button below:*`;

        let listRows = [];
        data.results.forEach(movie => {
            let cleanTitle = movie.title ? movie.title.replace(/[±&]/g, "").trim() : "Unknown Movie";
            listRows.push({
                header: '',
                title: cleanTitle.substring(0, 60),
                description: "Tap to view torrent links & info",
                id: `${prefix}tmvinfo ${encodeURIComponent(movie.url)}±${encodeURIComponent(cleanTitle)}`
            });
        });

        await conn.sendMessage(from, {
            image: { url: config.LOGO || "https://example.com/default-logo.jpg" },
            caption: captionText,
            footer: config.FOOTER || "Power By NadeenXDev",
            optionText: "🎥 Select Movie",
            optionTitle: "Available Movies",
            nativeFlow: [{
                text: "🎥 Select Movie",
                sections: [{ title: "Search Results", rows: listRows }]
            }],
            viewOnce: true
        }, { quoted: mek });

    } catch (e) {
        if (e.response) {
            console.error("❌ API Search Error Response:", e.response.data);
        } else {
            console.error("❌ Search Error:", e.message);
        }
        reply(`*❌ Error searching movie!* \n\n*Detail:* ${e.message}`);
    }
});


// ==================== 2. TAMILMV INFO & MAGNET SELECTOR ====================
cmd({
    pattern: "tmvinfo",
    react: "ℹ️",
    category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) return;

        if (!q) return reply("*❗ Missing movie URL data!*");
        const [movieUrl, passedTitle] = q.split("±");

        // Info API Call
        const infoApi = `https://nadeen-apis.koyeb.app/api/tamilmv/info?url=${encodeURIComponent(decodeURIComponent(movieUrl))}&key=${TAMILMV_KEY}`;
        const { data: res } = await axios.get(infoApi);

        if (!res || res.success !== true || !res.data) {
            return reply("*❌ Failed to fetch movie details from API!*");
        }

        const md = res.data;
        const posterImg = md.poster || config.LOGO || "https://example.com/default-logo.jpg";

        if (!md.downloads || !Array.isArray(md.downloads) || md.downloads.length === 0) {
            return reply("*❌ No download links available for this movie!*");
        }

        // 🔍 මෙතැනදී type එක "Magnet" වන ඒවා පමණක් ෆිල්ටර් කර ගනී
        const magnetLinks = md.downloads.filter(dl => dl.type && dl.type.toLowerCase() === "magnet");

        if (magnetLinks.length === 0) {
            return reply("*❌ No Magnet links found for this movie!*");
        }

        let infoMsg = `🎬 *${md.title || passedTitle}*\n\n` +
                      `📅 *Year:* ${md.year || 'N/A'}\n` +
                      `🧲 *Total Magnet Links:* ${magnetLinks.length}\n\n` +
                      `⬇️ *Select a quality option from below to fetch magnet:*`;

        let listRows = [];
        magnetLinks.forEach((dl, index) => {
            // "MAGNET" කියන පොදු නම වෙනුවට movie title එක භාවිත කිරීම
            let cleanMovieTitle = md.title ? md.title.replace(/[±&]/g, "").trim() : passedTitle;
            let qualityDisplay = dl.quality && dl.quality !== "Unknown" ? dl.quality : "Magnet Link";
            let langDisplay = Array.isArray(dl.languages) ? dl.languages.join(", ") : "N/A";

            // ඔබ ඉල්ලා සිටි පරිදි: ${prefix}torrent ${v.magnet}±${d.image}±${d.title}±${v.quality}
            // WhatsApp Button ID එකක් ඇතුළත & ලකුණ තිබුනොත් මැසේජ් එක යන්නේ නැති නිසා මෙහිදී magnet ලින්ක් එකේ ඇති & ලකුණු සියල්ල %26 බවට පත් කරයි.
            let safeMagnetUrl = dl.url ? dl.url.replace(/&/g, "%26") : "";
            
            let customId = `${prefix}torren ${safeMagnetUrl}±${posterImg}±${cleanMovieTitle}±${qualityDisplay}`;

            listRows.push({
                header: '',
                title: `🧲 [${dl.size || 'N/A'}] - ${qualityDisplay}`,
                description: `www.nadeenx.dev`,
                id: customId
            });
        });

        await conn.sendMessage(from, {
            image: { url: posterImg },
            caption: infoMsg,
            footer: config.FOOTER || "Power By NadeenXDev",
            optionText: "🧲 Select Magnet",
            optionTitle: "Magnet Options",
            nativeFlow: [{
                text: "🧲 Select Magnet",
                sections: [{ title: "Available Magnets", rows: listRows }]
            }],
            viewOnce: true
        }, { quoted: mek });

    } catch (e) {
        console.error("❌ Info Error:", e.message);
        reply("*❌ Error fetching movie details!*");
    }
});
