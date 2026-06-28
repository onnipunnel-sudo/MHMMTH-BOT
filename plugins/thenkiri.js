const { cmd,command } = require('../command');
const axios = require('axios');
const config = require('../config');
const sharp = require('sharp');
const { fetchJson, sleep, getBuffer } = require('../lib/functions');
const thenkey = process.env.NADEEN_KEY;
//---------------------------------------------
// THENKIRI SEARCH (LIST BUTTON MODE)
//---------------------------------------------
cmd({
    pattern: "thenkiri",
    react: '🔎',
    category: "movie",
    desc: "Search movies on thenkiri.com using list buttons",
    use: ".thenkiri <movie name>",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            // 🛠️ URL එක නවතම Workers URL එකට යාවත්කාලීන කරන ලදී
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii

        if (!q) return await reply('*කරුණාකර චිත්‍රපටයේ නම ඇතුළත් කරන්න! 🎬*');
        const { data } = await axios.get(`https://thenkiri-api.vercel.app/api/search?q=${encodeURIComponent(q)}`);
        
        if (!data.results || data.results.length === 0) return await reply('*කිසිදු ප්‍රතිඵලයක් හමු නොවීය ❌*');

        const msg = `_*THENKIRI SEARCH RESULTS*_\n\n*Input:* ${q}`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true") {
            const listRows = data.results.map(v => ({
                header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                title: v.title.substring(0, 60),
                description: `Tap to view details and download links`, // 👈 සරල විස්තරයක්
                id: `${prefix}theninfo ${v.url}±${v.image || config.LOGO}±${encodeURIComponent(v.title)}` // 👈 rowId වෙනුවට 'id'
            }));

            await conn.sendMessage(from, {
                image: { url: data.results[0]?.image || config.LOGO },
                caption: msg,
                footer: config.FOOTER,
                optionText: "🎥 Select Movie",
                optionTitle: "Thenkiri Results",
                nativeFlow: [{
                    text: "🎥 Select Movie",
                    sections: [{ title: "Choose a Movie 🎬", rows: listRows }]
                }],
                viewOnce: true // 👈 එක පාරක් ක්ලික් කළ පසු මැසේජ් එක Expire වීමට
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: msg,
                footer: config.FOOTER
            }, { quoted: mek });
        }
    } catch (e) { reply('🚫 Search Error: ' + e.message); }
});

// ==================== 1. THENKIRI INFO & QUALITY LIST SELECTOR ====================
cmd({
    pattern: "theninfo",
    react: "🎥",
    category: "movie",
    desc: "View movie/series info and select download qualities via list button",
    filename: __filename
}, async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii

        if (!q) return reply("*❗ Missing data input!*");

        const [url, thumb, rawTitle] = q.split("±");
        const decodedTitle = rawTitle ? decodeURIComponent(rawTitle).replace(/[±&]/g, "").trim() : "Movie/Series";
        
        const { data } = await axios.get(`https://thenkiri-api.vercel.app/api/info?url=${encodeURIComponent(url.trim())}`);
        
        let msg = `🎬 *${decodedTitle}*\n\n*🧿Description:* ${data.description || 'No Description Available'}\n\n⬇️ *Select download option from the list below*`;
        const movieImage = data.image || thumb || config.LOGO;

        if (!data.download_links || data.download_links.length === 0) {
            return reply("❌ *No download links available for this movie!*");
        }

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            let listRows = [];

            // 🔥 1. ALL EPISODES / PACK DOWNLOAD OPTION (ලැයිස්තුවේ ඉහළින්ම පෙන්වයි)
            listRows.push({
                header: '',
                title: "📦 ALL EPISODES / PACK DOWNLOAD",
                description: `Select to download all available links/episodes at once`,
                id: `${prefix}thenall ${encodeURIComponent(url)}±${movieImage}±${encodeURIComponent(decodedTitle)}`
            });

            // 🔹 2. INDIVIDUAL DOWNLOAD QUALITIES / EPISODES
            data.download_links.forEach((v) => {
                let rawSize = Array.isArray(v.size) ? v.size[0] : (v.size || "");
                let cleanSize = rawSize.toString().replace(/This Video is/gi, "").trim();
                
                let rawLabel = Array.isArray(v.text) ? v.text[0] : v.text;
                let buttonLabel = `${rawLabel || 'Download'} ${cleanSize ? '[' + cleanSize + ']' : ''}`;
                let finalDlUrl = Array.isArray(v.url) ? v.url[0] : v.url;

                listRows.push({
                    header: '',
                    title: buttonLabel.substring(0, 60),
                    description: `Tap to download this quality/episode directly`,
                    id: `${prefix}thendl ${finalDlUrl}±${movieImage}±${encodeURIComponent(decodedTitle)}`
                });
            });

            await conn.sendMessage(from, {
                image: { url: movieImage },
                caption: msg,
                footer: config.FOOTER,
                optionText: "⬇️ Select Download Option",
                optionTitle: "Available Downloads",
                nativeFlow: [{
                    text: "⬇️ Select Download Option",
                    sections: [{ title: "Download Options", rows: listRows }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: movieImage },
                caption: msg,
                footer: config.FOOTER
            }, { quoted: mek });
        }
    } catch (err) { 
        console.log(err);
        reply("🚫 *Error:* " + err.message); 
    }
});

