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

// රූපවල ප්‍රමාණය 200x200 ට වෙනස් කරන function එක
async function resizeImage(buffer, width, height) {
  try {
    return await sharp(buffer).resize(width, height).toBuffer();
  } catch (e) {
    return buffer;
  }
}

//---------------------------------------------
// ANIMEPAHE SEARCH (LIST BUTTON MODE)
//---------------------------------------------
cmd({
  pattern: "apahe",
  react: '🔍',
  category: "anime",
  desc: "Search anime from AnimePahe using list buttons",
  use: ".apahe solo leveling",
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

        if (!q) return reply("*❗ කරුණාකර Anime නමක් ලබා දෙන්න.*");

        const searchApi = `https://api-dark-shan-yt.koyeb.app/anime/animepahe-search?q=${encodeURIComponent(q)}&apikey=${apikey}`;
        const res = (await axios.get(searchApi)).data;

        if (!res.status || !res.data || res.data.length === 0) {
            return reply("*❌ කිසිදු ප්‍රතිඵලයක් හමු නොවීය!*");
        }

        let msg = `_*ANIMEPAHE SEARCH RESULTS 🔍*_\n\n*Input:* ${q}`;
        
        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            const listRows = res.data.map(v => ({
                header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                title: v.title.substring(0, 60),
                description: "Tap to view episode list and details", // 👈 සරල විස්තරයක්
                id: `${prefix}apaheinfo ${v.session}` // 👈 rowId වෙනුවට 'id'
            }));

            await conn.sendMessage(from, {
                image: { url: res.data[0].thumbnail || config.LOGO },
                caption: msg,
                footer: config.FOOTER,
                optionText: "⛩️ Select Anime",
                optionTitle: "AnimePahe Results",
                nativeFlow: [{
                    text: "⛩️ Select Anime",
                    sections: [{ title: "Search Results", rows: listRows }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: res.data[0].thumbnail || config.LOGO },
                caption: msg,
                footer: config.FOOTER
            }, { quoted: mek });
        }
    } catch (e) {
        console.error(e);
        reply("*Error ❗*");
    }
});

//---------------------------------------------
// ANIMEPAHE INFO (LIST BUTTON MODE)
//---------------------------------------------
cmd({
  pattern: "apaheinfo",
  react: '📽️',
  category: "anime",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
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
        
        const infoApi = `https://api-dark-shan-yt.koyeb.app/anime/animepahe-info?id=${encodeURIComponent(q)}&apikey=${apikey}`;
        const response = await axios.get(infoApi);
        const res = response.data;

        if (!res.status || !res.data || !res.data.episodes || res.data.episodes.length === 0) {
            return reply("*❌ විස්තර ලබාගැනීමට නොහැකි විය!*");
        }

        const episodes = res.data.episodes;
        let infoMsg = `*⛩️ Anime Pahe Episode List*\n\n*📺 Total Episodes:* ${episodes.length}\n\n📂 *පහතින් එපිසෝඩ් එකක් තෝරන්න:*`;
        const episodeImage = episodes[0].snapshot || config.LOGO;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            let listRows = [];

            // මුලින්ම Download All Option එක ඇතුලත් කිරීම
            listRows.push({
                header: '',
                title: "📦 DOWNLOAD ALL EPISODES",
                description: "Get download links for all episodes",
                id: `${prefix}apaheall ${q}`
            });

            // එපිසෝඩ් ලැයිස්තුව List Rows වලට සකස් කිරීම
            episodes.forEach(ep => {
                listRows.push({
                    header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                    title: `Episode ${ep.episode}`,
                    description: "Tap to download this episode", // 👈 සරල විස්තරයක්
                    id: `${prefix}apahedl ${q}±${ep.session}±Episode ${ep.episode}±${ep.snapshot || config.LOGO}`
                });
            });

            await conn.sendMessage(from, {
                image: { url: episodeImage },
                caption: infoMsg,
                footer: config.FOOTER,
                optionText: "📥 Episode List",
                optionTitle: "Available Episodes",
                nativeFlow: [{
                    text: "📥 Episode List",
                    sections: [{ title: "Episodes", rows: listRows }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: episodeImage },
                caption: infoMsg,
                footer: config.FOOTER
            }, { quoted: mek });
        }
    } catch (e) {
        console.error("Info Error:", e.message);
        reply("*❌ තොරතුරු ලබාගැනීමේදී දෝෂයක් සිදු විය!*");
    }
});

