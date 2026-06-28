const config = require('../config'),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
  sharp = require('sharp'),
  fetch = (..._0x528df7) =>
    import('node-fetch').then(({ default: _0x1863f6 }) =>
      _0x1863f6(..._0x528df7)
    ),
  { Buffer } = require('buffer');

const apikey = process.env.SHAN_KEY;

async function resizeImage(buffer, width, height) {
  try {
    return await sharp(buffer).resize(width, height).toBuffer();
  } catch (e) {
    return buffer;
  }
}

//---------------------------------------------
//---------------------------------------------
// VIKI SEARCH (LIST BUTTON MODE)
//---------------------------------------------
cmd({
  pattern: "viki",
  react: '🏮',
  category: "movie",
  desc: "Search TV Series from Viki using list buttons",
  use: ".viki eat run love",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }

        if (!q) return reply("*❗ Please provide a TV Series name.*");

        const searchApi = `https://api-dark-shan-yt.koyeb.app/movie/viki-search?q=${encodeURIComponent(q)}&apikey=${apikey}`;
        const res = (await axios.get(searchApi)).data;

        if (!res.status || !res.data || res.data.length === 0) {
            return reply("*❌ No results found!*");
        }

        let msg = `_*VIKI TV SERIES SEARCH 🏮*_\n\n*Input:* ${q}`;

        if (config.BUTTON === "true") {
            const listRows = res.data.map(v => {
                return {
                    header: '',
                    title: v.title,
                    description: `Tap to view episode list`,
                    id: `${prefix}vikiinfo ${v.url}`
                };
            });

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: msg,
                footer: config.FOOTER,
                optionText: "Select Result 🔢",
                optionTitle: "Viki Results",
                nativeFlow: [{
                    text: "Select Result 🔢",
                    sections: [{ title: "Viki Results", rows: listRows }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } else {
            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: msg,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        reply("*Error occurred during search!*");
    }
});

//---------------------------------------------
// VIKI INFO & EPISODE LIST
//---------------------------------------------
cmd({
  pattern: "vikiinfo",
  react: '📽️',
  category: "movie",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return;

        const infoApi = `https://api-dark-shan-yt.koyeb.app/movie/viki-info?url=${encodeURIComponent(q)}&apikey=${apikey}`;
        const res = (await axios.get(infoApi)).data;

        if (!res.status || !res.data || !res.data.episodeList) {
            return reply("*❌ Failed to fetch details!*");
        }

        const d = res.data;
        let infoMsg = `*🎬 Series Title:* ${d.title}\n` +
                      `*📺 Episodes:* ${d.episode_count}\n` +
                      `*⭐ Rating:* ${d.review_stats.average_rating}\n\n` +
                      `*Select an episode below:*`;

        if (config.BUTTON === "true") {
            let epRows = d.episodeList.map(ep => {
                return {
                    header: '',
                    title: `Episode ${ep.episode}`,
                    description: `Download Episode ${ep.episode}`,
                    id: `${prefix}vikiq ${ep.url}±${d.title}±${ep.episode}±${ep.poster}`
                };
            });

            epRows.unshift({
                header: '',
                title: "📦 DOWNLOAD ALL EPISODES",
                description: "Get download links for all episodes",
                id: `${prefix}vikiall ${q}`
            });

            await conn.sendMessage(from, {
                image: { url: d.poster },
                caption: infoMsg,
                footer: config.FOOTER,
                optionText: "Choose Episode 🔢",
                optionTitle: "Episode Selector",
                nativeFlow: [{
                    text: "Choose Episode 🔢",
                    sections: [{ title: "Available Episodes", rows: epRows }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } else {
            await conn.sendMessage(from, {
                image: { url: d.poster },
                caption: infoMsg,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.error(e);
        reply("*❌ Error fetching info!*");
    }
});

//---------------------------------------------
// QUALITY SELECTOR (DIRECT BUTTONS MODE)
//---------------------------------------------
cmd({
    pattern: "vikiq",
    react: '🎞️',
    category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return;
        const [url, title, epNum, img] = q.split("±");

        const dlApi = `https://api-dark-shan-yt.koyeb.app/movie/viki-download?url=${encodeURIComponent(url)}&apikey=${apikey}`;
        const res = (await axios.get(dlApi)).data;

        if (!res.status || !res.data || !res.data.download) return reply("*❌ No download links found!*");

        const videoList = res.data.download.video;
        
        let filteredVideos = videoList.filter(v => v.section !== "pre" && v.drm === false);
        if (filteredVideos.length === 0) filteredVideos = videoList.filter(v => v.section !== "pre");

        if (filteredVideos.length === 0) return reply("*❌ No downloadable links found for this episode!*");

        let msg = `🎬 *${title}* - Episode ${epNum}\n\nSelect video quality below:`;

        if (config.BUTTON === "true") {
            let nativeButtons = [];

            filteredVideos.slice(0, 10).forEach(v => {
                let rawQ = v.quality.split('x')[1] || v.quality;
                let displayQ = rawQ.includes("2") ? "240p" : rawQ.includes("3") ? "360p" : rawQ.includes("4") ? "480p" : rawQ.includes("7") ? "720p" : rawQ.includes("10") ? "1080p" : rawQ + "p";

                nativeButtons.push({
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: `🎞️ ${displayQ} Quality`,
                        id: `${prefix}vikidl ${v.url}±${title}±${epNum}±${img}±${displayQ}`
                    })
                });
            });

            await conn.sendMessage(from, {
                image: { url: img || config.LOGO },
                caption: msg,
                footer: config.FOOTER,
                nativeFlow: nativeButtons,
                viewOnce: true
            }, { quoted: mek });

        } else {
            await conn.sendMessage(from, {
                image: { url: img || config.LOGO },
                caption: msg,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) { 
        reply("*❌ Quality selection error!*"); 
    }
});
//---------------------------------------------
// FINAL DOWNLOADER
//---------------------------------------------
cmd({
    pattern: "vikidl",
    react: '📥',
    category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return;
        const [url, title, epNum, img, displayQ] = q.split("±");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        let thumb = null;
        try {
            const imgRes = await axios.get(img, { responseType: 'arraybuffer' });
            thumb = await resizeImage(Buffer.from(imgRes.data), 200, 200);
        } catch (e) { thumb = null; }

        await conn.sendMessage(config.JID || from, {
            document: { url: url },
            mimetype: "video/mp4",
            fileName: `${title} - E${epNum} (${displayQ})-NADEEN MD.mp4`,
            jpegThumbnail: thumb,
            caption: `🎬 *Series:* ${title}\n📺 *Episode:* ${epNum}\n💎 *Quality:* \`[${displayQ}]\`\n\n> *Nadeen-MD*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
    } catch (e) {
        reply("*❌ Error uploading video!*");
    }
});

//---------------------------------------------
// DOWNLOAD ALL EPISODES
//---------------------------------------------
cmd({
    pattern: "vikiall",
    react: '📦',
    category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return;

        const infoRes = (await axios.get(`https://api-dark-shan-yt.koyeb.app/movie/viki-info?url=${encodeURIComponent(q)}&apikey=${apikey}`)).data;
        const d = infoRes.data;

        await reply(`🚀 *Starting download for all episodes (${d.episodeList.length}). Please wait...*`);

        for (const ep of d.episodeList) {
            try {
                const dlRes = (await axios.get(`https://api-dark-shan-yt.koyeb.app/movie/viki-download?url=${encodeURIComponent(ep.url)}&apikey=${apikey}`)).data;
                if (dlRes.status && dlRes.data.download) {
                    const videoList = dlRes.data.download.video;
                    // Fallback logic for All Download as well
                    let v = videoList.find(v => v.section !== "pre" && v.drm === false);
                    if (!v) v = videoList.find(v => v.section !== "pre");

                    if (v && v.url) {
                        let rawQ = v.quality.split('x')[1] || v.quality;
                        let displayQ = rawQ.includes("2") ? "240p" : rawQ.includes("3") ? "360p" : rawQ.includes("4") ? "480p" : rawQ.includes("7") ? "720p" : rawQ.includes("10") ? "1080p" : rawQ + "p";

                        await conn.sendMessage(config.JID || from, {
                            document: { url: v.url },
                            mimetype: "video/mp4",
                            fileName: `${d.title} - E${ep.episode} (${displayQ})- NADEEN MD.mp4`,
                            caption: `🎬 *${d.title}*\n📺 *Episode:* ${ep.episode}\n💎 *Quality:* \`[${displayQ}]\`\n\n> *All Episodes Uploading...*`
                        });
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }
            } catch (err) { console.log(`Error ep ${ep.episode}:`, err.message); }
        }
        await reply("✅ *All episodes have been uploaded successfully!*");
    } catch (e) {
        reply("*❌ Error in All Download process!*");
    }
});
