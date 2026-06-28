const config = require('../config')
const { cmd, commands } = require('../command')
const axios = require('axios'); 
const sharp = require('sharp');
const fg = require('api-dylux');
const fetch = require('node-fetch');

let isUploadingAni = false;
const FOOTER_TEXT = `${config.FOOTER}`

async function getResizedThumb(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        return await sharp(buffer)
            .resize(200, 200, { fit: 'cover' }) 
            .jpeg({ quality: 80 }) 
            .toBuffer();
    } catch (e) {
        console.error("Sharp Error:", e.message);
        return null;
    }
}

// ==================== 1. ANIME SEARCH (LIST BUTTON MODE) ====================
cmd({
    pattern: "anime",
    react: '🔍',
    category: "movie",
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

        if (!q) return await reply('*Please enter an Anime name! ⛩️*');

        const { data } = await axios.get(`https://www.movanest.xyz/v2/animeko/search?q=${encodeURIComponent(q)}&your_api_key=movanest-key9HJRIO45DC`);

        if (!data || !data.results || !Array.isArray(data.results) || data.results.length === 0) {
            return await reply('*No results found ❌*');
        }

        let msg = `_*ANIMEKO SEARCH RESULTS ⛩️*_\n\n*🔎 Input:* ${q}\n\n*Select an anime from the list below.*`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            const listRows = data.results.map(v => ({
                header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                title: v.title.trim().substring(0, 60),
                description: "Tap to view episodes and details", // 👈 සරල විස්තරයක්
                id: `${prefix}aniinfo ${v.url}` // 👈 rowId වෙනුවට 'id'
            }));

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: msg,
                footer: config.FOOTER,
                optionText: "Click to View Results 🎬",
                optionTitle: "Animeko Results",
                nativeFlow: [{
                    text: "Click to View Results 🎬",
                    sections: [{ title: "[Available Anime]", rows: listRows }]
                }],
                viewOnce: true
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

    } catch (e) { reply('🚩 *Error during search!*'); }
});