//---------------------------------------------
// ANIMEPAHE DOWNLOADER
//---------------------------------------------
cmd({
    pattern: "apahedl",
    react: '📥',
    category: "anime",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return;
        const [mainSession, epSession, title, img] = q.split("±");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // උඹේ logic එකට අනුව slug එකටත් යන්නේ mainSession එක
        const dlApi = `https://api-dark-shan-yt.koyeb.app/anime/animepahe-strem?slug=${mainSession}&session=${epSession}&quality=best&audio=jpn&apikey=${apikey}`;
        const response = await axios.get(dlApi);
        const res = response.data;

        if (!res.status || !res.data || !res.data.url) {
            return reply("*❌ බාගත කිරීමේ ලින්ක් එක සොයාගත නොහැකි විය!*");
        }

        let thumb = null;
        try {
            const imgRes = await axios.get(img, { responseType: 'arraybuffer' });
            thumb = await resizeImage(Buffer.from(imgRes.data), 200, 200);
        } catch (e) { thumb = null; }

        await conn.sendMessage(config.JID || from, {
            document: { url: res.data.url },
            mimetype: "video/mp4",
            fileName: `${title}.mp4`,
            jpegThumbnail: thumb,
            caption: `⛩️ *AnimePahe Download*\n📺 *${title}*\n\n> *Nadeen-MD*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
    } catch (e) {
        console.error("Download Error:", e.message);
        reply("*❌ බාගත කිරීමේ දෝෂයක් සිදු විය!*");
    }
});

//---------------------------------------------
// DOWNLOAD ALL EPISODES
//---------------------------------------------
cmd({
    pattern: "apaheall",
    react: '📦',
    category: "anime",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return;
        const infoApi = `https://api-dark-shan-yt.koyeb.app/anime/animepahe-info?id=${encodeURIComponent(q)}&apikey=${apikey}`;
        const infoRes = (await axios.get(infoApi)).data;
        if (!infoRes.status || !infoRes.data.episodes) return reply("*❌ එපිසෝඩ් ලැයිස්තුව ලබාගත නොහැක!*");
        
        const episodes = infoRes.data.episodes;
        await reply(`🚀 *සියලුම එපිසෝඩ් (${episodes.length}) බාගත කිරීම ආරම්භ විය...*`);

        for (const ep of episodes) {
            try {
                const dlApi = `https://api-dark-shan-yt.koyeb.app/anime/animepahe-strem?slug=${q}&session=${ep.session}&quality=best&audio=jpn&apikey=${apikey}`;
                const dlRes = (await axios.get(dlApi)).data;

                if (dlRes.status && dlRes.data.url) {
                    let thumb = null;
                    try {
                        const imgRes = await axios.get(ep.snapshot, { responseType: 'arraybuffer' });
                        thumb = await resizeImage(Buffer.from(imgRes.data), 200, 200);
                    } catch (e) { thumb = null; }

                    await conn.sendMessage(config.JID || from, {
                        document: { url: dlRes.data.url },
                        mimetype: "video/mp4",
                        fileName: `Episode ${ep.episode}.mp4`,
                        jpegThumbnail: thumb,
                        caption: `⛩️ *AnimePahe All Episodes Upload*\n📺 *Episode ${ep.episode}*\n\n> *Nadeen-MD*`
                    });
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } catch (err) {
                console.log(`Error on ep ${ep.episode}:`, err.message);
            }
        }
        await reply("✅ *සියලුම එපිසෝඩ් සාර්ථකව යවා අවසන්!*");
    } catch (e) {
        console.error(e);
        reply("*❌ All Download ක්‍රියාවලියේ දෝෂයක්!*");
    }
});
