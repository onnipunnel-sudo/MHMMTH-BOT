const axios = require('axios');
const sharp = require('sharp'); // Thumbnail process කිරීම සඳහා
const config = require('../config'),
  { cmd, commands } = require('../command'),
   fetch = (..._0x528df7) =>
    import('node-fetch').then(({ default: _0x1863f6 }) =>
      _0x1863f6(..._0x528df7)
    ),
  { Buffer } = require('buffer'),
  FormData = require('form-data'),
  fs = require('fs'),
  path = require('path'),
  fileType = require('file-type');// ප්‍රධාන config ෆයිල් එක සම්බන්ධ කිරීම

// API Key එක විචල්‍යයක් ලෙස තබා ගනිමු
const NAIJAPREY_KEY = process.env.SHAN_KEY;

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

// ==================== 1. NAIJAPREY MOVIE SEARCH ====================
cmd({
    pattern: "naija",
    react: "🎬",
    category: "movie",
    desc: "Search movies from NaijaPrey via list button",
    use: ".naijaprey 2025",
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

        if (!q) return reply("*❗ Please provide a movie name to search! (e.g., .naijaprey Hell in Paradise)*");

        // Search API Call
        const searchApi = `https://api-dark-shan-yt.koyeb.app/movie/naijaprey-search?q=${encodeURIComponent(q)}&apikey=${NAIJAPREY_KEY}`;
        const response = await axios.get(searchApi);
        const resData = response.data;

        if (!resData || !Array.isArray(resData.data) || resData.data.length === 0) {
            return reply("*❌ No results found for your search query!*");
        }

        let captionText = `🎬 *NAIJAPREY MOVIE SEARCH RESULTS*\n\n*🕵️‍♂️ Input:* ${q}\n*📌 Results Found:* ${resData.data.length}\n\n*Select a movie from the option button below:*`;

        let listRows = [];
        resData.data.forEach(movie => {
            let cleanTitle = movie.title ? movie.title.replace(/[±&]/g, "").trim() : "Unknown Movie";
            listRows.push({
                header: '',
                title: cleanTitle.substring(0, 60),
                description: movie.date ? `Release: ${movie.date}` : "Tap to view full info",
                id: `${prefix}npinfo ${encodeURIComponent(movie.url)}±${encodeURIComponent(cleanTitle)}`
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
            console.error("❌ API Search Error:", e.response.data);
        } else {
            console.error("❌ Search Error:", e.message);
        }
        reply(`*❌ Error searching movie!* \n\n*Detail:* ${e.message}`);
    }
});


// ==================== 2. NAIJAPREY INFO & DOWNLOAD SELECTOR ====================
cmd({
    pattern: "npinfo",
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
        const infoApi = `https://api-dark-shan-yt.koyeb.app/movie/naijaprey-info?url=${encodeURIComponent(decodeURIComponent(movieUrl))}&apikey=${NAIJAPREY_KEY}`;
        const { data: response } = await axios.get(infoApi);

        if (!response || !response.data) {
            return reply("*❌ Failed to fetch movie details from API!*");
        }

        const md = response.data;
        const posterImg = md.image || config.LOGO || "https://example.com/default-logo.jpg";

        if (!md.downloads || !Array.isArray(md.downloads) || md.downloads.length === 0) {
            return reply("*❌ No download links available for this movie!*");
        }

        // 🔍 ඔබ ඉල්ලා සිටි පරිදි name එක "Download" වන එක පමණක් පෙරීම (Filter)
        const downloadOption = md.downloads.find(dl => dl.name && dl.name.trim().toLowerCase() === "download");

        if (!downloadOption) {
            return reply("*❌ Main Download option not found for this movie!*");
        }

        let infoMsg = `🎬 *${md.title || passedTitle}*\n\n` +
                      `🎭 *Genre:* ${md.info?.genre || 'N/A'}\n` +
                      `🌟 *Stars:* ${md.info?.stars || 'N/A'}\n` +
                      `🌐 *Language:* ${md.info?.language || 'N/A'}\n` +
                      `💎 *Source:* ${md.info?.source || 'N/A'}\n` +
                      `⏱️ *Runtime:* ${md.info?.runtime || 'N/A'}\n\n` +
                      `📝 *Overview:* ${md.overview || 'N/A'}\n\n` +
                      `⬇️ *Click the button below to generate final download link:*`;

        let listRows = [{
            header: '',
            title: `📥 Generate Movie File`,
            description: `Source: ${md.info?.source || 'N/A'}`,
            id: `${prefix}npdl ${encodeURIComponent(downloadOption.url)}±${encodeURIComponent(posterImg)}`
        }];

        await conn.sendMessage(from, {
            image: { url: posterImg },
            caption: infoMsg,
            footer: config.FOOTER || "Power By NadeenXDev",
            optionText: "📥 Download Movie",
            optionTitle: "Download Options",
            nativeFlow: [{
                text: "📥 Download Movie",
                sections: [{ title: "Available Options", rows: listRows }]
            }],
            viewOnce: true
        }, { quoted: mek });

    } catch (e) {
        if (e.response) {
            console.error("❌ API Info Error:", e.response.data);
        } else {
            console.error("❌ Info Error:", e.message);
        }
        reply("*❌ Error fetching movie details!*");
    }
});


// ==================== 3. NAIJAPREY DOCUMENT SENDER ====================
// ==================== 3. NAIJAPREY DOCUMENT SENDER ====================
cmd({
    pattern: "npdl",
    react: "⚡",
    category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return;
        const [downloadUrl, thumbUrl] = q.split("±");
        const finalDownloadPageUrl = decodeURIComponent(downloadUrl).trim();
        const decodedThumbUrl = thumbUrl ? decodeURIComponent(thumbUrl) : (config.LOGO || "https://example.com/default-logo.jpg");

        let targetJid = from;
        if (config.JID && config.JID !== 'undefined' && config.JID !== 'null' && config.JID.trim() !== '') {
            targetJid = config.JID;
        }

        const fetchingMsg = await conn.sendMessage(from, { text: `🚀 *Generating Direct Download Link from Server...*` }, { quoted: mek });

        // Download API Call
        const dlApi = `https://api-dark-shan-yt.koyeb.app/movie/naijaprey-download?url=${encodeURIComponent(finalDownloadPageUrl)}&apikey=${NAIJAPREY_KEY}`;
        const { data: dlResponse } = await axios.get(dlApi);

        if (!dlResponse || !dlResponse.status || !dlResponse.data || !dlResponse.data.url) {
            return await conn.sendMessage(from, { text: "*❌ Failed to generate direct download link from API!*" }, { edit: fetchingMsg.key });
        }

        const fileData = dlResponse.data;
        const fileSizeStr = fileData.size || "0 MB";

        // 🌟 2GB පරීක්ෂා කිරීමේ සහ නැවතීමේ ක්‍රියාවලිය
        let isOverSize = false;
        let sizeInMB = 0;

        if (fileSizeStr.toUpperCase().includes("GB")) {
            const sizeInGB = parseFloat(fileSizeStr);
            if (sizeInGB >= 2.0) isOverSize = true;
        } else if (fileSizeStr.toUpperCase().includes("MB")) {
            sizeInMB = parseFloat(fileSizeStr);
            if (sizeInMB > 2048) isOverSize = true; // 2GB = 2048MB
        }

        if (isOverSize) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { 
                text: `*🚫 Download Cancelled!*\n\n*🎬 Movie:* \`${fileData.title}\`\n*⚖️ File Size:* \`${fileSizeStr}\`\n\n_This file exceeds the maximum download limit of 2GB._` 
            }, { edit: fetchingMsg.key });
        }

        // ෆයිල් එක 2GB ට අඩු නම් බාගත කිරීම දිගටම කරගෙන යයි
        await conn.sendMessage(from, { text: `⬆️ *Uploading Movie as Document...*\n\n*File:* \`${fileData.title}\`\n*Size:* \`${fileSizeStr}\`` }, { edit: fetchingMsg.key });

        // Thumbnail එක Buffer එකක් ලෙස ලබා ගැනීම සහ Sharp මඟින් රිසයිස් කිරීම
        let resizedThumb = null;
        try {
            const imgRes = await axios.get(decodedThumbUrl, { responseType: 'arraybuffer' });
            let thumbBuffer = Buffer.from(imgRes.data);
            resizedThumb = await resizeImaged(thumbBuffer, 200, 200);
        } catch (e) {
            console.log("Thumbnail error:", e.message);
            resizedThumb = null;
        }

        // සකස් කරගත් targetJid එකට Document එකක් ලෙස යැවීම
        await conn.sendMessage(targetJid, {
            document: { url: fileData.url },
            mimetype: "video/x-matroska",
            fileName: fileData.title || "Movie.mkv",
            jpegThumbnail: resizedThumb ? resizedThumb : undefined,
            caption: `🎬 *NAIJAPREY MOVIE DOWNLOADED* ⚡\n\n` +
                     `📦 *File Name:* ${fileData.title || 'N/A'}\n` +
                     `⚖️ *File Size:* ${fileSizeStr}\n` +
                     `✅ *Status:* Successfully Sent as Document\n\n` +
                     `> ${config.FOOTER || "Power By NadeenXDev"}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
        await conn.sendMessage(from, { delete: fetchingMsg.key });

    } catch (e) {
        if (e.response) {
            console.error("❌ API Download Error:", e.response.data);
        } else {
            console.error("❌ Download Error:", e.message);
        }
        reply("🚫 Movie Download Error: " + e.message);
    }
});
