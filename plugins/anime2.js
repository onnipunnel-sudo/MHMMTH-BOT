const config = require('../config'),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
  sharp = require('sharp'),
  { Sticker, StickerTypes } = require('wa-sticker-formatter'),
  fetch = (..._0x528df7) =>
    import('node-fetch').then(({ default: _0x1863f6 }) =>
      _0x1863f6(..._0x528df7)
    ),
  { Buffer } = require('buffer'),
  fs = require('fs');

const apikey = process.env.SHAN_KEY;

// රූපවල ප්‍රමාණය වෙනස් කිරීමට භාවිතා කරන function එක
async function resizeImage(buffer, width, height) {
  try {
    return await sharp(buffer).resize(width, height).toBuffer();
  } catch (e) {
    return buffer;
  }
}

//---------------------------------------------
// ANIME SEARCH (LIST BUTTON MODE)
//---------------------------------------------
cmd({
  pattern: "anime2",
  react: '🏮',
  category: "anime",
  desc: "AnimeHeaven search using list buttons",
  use: ".ah solo leveling",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            // 🛠️ URL එක නවතම Cloudflare Workers URL එකට යාවත්කාලීන කරන ලදී
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }

        if (!q) return reply("*❗ සෙවිය යුතු Anime නම ඇතුළත් කරන්න (උදා: .ah solo leveling)*");

        const api = `https://api-dark-shan-yt.koyeb.app/anime/animeheaven-search?q=${encodeURIComponent(q)}&apikey=${apikey}`;
        const res = (await axios.get(api)).data;

        if (!res.status || !res.data || res.data.length === 0) {
            return reply("*❌ කිසිදු ප්‍රතිඵලයක් හමු නොවීය!*");
        }

        let cap = `_*ANIMEHEAVEN SEARCH RESULTS 🏮*_\n\n*Input:* ${q}`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            const listRows = res.data.map(v => ({
                header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                title: v.title.substring(0, 60),
                description: "Tap to view details and episode list", // 👈 සරල විස්තරයක්
                id: `${prefix}ahdl ${v.url}` // 👈 rowId වෙනුවට 'id'
            }));

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: cap,
                footer: config.FOOTER,
                optionText: "🎥 Select Anime",
                optionTitle: "Anime Heaven Results",
                nativeFlow: [{
                    text: "🎥 Select Anime",
                    sections: [{ title: "Search Results", rows: listRows }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: cap,
                footer: config.FOOTER
            }, { quoted: mek });
        }
    } catch (e) {
        console.log(e);
        reply("*Error ❗*");
    }
});

