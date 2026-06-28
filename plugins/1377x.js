const config = require('../config'),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
  sharp = require('sharp'),
  https = require("https"),
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



// 1. Search Command
cmd({
    pattern: "moviego",
    react: '🔎',
    category: "movie",
    desc: "Search torrents on 1337x",
    use: ".moviego <query>",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse-six.vercel.app/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii


        if (!q) return await reply('*Please enter a search query! 🎬*');
        const { data } = await axios.get(`https://1377x-api-new.vercel.app/api/search?q=${encodeURIComponent(q)}`);
        
        if (!data || !data.results.length) return await reply('*No results found ❌*');

        let srh = data.results.map(v => ({
            title: v.title.substring(0, 60),
            rowId: `${prefix}13info ${v.link}`
        }));

        const sections = [{ title: "[Movie.go Results]", rows: srh }];

        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                caption: `_*MOVIEGO SEARCH RESULTS*_\n\n\`🔍Input:\` ${q}`,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "torrent_list",
                    buttonText: { displayText: "🎥 Select Torrent" },
                    type: 4,
                    nativeFlowInfo: { name: "single_select", paramsJson: JSON.stringify({ title: "Choose a Torrent 🎬", sections }) }
                }],
                headerType: 1
            }, { quoted: mek });
        } else {
            await conn.listMessage(from, { text: `_*MOVIEGO SEARCH RESULTS*_\n\n\`🔍Input:\` ${q}`, footer: config.FOOTER, title: 'Results 🎥', buttonText: '*Select Number 🔢*', sections }, mek);
        }
    } catch (e) { reply('🚫 Error: ' + e.message); }
});

// 2. Info Command
cmd({
    pattern: "13info",
    react: "🎥",
    category: "movie",
    filename: __filename
}, async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse-six.vercel.app/data.json');
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }

        const { data } = await axios.get(`https://1377x-api-new.vercel.app/api/info?url=${encodeURIComponent(q)}`);
        const title = `${data.title.replace(/%20/g, '')}`;

        // ප්‍රමාණය (Size) පරීක්ෂා කිරීම - GB ද MB ද යන්න හඳුනාගැනීම
        const rawSize = data.size || "0 MB";
        const isGB = rawSize.includes("GB");
        const sizeVal = parseFloat(rawSize.replace(/[^\d.]/g, ''));

        // 2GB ට වඩා වැඩි නම් true වේ
        const isTooLarge = isGB && sizeVal > 2.0;

        let msg = `🎬 *${title}*\n\n`;
        msg += `▫🔊 *Language:* ${data.language}\n`;
        msg += `▫👥 *Leechers:* ${data.leechers}\n`;
        msg += `▫🛒 *Category:* ${data.category}\n`;
        msg += `▫⬆️ *Uploader:* ${data.uploader}\n`;
        msg += `▫⚖️ *Size:* ${rawSize}\n\n`;

        if (isTooLarge) {
            msg += `🚫 *මෙම ගොනුව 2GB ට වඩා වැඩි බැවින් බාගත කළ නොහැක.*`;
        } else {
            msg += `*Click the button below to start torrent download.*\n`;
        }

        const fullImg = data.image.startsWith('//') ? `https:${data.image}` : config.LOGO;
        const payload = `${data.magnetLink}±${fullImg}±${title}±${data.type}`;

        // 2GB ට වඩා අඩු නම් පමණක් බටන් නිර්මාණය කරයි
        let buttons = [];
        if (!isTooLarge) {
            buttons.push({
                buttonId: `${prefix}torren ${payload}`,
                buttonText: { displayText: `📥 Download (${rawSize})` },
                type: 1
            });
        }

        if (config.BUTTON === "true") {
            await conn.sendMessage(from, {
                image: { url: fullImg },
                caption: msg,
                footer: config.FOOTER,
                buttons: buttons,
                headerType: 4
            }, { quoted: mek });
        } else {
            await conn.buttonMessage(from, { 
                image: { url: fullImg },
                caption: msg, 
                footer: config.FOOTER,
                buttons: buttons, 
                headerType: 4 
            }, mek);
        }
    } catch (err) { 
        reply("🚫 *Error:* " + err.message); 
    }
});
