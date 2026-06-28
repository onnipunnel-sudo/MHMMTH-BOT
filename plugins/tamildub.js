const configz = require('../config'),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
	fg = require('api-dylux'),
  sharp = require('sharp'),
 { Sticker, StickerTypes } = require('wa-sticker-formatter'),
  download = require('../lib/yts'),
  {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
  } = require('../lib/functions'),
  fetch = (..._0x528df7) =>
    import('node-fetch').then(({ default: _0x1863f6 }) =>
      _0x1863f6(..._0x528df7)
    ),
  { Buffer } = require('buffer'),
  FormData = require('form-data'),
  fs = require('fs'),
  path = require('path'),
  fileType = require('file-type'),
  l = console.log

// API Key එක විචල්‍යයක් ලෙස තබා ගනිමු
const MOVIESDA_KEY = process.env.NADEEN_KEY;

// Thumbnail රිසයිස් කිරීම සඳහා වන ශ්‍රිතය
async function resizeImaged(buffer, width, height) {
    try {
        return await sharp(buffer)
            .resize(width, height, { fit: 'cover' })
            .toFormat('jpeg')
            .jpeg({ quality: 80 })
            .toBuffer();
    } catch (e) {
        console.log("Sharp error:", e.message);
        return null;
    }
}
const LOGO = `https://nadeen-botzdatabse.nadeenx.workers.dev/MOVIExGO.png`
const FOOTER = `*•𖣐ɴᴀᴅᴇᴇɴ-ᴍᴅ𖣐•*`
// ==================== 1. MOVIESDA SEARCH (tamildub) ====================
// ==================== 1. MOVIESDA SEARCH (tamildub) ====================
cmd({
    pattern: "tamildub",
    react: "🔍",
    category: "movie",
    desc: "Search movies from Moviesda via list button",
    use: ".tamildub the devil",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply, configz }) => {
    try {
        // 🧩 Authorization Check
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }

        if (!q) return reply("*❗ Please provide a movie name to search! (e.g., .tamildub devil)*");

        // Search API Call
        const searchApi = `https://nadeen-apis.koyeb.app/api/moviesda/search?q=${encodeURIComponent(q)}&key=${MOVIESDA_KEY}`;
        const response = await axios.get(searchApi);
        const data = response.data;

        if (!data || data.success !== true || !Array.isArray(data.results) || data.results.length === 0) {
            return reply("*❌ No results found for your search query!*");
        }

        let captionText = `🎬 *TAMILDUB MOVIE SEARCH RESULTS*\n\n*🕵️‍♂️ Input:* ${q}\n*📌 Results Found:* ${data.results.length}\n\n*Select a movie from the option button below*`;

        let listRows = [];
        data.results.forEach(movie => {
            let cleanTitle = movie.title ? movie.title.replace(/[±&]/g, "").trim() : "Unknown Movie";
            listRows.push({
                header: '',
                title: cleanTitle.substring(0, 60),
                description: "Tap to view full info & download links",
                id: `${prefix}tdinfo ${encodeURIComponent(movie.url)}±${encodeURIComponent(cleanTitle)}`
            });
        });

        await conn.sendMessage(from, {
            image: { url: LOGO },
            caption: captionText,
            footer: FOOTER,
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


// ==================== 2. MOVIESDA INFO & QUALITY SELECTOR ====================
cmd({
    pattern: "tdinfo",
    react: "📽",
    category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply, configz }) => {
    try {
        // 🧩 Authorization Check
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) return;

        if (!q) return reply("*❗ Missing movie URL data!*");
        const [movieUrl, passedTitle] = q.split("±");

        // Info API Call
        const infoApi = `https://nadeen-apis.koyeb.app/api/moviesda/info?url=${encodeURIComponent(decodeURIComponent(movieUrl))}&key=${MOVIESDA_KEY}`;
        const { data: res } = await axios.get(infoApi);

        if (!res || res.success !== true || !res.data) {
            return reply("*❌ Failed to fetch movie details from API!*");
        }

        const md = res.data;

        let infoMsg = `🎥 *${md.title || passedTitle}*\n\n` +
                      `🌟 *Starring:* ${md.info?.starring || 'N/A'}\n` +
                      `🎭 *Genres:* ${md.info?.genres || 'N/A'}\n` +
                      `💎 *Quality:* ${md.info?.quality || 'N/A'}\n` +
                      `🌐 *Language:* ${md.info?.language || 'N/A'}\n` +
                      `📅 *Release Date:* ${md.info?.release_date || 'N/A'}\n\n` +
                      `⬇️ *Select a quality from the list below to get file:*`;

        const posterImg = md.poster || LOGO;

        if (!md.downloads || md.downloads.length === 0) {
            return reply("*❌ No download links available for this movie!*");
        }

        let listRows = [];
        md.downloads.forEach(dl => {
            let cleanFileName = dl.file_name ? dl.file_name.replace(/[±&]/g, "").trim() : "Download File.mp4";
            listRows.push({
                header: '',
                title: `🎬 ${dl.quality} (${dl.file_size || 'N/A'})`,
                description: `Hits: ${dl.hits || '0'} | Tap to download`,
                id: `${prefix}tddl ${encodeURIComponent(dl.download_url)}±${encodeURIComponent(cleanFileName)}±${encodeURIComponent(posterImg)}±${encodeURIComponent(dl.quality)}`
            });
        });

        await conn.sendMessage(from, {
            image: { url: posterImg },
            caption: infoMsg,
            footer: FOOTER,
            optionText: "📥 Select Quality",
            optionTitle: "Download Options",
            nativeFlow: [{
                text: "📥 Select Quality",
                sections: [{ title: "Available Qualities", rows: listRows }]
                }],
            viewOnce: true
        }, { quoted: mek });

    } catch (e) {
        if (e.response) {
            console.error("❌ API Info Error Response:", e.response.data);
        } else {
            console.error("❌ Info Error:", e.message);
        }
        reply("*❌ Error fetching movie details!*");
    }
});


// ==================== 3. TAMILDUB DOCUMENT (MP4) SENDER ====================
cmd({
    pattern: "tddl",
    react: "⬆",
    category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply, configz }) => {
    try {
        if (!q) return;
        const [downloadUrl, fileName, thumbUrl, quality] = q.split("±");
        const decodedFileName = decodeURIComponent(fileName);
        const finalUrl = decodeURIComponent(downloadUrl).trim();
        const decodedThumbUrl = thumbUrl ? decodeURIComponent(thumbUrl) : LOGO;
        const decodedQuality = quality ? decodeURIComponent(quality) : "N/A";

        //const fetchingMsg = await conn.sendMessage(from, { text: `🚀 *Connecting to server for:* \n_\`${decodedFileName}\`_...` }, { quoted: mek });

        // Thumbnail එක Buffer එකක් ලෙස ලබා ගැනීම සහ රිසයිස් කිරීම
        let resizedThumb = null;
        try {
            const imgRes = await axios.get(decodedThumbUrl, { responseType: 'arraybuffer' });
            let thumbBuffer = Buffer.from(imgRes.data);
            resizedThumb = await resizeImaged(thumbBuffer, 200, 200);
        } catch (e) {
            console.log("Thumbnail error:", e.message);
            resizedThumb = null;
        }

       const fetchingMsg = await conn.sendMessage(from, { text: `⬆️ *Uploading Movie as Document...*` }, { quoted: mek });

        // කෙලින්ම Document (MP4) එකක් ලෙස JID එකට හෝ From එකට යැවීම
        await conn.sendMessage( from, {
            document: { url: finalUrl },
            mimetype: "video/mp4",
            fileName: decodedFileName,
            jpegThumbnail: resizedThumb ? resizedThumb : undefined,
            caption: `📦 *File Name:* ${decodedFileName}\n` +
                     `🎞️ *Quality:* ${decodedQuality}\n` +
                     `✅ *Status:* Successfully Sent as Document\n\n` +
                     `> ${FOOTER}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
        await conn.sendMessage(from, { delete: fetchingMsg.key });

    } catch (e) {
        console.error("❌ Download Document Error:", e.message);
        reply("🚫 Download Document Error: " + e.message);
    }
});