// ==================== 2. THENKIRI FINAL FILE DOWNLOADER ====================
cmd({
    pattern: "thendl",
    react: "⬇️",
    category: "movie",
    filename: __filename
}, async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii

        if (!q) return;
        const [url, thumb, title] = q.split("±");
        const decodedTitle = decodeURIComponent(title).replace(/[±&]/g, "").trim();
       
        const fetchingMsg = await conn.sendMessage(from, { text: '🚀 *Downloading File...*' }, { quoted: mek });

        // Download API Call
        const { data } = await axios.get(`https://nadeen-apis.koyeb.app/api/thenkiri/download?url=${encodeURIComponent(url.trim())}&key=${thenkey}`);
        
        if (!data.downloadLink) {
            return await conn.sendMessage(from, { text: '❌ *සෘජු බාගත කිරීමේ ලින්ක් එක සොයාගත නොහැක.*' }, { edit: fetchingMsg.key });
        }

        await conn.sendMessage(from, { text: '⬆️ *Uploading File...*' }, { edit: fetchingMsg.key });

        // Thumbnail එක Buffer එකක් ලෙස ලබා ගැනීම
        let thumbnailBuffer = null;
        try {
            const res = await axios.get(thumb, { responseType: 'arraybuffer' });
            thumbnailBuffer = await sharp(res.data)
                .resize(200, 200, { fit: 'cover' }) 
                .toFormat('jpeg')                   
                .jpeg({ quality: 80 })              
                .toBuffer();
        } catch (e) {
            console.log("Thumbnail processing error:", e.message);
            thumbnailBuffer = null; 
        }
console.log(`🧶Thenkiri dl: ${data.downloadLink}`);
        // ෆයිල් එක JID එකට හෝ From එකට යැවීම
        await conn.sendMessage(config.JID || from, {
            document: { url: data.downloadLink },
            caption: `🎬 *${decodedTitle}*\n\n✅ *Downloaded via Thenkiri*\n\n${config.FOOTER}`,
            fileName: `${decodedTitle}.mkv`,
            mimetype: "video/mp4",
            jpegThumbnail: thumbnailBuffer 
        }, { quoted: mek });
        
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
        await conn.sendMessage(from, { delete: fetchingMsg.key });

    } catch (e) {
        reply('🚫 Download Error: ' + e.message);
        console.log("🚫Up error:", e.message);
    }
});

