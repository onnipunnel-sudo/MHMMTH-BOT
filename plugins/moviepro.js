const config = require('../config'),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
  sharp = require('sharp'),
  fetch = (..._0x528df7) =>
    import('node-fetch').then(({ default: _0x1863f6 }) =>
      _0x1863f6(..._0x528df7)
    ),
  { Buffer } = require('buffer');

const apikey = process.env.MVPRO_KEY;

// රූපවල ප්‍රමාණය වෙනස් කරන function එක
async function resizeImage(buffer, width, height) {
  try {
    return await sharp(buffer).resize(width, height).toBuffer();
  } catch (e) {
    return buffer;
  }
}

//---------------------------------------------
// // MOVIEPRO SEARCH
//---------------------------------------------
cmd({
  pattern: "moviepro",
  react: '🔍',
  category: "movie",
  desc: "Search movies from MoviePro using list buttons",
  use: ".moviepro hulk",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            // 🛠️ URL එක නවතම Workers URL එකට යාවත්කාලීන කරන ලදී
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            return await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        }

        if (!q) return reply("*❗ කරුණාකර Movie නමක් ලබා දෙන්න.*");

        const searchApi = `https://nadeen-apis.koyeb.app/api/moviepro/search?keyword=${encodeURIComponent(q)}&key=${apikey}`;
        const res = (await axios.get(searchApi)).data;

        if (!res.status || !res.results || res.results.length === 0) {
            return reply("*❌ කිසිදු ප්‍රතිඵලයක් හමු නොවීය!*");
        }

        let msg = `_*MOVIEPRO SEARCH RESULTS 🔍*_\n\n*Input:* ${q}`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true") {
            const listRows = res.results.map(v => ({
                header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                title: v.title,
                description: `Tap to view details for ${v.title}`, // 👈 සරල විස්තරයක්
                id: `${prefix}mproinfo ${v.id}` // 👈 rowId වෙනුවට 'id' විය යුතුයි
            }));

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: msg,
                footer: config.FOOTER,
                optionText: "🎥 Select Movie",
                optionTitle: "MoviePro Results",
                nativeFlow: [{
                    text: "🎥 Select Movie",
                    sections: [{ 
                        title: "Search Results", 
                        rows: listRows 
                    }]
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
    } catch (e) {
        console.error(e);
        reply("*Error ❗*");
    }
});

//---------------------------------------------
// MOVIEPRO INFO & DOWNLOAD BUTTONS (DIRECT BUTTONS MODE)
//---------------------------------------------
cmd({
  pattern: "mproinfo",
  react: '📽️',
  category: "movie",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return;

        const infoApi = `https://nadeen-apis.koyeb.app/api/moviepro/info?id=${encodeURIComponent(q)}&key=${apikey}`;
        const res = (await axios.get(infoApi)).data;

        if (!res.status || !res.movie_details) {
            return reply("*❌ විස්තර ලබාගැනීමට නොහැකි විය!*");
        }

        const d = res.movie_details;
        let msg = `*▫🍿 Title ➽* ${d.title}\n` +
                  `*▫📅 Release ➽* ${d.releaseDate}\n` +
                  `*▫⭐ IMDB ➽* ${d.imdbRatingValue}\n` +
                  `*▫🎭 Genre ➽* ${d.genre}\n` +
                  `*▫🌎 Country ➽* ${d.countryName}\n\n` +
                  `*Click the button below to start download.*`;

        // ================= WORKING DIRECT BUTTON MODE =================
        if (config.BUTTON === "true") {
            let nativeButtons = [];

            // 🛠️ Download Links ටික එකින් එක Direct Buttons (quick_reply) විදිහට සකස් කිරීම
            // ⚠️ WhatsApp සීමාවන් නිසා උපරිම පෙන්විය හැක්කේ බොත්තම් 10ක් පමණි
            res.download_links.slice(0, 10).forEach((dl) => {
                nativeButtons.push({
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: `📥 ${dl.quality} (${dl.size})`,
                        id: `${prefix}mprodl ${dl.direct_url}±${d.title}±${dl.quality}±${d.image}`
                    })
                });
            });

            // @dnuzi/baileys හරහා කෙලින්ම Chat එකේ පෙනෙන Buttons යැවීම
            await conn.sendMessage(from, {
                image: { url: d.image },
                caption: msg,
                footer: config.FOOTER,
                nativeFlow: nativeButtons, // 👈 Select List නැතිව කෙලින්ම බොත්තම් Chat එකේ පෙන්වීමට
                viewOnce: true // 👈 එක පාරක් පමණක් ක්ලික් කළ හැකි වීමට
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: d.image },
                caption: msg,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("Info Error:", e.message);
        reply("*❌ තොරතුරු ලබාගැනීමේදී දෝෂයක් සිදු විය!*");
    }
});
//---------------------------------------------
// MOVIEPRO DOCUMENT UPLOADER
//---------------------------------------------
cmd({
    pattern: "mprodl",
    react: '📥',
    category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return;
        const [url, title, quality, img] = q.split("±");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        let thumb = null;
        try {
            const imgRes = await axios.get(img, { responseType: 'arraybuffer' });
            thumb = await resizeImage(Buffer.from(imgRes.data), 200, 200);
        } catch (e) { thumb = null; }

        await conn.sendMessage(config.JID || from, {
            document: { url: url },
            mimetype: "video/mp4",
            fileName: `${title} (${quality}).mp4`,
            jpegThumbnail: thumb,
            caption: `🎬 *Movie:* ${title}\n\n💎 *Quality:* \`[${quality}]\`\n\n> *MoviePro Nadeen-MD*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
    } catch (e) {
        console.error("Download Error:", e.message);
        reply("*❌ බාගත කිරීමේ දෝෂයක් සිදු විය!*");
    }
});
