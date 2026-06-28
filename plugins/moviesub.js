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
	key = `82406ca340409d44`

let isUploading = false;

//---------------------------------------------
// MOVIELK SEARCH (LIST BUTTON MODE)
//---------------------------------------------
cmd({
    pattern: "movielk",
    react: '🔎',
    category: "movie",
    alias: ["ms"],
    desc: "movieslk search using list buttons",
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

        const searchUrl = `https://moviessub-nadeen.vercel.app/api/search?q=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl);
        const results = response.data.results;

        if (!results || results.length === 0) return reply("*❌ No results found!*");

        let msg = `_*MOVIELK SEARCH RESULTS 🎬*_\n\n*Input:* ${q}`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true") {
            const listRows = results.map(v => ({
                header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                title: v.title.replace(/Sinhala Subtitles|සිංහල උපසිරැසි සමඟ/gi, "").trim().substring(0, 60),
                description: "Tap to view details and download options", // 👈 සරල විස්තරයක්
                id: `${prefix}msdl ${v.link}±${v.image.replace(/\/s\d+[^/]*\//, '/s1600/')}` // 👈 rowId වෙනුවට 'id'
            }));

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: msg,
                footer: config.FOOTER,
                optionText: "🎥 Select Result",
                optionTitle: "Movielk Results",
                nativeFlow: [{
                    text: "🎥 Select Result",
                    sections: [{ title: "[Movielk.com Results]", rows: listRows }]
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
        reply("*Error during search!*");
    }
});

//---------------------------------------------
// MOVIELK INFO & DOWNLOAD (DIRECT BUTTONS MODE)
//---------------------------------------------
cmd({
    pattern: "msdl",
    react: "🎥",
    category: "movie",
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

        if (!q) return reply("*❗ Invalid Link!*");

        const [url, img] = q.split("±");
        const movieImage = img || config.LOGO;
        
        const infoUrl = `https://moviessub-nadeen.vercel.app/api/info?url=${encodeURIComponent(url)}`;
        const response = await axios.get(infoUrl);
        const d = response.data;

        if (!d || !d.title) return reply("*❌ Movie details not found!*");
        
        let infoMsg = `*_🎬 𝗧ɪᴛʟᴇ: ${d.title}_*\n\n` +
                      `📅 *𝗬ᴇᴀʀ:* ${d.details?.year || 'N/A'}\n` +
                      `⭐ *𝗜ᴍᴅ訊ʙ:* ${d.details?.imdb || 'N/A'}\n` +
                      `🤡 *𝗚ᴇɴʀ𝙴:* ${d.details?.genre || 'N/A'}\n` +
                      `🕵️‍♂️ *Ｄɪʀᴇᴄᴛᴏʀ:* ${d.details?.director || 'N/A'}\n` +
                      `🌎 *𝗖ᴏ🇺ɴᴛʀʏ:* ${d.details?.country || 'N/A'}\n\n` +
                      `*Select a quality below to download:*`;

        // ================= WORKING DIRECT BUTTON MODE =================
        if (config.BUTTON === "true") {
            let nativeButtons = [];

            // Download links ටික Direct Buttons (quick_reply) විදිහට සකස් කිරීම
            // ⚠️ WhatsApp සීමාවන් නිසා උපරිම පෙන්විය හැක්කේ බොත්තම් 10ක් පමණි
            if (d.downloads && d.downloads.length > 0) {
                d.downloads.slice(0, 10).forEach((v) => {
                    let qualityLabel = `Download (${v.quality || 'HD'})`;
                    
                    nativeButtons.push({
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: `📥 ${qualityLabel.substring(0, 20)}`, // 👈 WhatsApp අකුරු සීමාව නිසා 20කට කෙටි කරන ලදී
                            id: `${prefix}mvsub ${movieImage}±${v.link}±${d.title}±${v.quality || 'HD'}`
                        })
                    });
                });
            }

            if (nativeButtons.length === 0) return reply("*❌ No download links available!*");

            // @dnuzi/baileys හරහා කෙලින්ම Chat එකේ පෙනෙන Buttons යැවීම
            await conn.sendMessage(from, {
                image: { url: movieImage },
                caption: infoMsg,
                footer: config.FOOTER,
                nativeFlow: nativeButtons,
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: movieImage },
                caption: infoMsg,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.log(e);
        reply("*Error fetching info!*");
    }
});
// 3. FINAL FILE UPLOADER (paka command)

cmd({
    pattern: "mvsub",
    react: "⬇️",
	 category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
//    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse.vercel.app/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii



 console.log(`🤹🏼‍♂️ Final-dl:`, q);

    // q → img ± url ± title ± quality
    const [img, url, title, quality] = q.split("±");
	const res = await fg.gdrive(url + `/view`)
	
    if (!q) return reply("*❗ Please give Google Drive URL*");
    if (isUploading) return reply("*⏳ Another upload is in progress…*");
console.log(`🌬Gd-dl:`,res.downloadUrl);
    try {
        isUploading = true;
let downloadUrl = res.downloadUrl;
console.log(`🏵Link-dl:`, downloadUrl);
        const upmsg = await conn.sendMessage(
            from,
            { text: `*⬆️ Uploading movie...*` }
        );

        // Thumbnail handle (optional)
        let jpegThumbnail;
        if (img) {
            const imgRes = await fetch(img);
            const imgBuf = await imgRes.buffer();
            jpegThumbnail = await sharp(imgBuf).resize(200, 200).toBuffer();
        }

        await conn.sendMessage(
            config.JID || from,
            {
                document: { url: downloadUrl },
                mimetype: "video/mp4",
                fileName: `${title}.mp4`,
                caption: `🎬 *${title}*\n\n\`[${quality}]\`\n\n★━━━━━━━━✩━━━━━━━━★`,
                jpegThumbnail
            },
            { quoted: mek }
        );

        await conn.sendMessage(from, { delete: upmsg.key });
        await conn.sendMessage(from, {
            react: { text: "✔️", key: mek.key }
        });

    } catch (e) {
        console.log("❌ Upload error:", e);
        reply("*❗ Error while uploading the file.*");
    } finally {
        isUploading = false;
    }
});