//---------------------------------------------
// ANIME INFO & EPISODE SELECTOR (LIST BUTTON MODE)
//---------------------------------------------
cmd({
  pattern: "ahdl",
  react: "📽️",
  category: "anime",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        if (!q) return;
        
        // 🧩 ආරක්ෂාව සඳහා මෙහිද අවසර පරීක්ෂාව සිදු කරයි
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
        
        const api = `https://api-dark-shan-yt.koyeb.app/anime/animeheaven-info?url=${encodeURIComponent(q)}&apikey=${apikey}`;
        const res = (await axios.get(api)).data;
        const d = res.data;

        if (!d || !d.title) return reply("*❌ තොරතුරු ලබාගැනීමට නොහැකි විය!*");

        // 1. මුලින්ම විස්තර සහ පින්තූරය සාමාන්‍ය පණිවිඩයක් ලෙස යැවීම
        let infoMsg = `*🏮 Title:* ${d.title}\n` +
                      `*📅 Year:* ${d.year || 'N/A'}\n` +
                      `*⭐ Score:* ${d.score || 'N/A'}\n` +
                      `*📺 Episodes:* ${d.episodes || 'N/A'}\n\n` +
                      `*📝 Description:* ${d.description ? d.description.slice(0, 500) : 'No description available.'}`;

        const animeImage = d.image || config.LOGO;

        await conn.sendMessage(from, { 
            image: { url: animeImage }, 
            caption: infoMsg,
            footer: config.FOOTER 
        }, { quoted: mek });

        // 2. එපිසෝඩ් තේරීමට වෙනම Selector (List Button) එකක් යැවීම
        let selectorMsg = `📂 *පහතින් එපිසෝඩ් එකක් තෝරන්න හෝ සියල්ල බාගත කරන්න*`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            let listRows = [];

            // මුලින්ම Download All Option එක ඇතුලත් කිරීම
            listRows.push({
                header: '',
                title: "📦 DOWNLOAD ALL EPISODES",
                description: "Get download links for all episodes",
                id: `${prefix}ahall ${q}`
            });

            // එපිසෝඩ් ලැයිස්තුව List Rows වලට එකතු කිරීම
            if (d.episodeList && d.episodeList.length > 0) {
                d.episodeList.forEach(ep => {
                    let cleanAnimeTitle = d.title ? d.title.replace(/[±&]/g, "").trim() : 'Anime';
                    listRows.push({
                        header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                        title: `Episode ${ep.episode}`,
                        description: "Tap to view download qualities", // 👈 සරල විස්තරයක්
                        id: `${prefix}ahv ${ep.key}±${cleanAnimeTitle}±${ep.episode}±${animeImage}`
                    });
                });
            }

            await conn.sendMessage(from, {
                text: selectorMsg,
                footer: config.FOOTER,
                optionText: "📥 Episode List",
                optionTitle: "Available Episodes",
                nativeFlow: [{
                    text: "📥 Episode List",
                    sections: [{ title: "Options & Episodes", rows: listRows }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                text: selectorMsg + `\n\n*(Buttons Off Mode - Use the select options manually if needed)*`,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.log(e);
        reply("*❌ දෝෂයක් සිදු විය!*");
    }
});
//---------------------------------------------
// DOWNLOAD VIDEO (Command: .ahv)
//---------------------------------------------
cmd({
    pattern: "ahv",
    react: "📥",
    category: "anime",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return;
        const [key, title, epNum, img] = q.split("±");
        
        const api = `https://api-dark-shan-yt.koyeb.app/anime/animeheaven-download?key=${key}&apikey=${apikey}`;
        const res = (await axios.get(api)).data;

        if (!res.status || !res.data.download) return reply("*❌ ලින්ක් එක සොයාගත නොහැකි විය!*");

        await conn.sendMessage(from, { text: `*⬆️ Episode ${epNum} Uploading...*` });

        let thumb = null;
        try {
            const imgRes = await axios.get(img, { responseType: 'arraybuffer' });
            thumb = await resizeImage(Buffer.from(imgRes.data), 200, 200);
        } catch (e) { thumb = null; }

        await conn.sendMessage(config.JID || from, {
            document: { url: res.data.download },
            mimetype: "video/mp4",
            fileName: `${title} - E${epNum}.mp4`,
            jpegThumbnail: thumb,
            caption: `🏮 *${title}*\n📺 *Episode ${epNum}*\n\n> ${config.FOOTER}`
        });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
    } catch (e) {
        console.log(e);
        reply("*❌ බාගත කිරීමේ දෝෂයක්!*");
    }
});

//---------------------------------------------
// DOWNLOAD ALL EPISODES (Command: .ahall)
//---------------------------------------------
cmd({
    pattern: "ahall",
    react: "📦",
    category: "anime",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return;

        const infoApi = `https://api-dark-shan-yt.koyeb.app/anime/animeheaven-info?url=${encodeURIComponent(q)}&apikey=${apikey}`;
        const infoRes = (await axios.get(infoApi)).data;
        const d = infoRes.data;

        await reply(`🚀 *බාගත කිරීම ආරම්භ විය: ${d.title} (සියලුම එපිසෝඩ් ${d.episodes})*`);

        let thumb = null;
        try {
            const imgRes = await axios.get(d.image, { responseType: 'arraybuffer' });
            thumb = await resizeImage(Buffer.from(imgRes.data), 200, 200);
        } catch (e) { thumb = null; }

        for (const ep of d.episodeList) {
            try {
                const dlApi = `https://api-dark-shan-yt.koyeb.app/anime/animeheaven-download?key=${ep.key}&apikey=${apikey}`;
                const dlRes = (await axios.get(dlApi)).data;

                if (dlRes.status && dlRes.data.download) {
                    await conn.sendMessage(config.JID || from, {
                        document: { url: dlRes.data.download },
                        mimetype: "video/mp4",
                        fileName: `${d.title} - E${ep.episode}.mp4`,
                        jpegThumbnail: thumb,
                        caption: `🏮 *${d.title}*\n📺 *Episode ${ep.episode}*\n\n> ${config.FOOTER}`
                    });
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } catch (err) {
                console.log(`Error on ep ${ep.episode}:`, err.message);
            }
        }
        await reply("✅ *සියලුම එපිසෝඩ් සාර්ථකව යවා අවසන්!*");
    } catch (e) {
        console.log(e);
        reply("*❌ All Download දෝෂයක්!*");
    }
});
