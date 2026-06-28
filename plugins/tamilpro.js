
const config = require('../config'),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
	fg = require('api-dylux'),
  sharp = require('sharp'),
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
  l = console.log,
  cinesubz_tv = require('sadasytsearch'),
  {
    cinesubz_info,
    cinesubz_tv_firstdl,
    cinesubz_tvshow_info,
  } = require('../lib/cineall'),
	key = process.env.SHAN_KEY;
var { updateCMDStore,isbtnID,getCMDStore,getCmdForCmdId,connectdb,input,get, updb,updfb } = require("../lib/database")

//---------------------------------------------
// TAMILPRO SEARCH (LIST BUTTON MODE)
//---------------------------------------------
cmd({
  pattern: "tamilpro",
  react: '🔎',
  category: "movie",
  desc: "HDHub4u movie search using list buttons",
  use: ".tamilpro 2025",
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
        if (!q) return reply("*❗ Please give a movie name*");

        const api = `https://api-shan.vercel.app/movie/hdhub4u-search?q=${q}&limit=15`;
        const response = await axios.get(api);
        const data = response.data;

        if (!data.status || !data.data || data.data.length === 0)
            return reply("*❌ No results found!*");

        let msg = `_*TAMILPRO SEARCH RESULTS 🎬*_\n\n*Input:* ${q}`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true") {
            const listRows = data.data.map(v => ({
                header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                title: v.title,
                description: `Tap to view details and download links`, // 👈 සරල විස්තරයක්
                id: `${prefix}tamildl ${v.link}±${v.thumbail || config.LOGO}±${v.title}` // 👈 rowId වෙනුවට 'id'
            }));

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: msg,
                footer: config.FOOTER,
                optionText: "🎥 Select Movie",
                optionTitle: "TAMILPRO Results",
                nativeFlow: [{
                    text: "🎥 Select Movie",
                    sections: [{ title: "Search Results", rows: listRows }]
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
    } catch (e) {
        console.log(e);
        reply("*Error ❗*");
    }
});

//---------------------------------------------
// TAMILPRO INFO (DIRECT BUTTONS MODE)
//---------------------------------------------
cmd({
  pattern: "tamildl",
  react: "🎥",
  category: "movie",
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
        if (!q) return reply("*❗ Invalid input!*");
        const [url, img, movieTitle] = q.split("±");
        
        const infoAPI = `https://api-shan.vercel.app/movie/hdhub4u-info?url=${encodeURIComponent(url)}&apikey=${key}`;
        const response = await axios.get(infoAPI);
        const d = response.data.data;

        if (!d) return reply("*❌ Movie info not found!*");

        let msg = `*_▫🍿 Title ➽ ${d.title}_*\n\n` +
                  `▫⭐ IMDB ➽ ${d.rating}\n` +
                  `▫🎭 Genre ➽ ${d.genre}\n` +
                  `▫🕵️ Director ➽ ${d.director}\n` +
                  `▫🔉 Language ➽ ${d.language}\n`;

        const movieImage = img || config.LOGO;

        // ================= WORKING DIRECT BUTTON MODE =================
        if (config.BUTTON === "true") {
            let nativeButtons = [];

            // 🛠️ 2GB වලට අඩු ලින්ක්ස් Direct Buttons (quick_reply) ලෙස සකස් කිරීම
            // ⚠️ WhatsApp සීමාවන් නිසා උපරිම පෙන්විය හැක්කේ බොත්තම් 10ක් පමණි
            d.download.forEach(v => {
                let sizeMatch = v.quality.match(/\[(\d+(\.\d+)?)GB\]/i);
                let isTooLarge = false;
                if (sizeMatch && parseFloat(sizeMatch[1]) >= 2.0) isTooLarge = true;

                if (!isTooLarge && !v.quality.includes("WATCHPLAYER")) {
                    nativeButtons.push({
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: `📥 ${v.quality.substring(0, 20)}`, // 👈 අකුරු සීමාව නිසා 20කට කෙටි කරන ලදී
                            id: `${prefix}tamil_upload ${movieImage}±${v.link}±${d.title}±${v.quality}`
                        })
                    });
                }
            });

            if (nativeButtons.length === 0) return reply("*❌ No suitable links under 2GB!*");

            // @dnuzi/baileys හරහා කෙලින්ම Chat එකේ පෙනෙන Buttons (උපරිම 10 සීමාවෙන්) යැවීම
            await conn.sendMessage(from, {
                image: { url: movieImage },
                caption: msg,
                footer: config.FOOTER,
                nativeFlow: nativeButtons.slice(0, 10),
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
    } catch (e) {
        console.log(e);
        reply("*Error fetching info!*");
    }
});

//---------------------------------------------
// TAMILPRO FINAL UPLOAD (Like 'paka')
//---------------------------------------------
cmd({
  pattern: "tamil_upload",
  react: "⬇️",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii
        if (!q) return reply("*❗ Missing data!*");
        const [img, url, title, quality] = q.split("±");

        const upmsg = await conn.sendMessage(from, { text: "*⬆️ Uploading movie...*" });

        // Document එක විදිහට වීඩියෝව යැවීම (With Thumbnail)
        const botimgResponse = await fetch(img);
        const botimgBuffer = await botimgResponse.buffer();
        const resizedBotImg = await sharp(botimgBuffer).resize(200, 200).toBuffer();

        await conn.sendMessage(config.JID || from, {
            document: { url: url },
            mimetype: "video/mp4",
            caption: `🎬 *${title}*\n\n\`[${quality}]\`\n\n> *•ɴᴀᴅᴇᴇɴ-ᴍᴅ•*`,
            jpegThumbnail: resizedBotImg,
            fileName: `${title}.mp4`
        });

        await conn.sendMessage(from, { delete: upmsg.key });
        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (e) {
        console.log("❌ Upload error:", e);
        reply("*❗ Error while uploading the movie!*");
    }
});
