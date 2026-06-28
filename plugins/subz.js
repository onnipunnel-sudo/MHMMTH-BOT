const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const API_KEY = process.env.CHARUKA_KEY;

//---------------------------------------------
// SUBZ.LK SEARCH (LIST BUTTON MODE)
//---------------------------------------------
cmd({
    pattern: "subz",
    react: '🔎',
    category: "movie",
    desc: "Search movies on subz.lk using list buttons",
    use: ".subz <query>",
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
        const { data } = await axios.get(`https://my-apis-site.vercel.app/movie/subz/search?text=${encodeURIComponent(q)}&apikey=${API_KEY}`);
        
        if (!data.status || !data.result.length) return await reply('*No results found ❌*');

        let msg = `_*SUBZ.LK SEARCH RESULTS*_\n\n*Input:* ${q}`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true") {
            const listRows = data.result.map(v => ({
                header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                title: v.title.substring(0, 60),
                description: `Tap to view details and download links`, // 👈 සරල විස්තරයක්
                id: `${prefix}subinfo ${v.url}` // 👈 rowId වෙනුවට 'id'
            }));

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: msg,
                footer: config.FOOTER,
                optionText: "🎥 Select Movie",
                optionTitle: "Subz Results",
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
// SUBZ.LK INFO & DOWNLOAD (DIRECT BUTTONS MODE)
//---------------------------------------------
cmd({
    pattern: "subinfo",
    react: "🎥",
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

        const { data } = await axios.get(`https://my-apis-site.vercel.app/movie/subz/movie?url=${encodeURIComponent(q)}&apikey=${API_KEY}`);
        const info = data.result;

        let cleanTitle = info.title.split('\n')[0] || info.title;
        let msg = `🎬 *${cleanTitle}*\n\n📝 *Description:* ${info.description ? info.description.substring(0, 100) : 'No description'}...`;
        const movieImage = info.image || config.LOGO;

        // ================= WORKING DIRECT BUTTON MODE =================
        if (config.BUTTON === "true") {
            let nativeButtons = [];

            // 🛠️ Torrent links ටික Direct Buttons (quick_reply) විදිහට සකස් කිරීම
            // ⚠️ WhatsApp සීමාවන් නිසා උපරිම පෙන්විය හැක්කේ බොත්තම් 10ක් පමණි
            info.torrentLinks.slice(0, 10).forEach((v) => {
                let buttonLabel = `${v.quality || 'HD'} (${v.size || 'Unknown'})`;
                
                nativeButtons.push({
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: `📥 ${buttonLabel}`,
                        id: `${prefix}torren ${v.link}±${movieImage}±${encodeURIComponent(cleanTitle)}±${v.quality || 'HD'}`
                    })
                });
            });

            if (nativeButtons.length === 0) return reply("*❌ No download links available!*");

            // @dnuzi/baileys හරහා කෙලින්ම Chat එකේ පෙනෙන Buttons යැවීම
            await conn.sendMessage(from, {
                image: { url: movieImage },
                caption: msg,
                footer: config.FOOTER,
                nativeFlow: nativeButtons,
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
        reply("🚫 *Error:* " + err.message); 
    }
});