// ==================== 2. ANIME INFO & EPISODES (LIST BUTTON MODE) ====================
cmd({
    pattern: "aniinfo",
    category: "movie",
    react: "⛩️",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii

        const { data } = await axios.get(`https://www.movanest.xyz/v2/animeko/detail?url=${encodeURIComponent(q)}&your_api_key=movanest-key9HJRIO45DC`);
        const anime = data.results;

        if (!anime) return await reply("*Couldn't find Anime info!*");
        const posterUrl = anime.imageUrl.cover || config.LOGO;

        let captionText = `*🍿 𝗧ɪᴛ𝗹𝗲 ➮* *_${anime.title}_*\n*🎭 𝐆𝐞𝐧𝐫𝐞𝐬 ➮* _${anime.genres || 'N/A'}_\n\n*Select an Option or Episode below:*`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            let listRows = [];

            // 1. Details Card Option එක එකතු කිරීම
            listRows.push({
                header: '',
                title: "📋 View Details Card",
                description: "Get full studio, season, and status details",
                id: `${prefix}anidetails ${q}`
            });

            // 2. Download All Option එක එකතු කිරීම
            listRows.push({
                header: '',
                title: "📥 Download All Episodes",
                description: "Batch download all episodes together",
                id: `${prefix}aniallquality ${q}±${anime.imageUrl.cover}±${anime.title}`
            });

            // 3. එපිසෝඩ් ලැයිස්තුව එකතු කිරීම (ලැයිස්තුව දිග වැඩි වීම වැළැක්වීමට උපරිම 50ක් දක්වා)
            if (anime.episodes && anime.episodes.length > 0) {
                let cleanAnimeTitle = anime.title ? anime.title.replace(/[±&]/g, "").trim() : 'Anime';
                anime.episodes.slice(0, 50).forEach(ep => {
                    listRows.push({
                        header: '',
                        title: `${ep.title}`.trim(),
                        description: "Tap to select video quality",
                        id: `${prefix}aniquality ${ep.url}±${anime.imageUrl.cover}±${ep.title}±${q}`
                    });
                });
            }

            await conn.sendMessage(from, {
                image: { url: posterUrl },
                caption: captionText,
                footer: config.FOOTER,
                optionText: "🎬 Select Episode / Option",
                optionTitle: "Animeko Menu",
                nativeFlow: [{
                    text: "🎬 Select Episode / Option",
                    sections: [{ title: "Options & Episodes", rows: listRows }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: posterUrl },
                caption: captionText,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) { reply('🚩 *Error fetching episodes!*'); }
});

// ==================== 3. DETAILS CARD ====================
cmd({
    pattern: "anidetails",
    react: '📋',
    category: "movie",
    desc: "Rich Anime info card",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii

        const { data } = await axios.get(`https://www.movanest.xyz/v2/animeko/detail?url=${encodeURIComponent(q)}&your_api_key=movanest-key9HJRIO45DC`);
        const anime = data.results;

        let msg = `*✨ 𝐀𝐍𝐈𝐌𝐄 𝐃𝐄𝐓𝐀𝐈𝐋𝐒 ✨*\n\n` +
                  `*🍿 𝐓ɪ𝐓ʟ𝐄 ➮* *_${anime.title || 'N/A'}_*\n` +
                  `*🌟 𝐒𝐭𝐚𝐭𝐮𝐬 ➮* _${anime.status || 'N/A'}_\n` +
                  `*🎞️ 𝐓𝐲𝐩𝐞 ➮* _${anime.type || 'N/A'}_\n` +
                  `*⚡ 𝐒𝐞𝐚𝐬𝐨𝐧 ➮* _${anime.season || 'N/A'}_\n` +
                  `*⛩ 𝐒𝐭𝐮𝐝𝐢𝐨 ➮* _${anime.studio || 'N/A'}_\n` +
                  `*🎭 𝐆𝐞𝐧𝐫𝐞𝐬 ➮* _${anime.genres || 'N/A'}_\n\n` +
                  `${config.FOOTER}`;

        await conn.sendMessage(config.JID || from, { 
            image: { url: anime.imageUrl.cover }, 
            caption: msg 
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (e) { reply('🚩 *Error fetching details card!*'); }
});

// ==================== 4. QUALITY SELECTION (DIRECT BUTTONS MODE) ====================
cmd({
    pattern: "aniquality",
    react: "🎥",
    category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii

        const [epUrl, imgLink, title, mainUrl] = q.split("±");
        const { data } = await axios.get(`https://www.movanest.xyz/v2/animeko/stream?url=${encodeURIComponent(epUrl)}&your_api_key=movanest-key9HJRIO45DC`);

        let nativeButtons = [];

        if (data.results && data.results.downloadLinks) {
            data.results.downloadLinks.forEach(item => {
                const quality = item.quality; 
                item.links.forEach(dl => {
                    if (dl.name === "PixelD") {
                        let cleanTitle = title ? title.replace(/[±&]/g, "").trim() : 'Episode';
                        nativeButtons.push({
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: `📥 PixelD - ${quality}`.substring(0, 20),
                                id: `${prefix}anidl ${dl.url}±${imgLink}±${cleanTitle}±${mainUrl}±${quality}`
                            })
                        });
                    }
                });
            });
        }

        if (nativeButtons.length === 0) return await reply('🚩 *No PixelD download links found for this episode!*');

        let captionText = `*🎥 Select Quality for:* \n_${title}_\n`;

        // ================= WORKING DIRECT BUTTON MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            await conn.sendMessage(from, {
                image: { url: imgLink || config.LOGO },
                caption: captionText,
                footer: config.FOOTER,
                nativeFlow: nativeButtons.slice(0, 10), // Quick Reply බොත්තම් උපරිම 10 සීමාවට යටත්ව
                viewOnce: true
            }, { quoted: mek });
        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: imgLink || config.LOGO },
                caption: captionText,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) { 
        console.error("Error Detail:", e);
        reply(`🚩 Error fetching qualities!`); 
    }
});

