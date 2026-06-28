const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');
const sharp = require('sharp');

//---------------------------------------------
// OKJATT SEARCH (LIST BUTTON MODE)
//---------------------------------------------
cmd({
    pattern: "okjatt",
    react: '🔎',
    category: "movie",
    desc: "Search movies on okjatt using list buttons",
    use: ".okjatt <movie name>",
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

        if (!q) return await reply('*Please enter a movie name! 🎬*');
        const { data } = await axios.get(`https://okjact-mv.vercel.app/api/search?q=${encodeURIComponent(q)}`);
        
        if (!data || !data.results || !data.results.length) return await reply('*No results found ❌*');

        let msg = `_*OKJATT SEARCH RESULTS*_\n\n*Input:* ${q}`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true") {
            const listRows = data.results.map(v => ({
                header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                title: v.title.substring(0, 60),
                description: `Tap to view details and download links`, // 👈 සරල විස්තරයක්
                id: `${prefix}okinfo ${v.link}±${encodeURIComponent(v.img || config.LOGO)}` // 👈 rowId වෙනුවට 'id'
            }));

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: msg,
                footer: config.FOOTER,
                optionText: "🎥 Select Movie",
                optionTitle: "Okjatt Results",
                nativeFlow: [{
                    text: "🎥 Select Movie",
                    sections: [{ title: "Choose a Movie 🎬", rows: listRows }]
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
    } catch (e) { reply('🚫 Error: ' + e.message); }
});

//---------------------------------------------
// OKJATT INFO & DOWNLOAD (DIRECT BUTTONS MODE)
//---------------------------------------------
cmd({
    pattern: "okinfo",
    react: "🎥",
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
        const [url, thumb] = q.split("±");
        const decodedThumb = decodeURIComponent(thumb) || config.LOGO;
        
        const { data } = await axios.get(`https://okjact-mv.vercel.app/api/info?url=${encodeURIComponent(url)}`);
        
        if (!data || !data.title) return reply("*❌ Movie details not found!*");

        let msg = `🎬 *${data.title}*\n\n` +
                  `✨ *Genre:* ${data.genres || 'N/A'}\n` +
                  `📅 *Release:* ${data.releaseDate || 'N/A'}\n` +
                  `⏳ *Duration:* ${data.duration || 'N/A'}\n` +
                  `🔊 *Languages:* ${data.languages || 'N/A'}\n` +
                  `📝 *Description:* ${data.description ? data.description.substring(0, 100) : 'No description'}...`;

        // ================= WORKING DIRECT BUTTON MODE =================
        if (config.BUTTON === "true") {
            let nativeButtons = [];

            if (data.downloadLink) {
                let buttonLabel = `Download ${data.quality || 'HD'} (${data.size || 'Unknown'})`;
                
                nativeButtons.push({
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: `⬇️ ${buttonLabel.substring(0, 20)}`, // 👈 WhatsApp අකුරු සීමාව නිසා කෙටි කරන ලදී
                        id: `${prefix}okdl ${data.downloadLink}±${decodedThumb}±${encodeURIComponent(data.title)}`
                    })
                });
            }

            if (nativeButtons.length === 0) return reply("*❌ No download links available!*");

            // @dnuzi/baileys හරහා කෙලින්ම Chat එකේ පෙනෙන Button එක යැවීම
            await conn.sendMessage(from, {
                image: { url: decodedThumb },
                caption: msg,
                footer: config.FOOTER,
                nativeFlow: nativeButtons,
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: decodedThumb },
                caption: msg,
                footer: config.FOOTER
            }, { quoted: mek });
        }
    } catch (err) { reply("🚫 *Error:* " + err.message); }
});
// 3. Download Command
cmd({
    pattern: "okdl",
    react: "⬇️",
     category: "movie",
    filename: __filename
}, async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
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



        const [url, thumb, title] = q.split("±");
        const decodedTitle = decodeURIComponent(title);
        const fetchingMsg = await conn.sendMessage(from, { text: '*Fetching download link... ⏳*' }, { quoted: mek });

        const { data } = await axios.get(`https://okjact-mv.vercel.app/api/download?url=${encodeURIComponent(url)}`);
        
        if (!data.downloadLink) return await conn.sendMessage(from, { text: '❌ *Could not get download link.*', edit: fetchingMsg.key });

        await conn.sendMessage(from, { text: '*Uploading your movie... ⬆️*', edit: fetchingMsg.key });

        let thumbBuffer;
        try {
            const resImg = await axios.get(decodeURIComponent(thumb), { responseType: 'arraybuffer' });
            thumbBuffer = await sharp(resImg.data).resize(200, 200).toBuffer();
        } catch (err) { thumbBuffer = undefined; }

        await conn.sendMessage(from, {
            document: { url: data.downloadLink },
            caption: `🎬 *${decodedTitle}*\n\n✅ *Downloaded via Okjatt*\n\n ${config.FOOTER}`,
            fileName: `${decodedTitle}.mp4`,
            mimetype: "video/mp4",
            jpegThumbnail: thumbBuffer
        }, { quoted: mek });
        
        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
    } catch (e) { reply('🚫 Error: ' + e.message); }
});
