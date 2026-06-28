const axios = require('axios');
const { cmd } = require('../command');
const config = require('../config');
const sharp = require('sharp');
const apikey = process.env.SHAN_KEY;

// Image එක resize කරලා Buffer එකක් දෙන function එක
async function getResizedThumb(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        return await sharp(buffer)
            .resize(200, 200) 
            .jpeg()
            .toBuffer();
    } catch (e) {
        console.log("Thumbnail error:", e);
        return null;
    }
}

// ---------------------------------------------
// FILMS360 SEARCH COMMAND (LIST BUTTON MODE)
// ---------------------------------------------
cmd({
    pattern: "f360",
    react: '🔎',
    category: "movie",
    alias: ["films360"],
    desc: "Search movies/tv from Films360 using list buttons",
    use: ".f360 Joker",
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

        const searchApi = `https://api-shan.vercel.app/movie/films360-search?q=${encodeURIComponent(q)}&apikey=${apikey}`;
        const response = await axios.get(searchApi);
        const data = response.data;

        if (!data.status || !data.data || data.data.length === 0) {
            return reply("*❌ No results found on Films360!*");
        }

        let msg = `_*FILMS360 SEARCH RESULTS 🎬*_\n\n*Input:* ${q}`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true") {
            const listRows = data.data.map((v) => {
                let year = v.releaseDate ? v.releaseDate.split('-')[0] : 'N/A';
                let type = v.type ? v.type.toUpperCase() : 'MOVIE';
                return {
                    header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                    title: `${v.title} (${year}) | ${type}`.substring(0, 60),
                    description: "Tap to view details and download options", // 👈 සරල විස්තරයක්
                    id: `${prefix}f360dl ${v.id}±${v.type}±${v.image || config.LOGO}` // 👈 rowId වෙනුවට 'id'
                };
            });

            await conn.sendMessage(from, {
                image: { url: data.data[0].image || config.LOGO },
                caption: msg,
                footer: config.FOOTER,
                optionText: "🎥 Select Result",
                optionTitle: "Films360 Results",
                nativeFlow: [{
                    text: "🎥 Select Result",
                    sections: [{ title: "Films360 Results", rows: listRows }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: data.data[0].image || config.LOGO },
                caption: msg,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.log(e);
        reply("*❌ API Error while searching!*");
    }
});

// ---------------------------------------------
// FILMS360 INFO & DOWNLOAD COMMAND (DIRECT BUTTON MODE)
// ---------------------------------------------
cmd({
    pattern: "f360dl",
    react: '🎥',
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

        if (!q) return;
        const [id, type, img] = q.split("±");
        const movieImage = img || config.LOGO;

        const infoApi = `https://api-shan.vercel.app/movie/films360-info?id=${id}&type=${type}&apikey=${apikey}`;
        const response = await axios.get(infoApi);
        const d = response.data.data;

        if (!d) return reply("*❌ Details not found!*");

        let details = `🎬 *${d.titleLong || d.title}*\n\n` +
                      `▫️⭐ *Rating:* ${d.rating || 'N/A'}\n` +
                      `▫️📅 *Year:* ${d.year || 'N/A'}\n` +
                      `▫️⏳ *Runtime:* ${d.runtime || 'N/A'} min\n` +
                      `▫️🌎 *Country:* ${d.productionCountries ? d.productionCountries.join(', ') : 'N/A'}\n` +
                      `▫️🎭 *Genres:* ${d.genres ? d.genres.join(', ') : 'N/A'}\n\n` +
                      `📝 *Synopsis:* ${d.synopsis ? d.synopsis.slice(0, 300) : 'No synopsis available'}...\n\n` +
                      `*Click below to download movie:*`;

        const downloadUrl = d.download || d.stream;
        
        if (!downloadUrl) return reply("*❌ Download link not available for this title!*");

        // ================= WORKING DIRECT BUTTON MODE =================
        if (config.BUTTON === "true") {
            let nativeButtons = [];

            let cleanTitle = d.title ? d.title.trim() : 'Movie';
            nativeButtons.push({
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "📥 Download Now",
                    id: `${prefix}f360send ${downloadUrl}±${encodeURIComponent(cleanTitle)}  img`
                })
            });

            // @dnuzi/baileys හරහා කෙලින්ම Chat එකේ පෙනෙන Buttons යැවීම
            await conn.sendMessage(from, {
                image: { url: movieImage },
                caption: details,
                footer: config.FOOTER,
                nativeFlow: nativeButtons,
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: movieImage },
                caption: details,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.log(e);
        reply("*❌ Error fetching details!*");
    }
});
// ---------------------------------------------
// FILMS360 FINAL SEND (DOC UPLOAD)
// ---------------------------------------------
cmd({
    pattern: "f360send",
    react: '⬆️',
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return;
        const [url, title, img] = q.split("±");

        await reply("*🚀 Uploading your file, please wait...*");

        const resizedThumb = await getResizedThumb(img);

        await conn.sendMessage(from, {
            document: { url: url },
            mimetype: "video/mp4",
            fileName: `${title}.mp4`,
            jpegThumbnail: resizedThumb,
            caption: `🎬 *${title}*\n\n${config.NAME}\n\n> ${config.FOOTER}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (e) {
        console.log(e);
        reply("*❌ Upload failed! The link may be expired or too large.*");
    }
});