// ==================== 5. ALL EPISODES QUALITY SELECTION (DIRECT BUTTONS MODE) ====================
cmd({
    pattern: "aniallquality",
    react: "📑",
    category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii

        const [mainUrl, imgLink, title] = q.split("±");
        const detailRes = await axios.get(`https://www.movanest.xyz/v2/animeko/detail?url=${encodeURIComponent(mainUrl)}&your_api_key=movanest-key9HJRIO45DC`);

        if (!detailRes.data.results || !detailRes.data.results.episodes || detailRes.data.results.episodes.length === 0) {
            return await reply("🚩 No episodes found to fetch quality!");
        }

        const firstEpUrl = detailRes.data.results.episodes[0].url;
        const streamRes = await axios.get(`https://www.movanest.xyz/v2/animeko/stream?url=${encodeURIComponent(firstEpUrl)}&your_api_key=movanest-key9HJRIO45DC`);

        let nativeButtons = [];
        
        if (streamRes.data.results && streamRes.data.results.downloadLinks) {
            streamRes.data.results.downloadLinks.forEach(dl => {
                const hasPixelD = dl.links.some(link => link.name === "PixelD");
                
                if (hasPixelD) {
                    let cleanTitle = title ? title.replace(/[±&]/g, "").trim() : 'Anime';
                    nativeButtons.push({
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: `📥 ${dl.quality}`,
                            id: `${prefix}anidlall ${mainUrl}±${imgLink}±${cleanTitle}±${dl.quality}`
                        })
                    });
                }
            });
        }

        if (nativeButtons.length === 0) return await reply("🚩 No PixelD qualities found in API response.");

        let captionText = `*📥 DOWNLOAD ALL EPISODES*\n\n*Anime:* ${title}\n*Select the quality for all episodes:*\n`;

        // ================= WORKING DIRECT BUTTON MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            await conn.sendMessage(from, {
                image: { url: imgLink || config.LOGO },
                caption: captionText,
                footer: config.FOOTER,
                nativeFlow: nativeButtons.slice(0, 10),
                viewOnce: true
            }, { quoted: mek });
        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: imgLink || config.LOGO },
                caption: captionText,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) { 
        console.error("Error Detail:", e);
        reply(`🚩 Error fetching quality list!`); 
    }
});
// ==================== 6. DOWNLOAD ALL EXECUTION ====================
cmd({
    pattern: "anidlall",
    react: "⏳",
     category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse.vercel.app/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii



        const [mainUrl, imgLink, title, selectedQuality] = q.split("±");
        await reply(`\*🚀 Downloading all episodes in ${selectedQuality}...\*`);

        const { data: detailData } = await axios.get(`https://www.movanest.xyz/v2/animeko/detail?url=${encodeURIComponent(mainUrl)}&your_api_key=movanest-key9HJRIO45DC`);

        for (const ep of detailData.results.episodes) {
            const { data: streamData } = await axios.get(`https://www.movanest.xyz/v2/animeko/stream?url=${encodeURIComponent(ep.url)}&your_api_key=movanest-key9HJRIO45DC`);

            let downloadUrl = null;
            // PixelD සබැඳිය සොයාගැනීම
            for (const item of streamData.results.downloadLinks) {
                if (item.quality === selectedQuality) {
                    const pixelLink = item.links.find(l => l.name === "PixelD");
                    if (pixelLink) {
                        downloadUrl = pixelLink.url.replace("/u/", "/api/file/");
                    }
                }
            }
const resizedThumb = await getResizedThumb(imgLink);
            if (downloadUrl) {
                await conn.sendMessage(config.JID || from, { 
                    document: { url: downloadUrl }, 
                    fileName: "⛩️ " + ep.title + ".mp4", 
                    mimetype: "video/mp4",
                    jpegThumbnail: resizedThumb,
                    caption: `🎬 \*𝗡𝗮𝗺𝗲 :\* ${ep.title}\n\n\`[${selectedQuality}]\`\n\n${config.FOOTER}`
                });
                await new Promise(resolve => setTimeout(resolve, 3000)); // Rate limit මගහැරීමට
            }
        }
        await reply(`\*✅ All episodes sent successfully!\*`);
    } catch (e) { 
        console.error(e);
        reply('\*Critical error in Download All!\*'); 
    }
});
// ==================== 7. FINAL INDIVIDUAL DOWNLOAD ====================
cmd({
    pattern: "anidl",
    react: "⬇️",
     category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse.vercel.app/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii



        // q.split("±") මගින් දත්ත ලබාගැනීම
        let [downloadUrl, imgLink, title, mainUrl, quality] = q.split("±");

        // PixelD link එකක් නම් URL එක වෙනස් කිරීම
        if (downloadUrl.includes("pixeldrain.com/u/")) {
            downloadUrl = downloadUrl.replace("/u/", "/api/file/");
        }
const resizedThumb = await getResizedThumb(imgLink);
        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });

        await conn.sendMessage(config.JID || from, { 
            document: { url: downloadUrl }, 
            fileName: title.trim() + ".mp4", 
            mimetype: "video/mp4",
            jpegThumbnail: resizedThumb,
            caption: `🎬 *𝗡𝗮𝗺𝗲 :* ${title}\n\n\`[${quality}]\`\n\n${config.FOOTER}`
        });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (e) { 
        console.error(e);
        reply('\*Download Error !!\*'); 
    }
});