// ==================== 3. THENKIRI ALL EPISODES / PACK DOWNLOADER (NEW) ====================
cmd({
    pattern: "thenall",
    react: "📦",
    category: "movie",
    desc: "Download all episodes or available links at once",
    filename: __filename
}, async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii

        if (!q) return reply("*❗ Missing data input!*");
        const [infoUrl, thumb, title] = q.split("±");
        const decodedTitle = decodeURIComponent(title).replace(/[±&]/g, "").trim();

        // මුලින්ම info API එකෙන් සියලුම ලින්ක්ස් ලබාගැනීම
        const { data } = await axios.get(`https://thenkiri-api.vercel.app/api/info?url=${encodeURIComponent(decodeURIComponent(infoUrl).trim())}`);
        
        if (!data.download_links || data.download_links.length === 0) {
            return reply("❌ *No links found to batch download!*");
        }

        const totalLinks = data.download_links.length;
        await reply(`📦 *Starting Pack Download...*\n\n🎬 *Title:* ${decodedTitle}\n🔗 *Total Files:* ${totalLinks}\n\n_All Epi Download Start.._`);

        // Thumbnail එක මුලින්ම Buffer එකක් කර තබා ගැනීම (සියලුම ෆයිල්ස් වලට පොදුවේ යැවීමට)
        let thumbnailBuffer = null;
        try {
            const res = await axios.get(thumb || data.image, { responseType: 'arraybuffer' });
            thumbnailBuffer = await sharp(res.data)
                .resize(200, 200, { fit: 'cover' })
                .toFormat('jpeg')
                .jpeg({ quality: 80 })
                .toBuffer();
        } catch (e) {
            console.log("Pack thumbnail processing error:", e.message);
        }

        // ලූප් එකක් මගින් සියලුම ලින්ක්ස් එකින් එක බාගත කිරීම
        for (let i = 0; i < totalLinks; i++) {
            try {
                let currentLink = data.download_links[i];
                let finalDlUrl = Array.isArray(currentLink.url) ? currentLink.url[0] : currentLink.url;
                let rawLabel = Array.isArray(currentLink.text) ? currentLink.text[0] : currentLink.text;
                
                // ෆයිල් එකේ නම සකස් කිරීම
                let fileLabel = `${decodedTitle} - ${rawLabel || `Part ${i + 1}`}`;

                // Download API එකෙන් සෘජු ලින්ක් එක ගැනීම
                const dlRes = await axios.get(`https://nadeen-apis.koyeb.app/api/thenkiri/download?url=${encodeURIComponent(finalDlUrl.trim())}&key=${thenkey}`);
                console.log(`🧶Thenkiri dl: ${dlRes.data.downloadLink}`);
                if (dlRes.data && dlRes.data.downloadLink) {
                    // Document එකක් ලෙස යැවීම
                    await conn.sendMessage(config.JID || from, {
                        document: { url: dlRes.data.downloadLink },
                        caption: `🎬 *${fileLabel}*\n\n📦 *Pack:* (${i + 1}/${totalLinks})\n✅ *Downloaded via Thenkiri Pack DL*\n\n${config.FOOTER}`,
                        fileName: `${fileLabel}.mkv`,
                        mimetype: "video/mp4",
                        jpegThumbnail: thumbnailBuffer
                    });
                } else {
                    await conn.sendMessage(from, { text: `❌ Skipping (${i + 1}/${totalLinks}): Direct link not found for ${rawLabel}` });
                }
                
                // WhatsApp සේවාදායකය බ්ලොක් වීම වැළැක්වීමට තත්පර 2ක විරාමයක් (Delay) තැබීම
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (singleErr) {
                console.log(`Error downloading link index ${i}:`, singleErr.message);
                await conn.sendMessage(from, { text: `⚠️ Error downloading link ${i + 1}: ${singleErr.message}` });
            }
        }

        await conn.sendMessage(from, { text: `✅ *Pack Download Completed Successfully!* \n\n🎬 ${decodedTitle}\n📦 All ${totalLinks} options processed.` }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("🚫 *Pack Download Error:* " + e.message);
    }
});
