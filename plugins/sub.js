const config = require('../config'),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
 fg = require('api-dylux'),
  sharp = require('sharp'),
  download = require('../lib/yts'),
  charuka = process.env.CHARUKA_KEY,
  nadeen = process.env.NADEEN_KEY,
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



//---------------------------------------------
// ZOOM SEARCH (LIST BUTTON MODE)
//---------------------------------------------
cmd({
    pattern: "zoom",
    react: '🔎',
    category: "movie",
    alias: ["zsearch"],
    desc: "Search movies from Zoom.lk using list buttons",
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

        if (!q) return reply("*❗ Please provide a movie name!*");

        const searchUrl = `https://my-apis-site.vercel.app/movie/zoom/search?text=${encodeURIComponent(q)}&apikey=${charuka}`;
        const response = await axios.get(searchUrl);
        const results = response.data.result;

        if (!results || results.length === 0) return reply("*❌ No results found on Zoom.lk!*");

        let msg = `🎬 *ZOOM.LK SEARCH RESULTS*\n\n*Input:* ${q}`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true") {
            const listRows = results.map((v) => ({
                header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                title: v.title.substring(0, 60),
                description: `Tap to view movie details and subtitles`, // 👈 සරල විස්තරයක්
                id: `${prefix}zoominfo ${v.link}±${v.img || config.LOGO}` // 👈 rowId වෙනුවට 'id'
            }));

            await conn.sendMessage(from, {
                image: { url: results[0].img || config.LOGO },
                caption: msg,
                footer: config.FOOTER,
                optionText: "🎥 Select Movie",
                optionTitle: "Zoom.lk Results",
                nativeFlow: [{
                    text: "🎥 Select Movie",
                    sections: [{ title: "Zoom.lk Search Results", rows: listRows }]
                }],
                viewOnce: true // 👈 එක පාරක් ක්ලික් කළ පසු මැසේජ් එක Expire වීමට
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: results[0].img || config.LOGO },
                caption: msg,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.log(e);
        reply("*Error fetching search results!*");
    }
});

//---------------------------------------------
// ZOOM MOVIE INFO & DOWNLOAD (DIRECT BUTTONS MODE)
//---------------------------------------------
cmd({
    pattern: "zoominfo",
    react: '📄',
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
        const [url, img] = q.split("±");

        const dllink = `https://nadeen-apis.koyeb.app/api/zoom/download?url=${encodeURIComponent(url)}&key=${nadeen}`;
        const dlresponse = await axios.get(dllink);
        
        if (!dlresponse.data || !dlresponse.data.result || !dlresponse.data.result.data) {
            return reply("*❌ Movie details not found!*");
        }

        const dl = dlresponse.data.result.data;
        const d = dl;
        const movieImage = img || config.LOGO;

        let infoMsg = `🎬 *${dl.movie_title ? dl.movie_title.replace('DOWNLOAD :', '').trim() : 'Unknown Movie'}*\n\n` +
                      `📅 *Date:* ${d.date ? d.date.split('T')[0] : 'N/A'}\n` +
                      `👤 *Uploader:* ${d.uploader || 'N/A'}\n` +
                      `📁 *Categories:* ${d.categories?.join(', ') || 'N/A'}\n\n` +
                      `📝 *Description:* ${d.desc?.[1] || d.desc?.[0] || 'No description available'}\n\n` +
                      `*Click below to download as ZIP:*`;

        // ================= WORKING DIRECT BUTTON MODE =================
        if (config.BUTTON === "true") {
            let nativeButtons = [];

            if (dl.download_url) {
                let cleanMovieTitle = dl.movie_title ? dl.movie_title.replace('DOWNLOAD :', '').trim() : 'Movie';
                nativeButtons.push({
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "📥 Download Movie ZIP",
                        id: `${prefix}zoom_dl ${dl.download_url}±${encodeURIComponent(cleanMovieTitle)}`
                    })
                });
            }

            if (nativeButtons.length === 0) return reply("*❌ No download links available!*");

            // @dnuzi/baileys හරහා කෙලින්ම Chat එකේ පෙනෙන Button එක යැවීම
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
        reply("*Error fetching movie info!*");
    }
});

// 3. ZOOM FINAL DOWNLOADER (ZIP)
cmd({
    pattern: "zoom_dl",
    react: "📦",
   category: "movie",
    dontAddCommandList: true,
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


        if (!q) return;
        const [dlUrl, title] = q.split("±");

        await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
        const upmsg = await conn.sendMessage(from, { text: `*📦 Uploading ${title} as ZIP...*` });

        // ZIP එකක් ලෙස කෙලින්ම යැවීම
        await conn.sendMessage(from, {
            document: { url: dlUrl },
            mimetype: "application/zip",
            fileName: `${title}.zip`,
            caption: `🎬 *${title}*\n\n*ZIP File - Zoom.lk*\n\n${config.FOOTER}`,
        }, { quoted: mek });

        await conn.sendMessage(from, { delete: upmsg.key });
        await conn.sendMessage(from, { react: { text: "✔️", key: m.key } });

    } catch (e) {
        console.log("Download error:", e);
        reply("*❌ Download failed! Link may be invalid.*");
    }
});