cmd({
    pattern: "slmahi",
    react: '🔎',
    category: "movie",
    alias: ["mahi"],
    desc: "movieslk search",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
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



        if (!q) return reply("*❗ Please give a movie name*");

        const searchUrl = `https://slmahima-nadeen.vercel.app/api/search?q=${encodeURIComponent(q)}`;
        const response = await axios.get(searchUrl);
        const results = response.data.results;

        if (!results || results.length === 0) return reply("*❌ No results found!*");

        // බොට්ගේ config එක අනුව NON_BUTTON අගය සකස් කිරීම
        const isButton = config.BUTTON === "true";

        if (isButton) {
            // Button Mode (Native Flow Single Select)
            const rows = results.map(v => ({
                title: v.title.replace(/Sinhala Subtitles|සිංහල උපසිරැසි සමඟ/gi, "").trim(),
                id: `${prefix}msdl ${v.link}±${v.image.replace(/\/s\d+[^/]*\//, '/s1600/')}`
            }));

            const listButtons = {
                title: "🎬 Select a Movie",
                sections: [{ title: "[slmahima.com Results]", rows }]
            };

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: `_*SLMAHIMA SEARCH RESULTS 🎬*_\n\n*Input:* ${q}`,
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "ms_list",
                    buttonText: { displayText: "🎥 Select Result" },
                    type: 4,
                    nativeFlowInfo: {
                        name: "single_select",
                        paramsJson: JSON.stringify(listButtons)
                    }
                }],
                headerType: 1
            }, { quoted: mek });

        } else {
            // Non-Button Mode (අංකය reply කරන ක්‍රමය - listMessage භාවිතා කර)
            const rows = results.map(v => ({
                title: v.title.replace(/Sinhala Subtitles|සිංහල උපසිරැසි සමඟ/gi, "").trim(),
                rowId: `${prefix}mhdl ${v.link}±${v.image.replace(/\/s\d+[^/]*\//, '/s1600/')}`
            }));

            await conn.listMessage(from, {
                text: `_*SLMAHIMA SEARCH RESULTS 🎬*_\n\n*Input:* ${q}`,
                footer: config.FOOTER,
                title: "[slmahima.com Results]",
                buttonText: "Reply Below Number 🔢",
                sections: [{ title: "[slmahima.com Results]", rows }]
            }, mek);
        }

    } catch (e) {
        console.log(e);
        reply("*Error during search!*");
    }
});

cmd({
    pattern: "mhdl",
    react: "🎥",
	 category: "movie",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return reply("*❗ Invalid Link!*");
 

    // q → img ± url ± title ± quality
    const [url, img] = q.split("±");
		console.log(`💃🏻Url:`, url);
        const infoUrl = `https://slmahima-nadeen.vercel.app/api/details?url=${encodeURIComponent(url)}`;
        const response = await axios.get(infoUrl);
        const d = response.data;
//let res = await fg.GDriveDl(d.downloads[0].link.replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/').replace('&export=download' , '/view'))
		
        let infoMsg = `*_🎬 𝗧ɪᴛʟᴇ: ${d.title}_*\n\n📅 *𝗬ᴇᴀʀ:* ${d.details.year || 'N/A'}\n⭐ *𝗜ᴍᴅʙ:* ${d.details.imdb || 'N/A'}\n🤡 *𝗚ᴇɴʀᴇ:* ${d.details.genre || 'sinhala dubbed'}\n\n`;

        const isButton = config.BUTTON === "true";

        if (isButton) {
            // Button Mode
            const rows = d.downloads.map(v => ({
                title: `Download`,
                id: `${prefix}mvsub ${d.image}±${v.url}±${d.title}±HD`
            }));

            const listButtons = {
                title: "📥 Download Options",
                sections: [{ title: "Available Qualities", rows }]
            };

            await conn.sendMessage(from, {
                image: { url: d.image },
                caption: infoMsg + "*Select a quality:*",
                footer: config.FOOTER,
                buttons: [{
                    buttonId: "dl_list",
                    buttonText: { displayText: "📥 Download Now" },
                    type: 4,
                    nativeFlowInfo: {
                        name: "single_select",
                        paramsJson: JSON.stringify(listButtons)
                    }
                }],
                headerType: 1
            }, { quoted: mek });

        } else {
            // Non-Button Mode (අංකය reply කර ඩවුන්ලෝඩ් කිරීමට)
            const buttons = d.downloads.map(v => ({
                buttonText: { displayText: `Download` },
                buttonId: `${prefix}mvsub ${d.image}±${v.url}±${d.title}±HD`
            }));

            await conn.buttonMessage(from, {
                image: { url: d.image },
                caption: infoMsg,
                footer: config.FOOTER,
                buttons: buttons,
                headerType: 4 // Image header
            }, mek);
        }

    } catch (e) {
        console.log(e);
        reply("*Error fetching info!*");
    }
});
