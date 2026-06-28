const config = require('../config'),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
  sharp = require('sharp'),
  { Buffer } = require('buffer'),
  apikey = process.env.NADEEN_KEY;

//---------------------------------------------
// SISUB SEARCH (LIST BUTTON MODE)
//---------------------------------------------
cmd({
  pattern: "sisubs",
  react: '🔍',
  category: "subtitle",
  desc: "Search subtitles from oio.lk using list buttons",
  use: ".sisub 2025",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            // 🛠️ URL එක නවතම Workers URL එකට යාවත්කාලීන කරන ලදී
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }

        if (!q) return reply("*❗ කරුණාකර සෙවිය යුතු නම ලබා දෙන්න.*");

        // API Request එක යැවීම
        const searchApi = `https://nadeen-apis.koyeb.app/api/oio/search?q=${encodeURIComponent(q)}&key=${apikey}`;
        const response = await axios.get(searchApi);
        
        // Response එක ඇත්දැයි සහ එහි status true දැයි බලන්න
        if (!response.data || response.data.status !== true || !response.data.data || response.data.data.length === 0) {
            return reply("*❌ කිසිදු ප්‍රතිඵලයක් හමු නොවීය!!*");
        }

        const results = response.data.data;
        let msg = `_*OIO.LK SUBTITLE SEARCH 🔍*_\n\n*Input:* ${q}`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            const listRows = results.map(v => ({
                header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                title: `${v.title} (${v.year || 'N/A'})`.substring(0, 60),
                description: `Tap to view details and download subtitles`, // 👈 සරල විස්තරයක්
                id: `${prefix}sisubdl ${v.url}` // 👈 rowId වෙනුවට 'id'
            }));

            await conn.sendMessage(from, {
                image: { url: results[0].thumbnail || config.LOGO },
                caption: msg,
                footer: config.FOOTER,
                optionText: "🎥 Select Result",
                optionTitle: "Subtitle Results",
                nativeFlow: [{
                    text: "🎥 Select Result",
                    sections: [{ title: "Search Results", rows: listRows }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: results[0].thumbnail || config.LOGO },
                caption: msg,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("Search API Error:", e.message);
        reply("*❌ සර්ච් කිරීමේදී පද්ධති දෝෂයක් සිදු විය!*");
    }
});

//---------------------------------------------
// SUBTITLE INFO & DOWNLOAD (DIRECT BUTTONS MODE)
//---------------------------------------------
cmd({
  pattern: "sisubdl",
  react: '📄',
  category: "subtitle",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return;

        const infoApi = `https://nadeen-apis.koyeb.app/api/oio/info?url=${encodeURIComponent(q)}&key=${apikey}`;
        const { data: res } = await axios.get(infoApi);

        if (!res || !res.status || !res.data) {
            return reply("*❌ තොරතුරු ලබාගැනීමට නොහැකි විය!*");
        }

        const d = res.data;
        let infoMsg = `*📄 Title:* ${d.title}\n\n*ZIP ගොනුව බාගත කිරීමට පහතින් තෝරන්න:*`;
        const subImage = d.image || config.LOGO;

        // ================= WORKING DIRECT BUTTON MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            let nativeButtons = [];

            // Subtitle Links ටික Direct Buttons (quick_reply) විදිහට සකස් කිරීම
            // ⚠️ WhatsApp සීමාවන් නිසා උපරිම පෙන්විය හැක්කේ බොත්තම් 10ක් පමණි
            if (d.subtitles && d.subtitles.length > 0) {
                d.subtitles.slice(0, 10).forEach((s) => {
                    let qualityLabel = `${s.quality || 'Default'} Subtitle`;
                    
                    nativeButtons.push({
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: `📥 ${qualityLabel.substring(0, 20)}`, // 👈 WhatsApp අකුරු සීමාව නිසා 20කට කෙටි කරන ලදී
                            id: `${prefix}sisubzip ${s.download_link}±${d.title}`
                        })
                    });
                });
            }

            if (nativeButtons.length === 0) return reply("*❌ බාගත කිරීමට ලින්ක්ස් කිසිවක් හමු නොවීය!*");

            // @dnuzi/baileys හරහා කෙලින්ම Chat එකේ පෙනෙන Buttons යැවීම
            await conn.sendMessage(from, {
                image: { url: subImage },
                caption: infoMsg,
                footer: config.FOOTER,
                nativeFlow: nativeButtons,
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: subImage },
                caption: infoMsg,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("Info API Error:", e.message);
        reply("*❌ විස්තර ලබාගැනීමේදී දෝෂයක් සිදු විය!*");
    }
});
//---------------------------------------------
// ZIP UPLOADER (Command: .sisubzip)
//---------------------------------------------
cmd({
    pattern: "sisubzip",
    react: '📦',
    category: "subtitle",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return;
        const [zipUrl, title] = q.split("±");

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        await conn.sendMessage(from, {
            document: { url: zipUrl },
            mimetype: "application/zip",
            fileName: `${title}.zip`,
            caption: `*📄 ${title} Sinhala Subtitle ZIP*\n\n> *Nadeen-MD*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (e) {
        console.error("Zip Upload Error:", e.message);
        reply("*❌ ZIP ගොනුව එවන විට දෝෂයක් සිදු විය!*");
    }
});
