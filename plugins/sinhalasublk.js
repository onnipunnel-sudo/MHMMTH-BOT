const config = require('../config'),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
	sharp = require('sharp'),
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
  fetch = (..._0x1c20f7) =>
    import('node-fetch').then(({ default: _0x557a09 }) =>
      _0x557a09(..._0x1c20f7)
    ),
  { Buffer } = require('buffer'),
  FormData = require('form-data'),
  fs = require('fs'),
	
sadas = process.env.SADAS_KEY,
charuka =  process.env.CHARUKA_KEY,
  path = require('path'),
  fileType = require('file-type'),
  l = console.log
// // SINHALASUB SEARCH
//---------------------------------------------
cmd({
    pattern: "sinhalasub",
    react: '🔎',
    category: "movie",
    alias: ["sinsub", "sinhalasub"],
    desc: "Search movies on sinhalasub.lk using list buttons",
    use: ".sinhalasub <movie name>",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }

        if (config.MV_BLOCK == "true" && !isMe && !isSudo && !isOwner) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { 
                text: "*This command currently only works for the Bot owner. To disable it for others, use the .settings command 👨‍🔧.*" 
            }, { quoted: mek });
        }

        if (!q) return await reply('*Please enter a movie name! 🎬*');

        const { data: apiRes } = await axios.get(`https://apis.sadas.dev/api/v1/movie/sinhalasub/search?q=${encodeURIComponent(q)}&apiKey=${sadas}`);

        let results = [];
        if (Array.isArray(apiRes)) results = apiRes;
        else if (Array.isArray(apiRes.data)) results = apiRes.data;
        else results = [];

        if (!results.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
        }

        const caption = `_*SINHALASUB MOVIE SEARCH RESULTS 🎬*_\n\n*🏔️ Input:* ${q}`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true") {
            const listRows = results.map(v => ({
                header: '',
                title: (v.Title || v.title || "Unknown Title").replace(/Sinhala Subtitles\s*\|?\s*සිංහල උපසිරසි.*/gi, "").trim(),
                description: `Tap to select this movie`, // 👈 සරල විස්තරයක් පමණි
                id: `${prefix}sininfo ${v.Link}±${v.Img}`
            }));

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: caption,
                footer: config.FOOTER,
                optionText: "🎥 Select Movie",
                optionTitle: "SinhalaSub Results",
                nativeFlow: [{
                    text: "🎥 Select Movie",
                    sections: [{
                        title: "Available Movies",
                        rows: listRows
                    }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: caption,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("🔥 SinhalaSub Error:", e);
        reply('🚫 *Error Occurred !!*\n\n' + e.message);
    }
});

//---------------------------------------------
// SINHALASUB INFO & DOWNLOAD BUTTONS (DIRECT BUTTONS MODE)
//---------------------------------------------
cmd({
    pattern: "sininfo",
    alias: ["mdv"],
    use: ".sininfo <url>",
    category: "movie",
    react: "🎥",
    desc: "Download movies from sinhalasub.lk with direct buttons",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }

        if (!q) return reply("🚩 *Please give me a valid movie URL!*");

        const [url, img] = q.split("±");

        if (!url || !url.includes("https://sinhalasub.lk/movies/")) {
            return reply("*❗ This is a TV series use \`.sintv\`*");
        }

        const { data } = await axios.get(
            `https://my-apis-site.vercel.app/movie/sinhalasub/movie?url=${encodeURIComponent(url)}&apikey=${charuka}`
        );

        const sadas = data.result;
        if (!sadas) {
            return reply("🚩 *Movie info not found!*");
        }

        const msg = `🎬 *${sadas.title || "N/A"}*

📅 *Release:* ${sadas.releaseDate || "N/A"}
🌍 *Country:* ${sadas.country || "N/A"}
⭐ *Rating:* ${sadas.rating || "N/A"}
⏰ *Runtime:* ${sadas.duration || "N/A"}
🕵️ *Directed By:* ${sadas.director || "N/A"}

⬇ *Select download option below*`;

        const movieImage = img || config.LOGO;

        // ================= WORKING DIRECT BUTTON MODE =================
        if (config.BUTTON === "true") {
            let nativeButtons = [];

            // 🛠️ Pixeldrain ලින්ක්ස් පමණක් Direct Buttons (quick_reply) ලෙස සකස් කිරීම
            Object.values(sadas.dl_links || {}).forEach(serverArr => {
                serverArr.forEach(v => {
                    if (!v.url || v.url.includes("❌") || !v.url.startsWith("https://pixeldrain.com/")) return;

                    nativeButtons.push({
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: `📥 ${v.quality} (${v.size})`,
                            id: `${prefix}sindl ${v.url}±${movieImage}±${sadas.title}±${v.quality}`
                        })
                    });
                });
            });

            if (nativeButtons.length === 0) {
                return reply("❌ *No direct download links available!*");
            }

            // @dnuzi/baileys හරහා කෙලින්ම Chat එකේ පෙනෙන Buttons 10 සීමාවට යැවීම
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

    } catch (err) {
        console.error(err);
        reply("🚫 *Error Occurred!*\n\n" + err.message);
    }
});


let isUploadinggg = false; // Track upload status

cmd({
    pattern: "sindl",
    react: "⬇️",
	 category: "movie",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    if (isUploadinggg) {
        return await conn.sendMessage(from, { 
            text: '*A movie is already being uploaded. Please wait until it finishes.* ⏳', 
            quoted: mek 
        });
    }
console.log(`Input:`, q)
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
        //===================================================
        const [pix, imglink, title, qulity] = q.split("±");
        if (!pix || !imglink || !title || !qulity) return await reply("⚠️ Invalid format. Use:\n`sindl link±img±title±$quality`");
        //===================================================

       /* const da = pix.split("https://pixeldrain.com/u/")[1];
		console.log(da)
        if (!da) return await reply("⚠️ Couldn’t extract Pixeldrain file ID.");

        const fhd = `https://pixeldrain.com/api/file/${da}`;
        isUploadinggg = true; // lock start
		const down = await axios.get(`https://api-dark-shan-yt.koyeb.app/download/pixeldrain?url=${fhd}&apikey=d4a5c39da3e24d13`);
		const pixn = down.data.data.download */
		const pix2 = pix.replace('https://pixeldrain.com/u/','https://pixeldrain.com/api/file/')
		const pixn = pix2 + '?download'
		console.log(`🏵️Input:`, pixn)
        //===================================================
        const botimg = imglink.trim();
       try {
    const resImg = await axios.get(botimg, { responseType: 'arraybuffer' });
    thumbBuffer = Buffer.from(resImg.data, 'binary');
} catch (err) {
    console.log("Thumbnail fetch failed, using default logo:", err.message);
    const defaultLogo = config.LOGO; // fallback
    const resImg = await axios.get(defaultLogo, { responseType: 'arraybuffer' });
    thumbBuffer = Buffer.from(resImg.data, 'binary');
}
		async function resizeImage(buffer, width, height) {
  return await sharp(buffer)
    .resize(width, height)
    .toBuffer();
}
const botimgUrl = imglink;
        const botimgResponse = await fetch(botimgUrl);
        const botimgBuffer = await botimgResponse.buffer();
        
        // Resize image to 200x200 before sending
        const resizedBotImg = await resizeImage(botimgBuffer, 200, 200);
const message = {
    document: { url: pixn },
    caption: `🎬 ${title}\n\n\`[${qulity}]\`\n\n${config.NAME}`,
    mimetype: "video/mp4",
    jpegThumbnail: resizedBotImg || config.LOGO,
    fileName: `${title}.mp4`,
};

        // Send "uploading..." msg without blocking
        conn.sendMessage(from, { text: '*Uploading your movie.. ⬆️*', quoted: mek });

        // Upload + react + success (parallel tasks)
        await Promise.all([
            conn.sendMessage(config.JID || from, message),
            conn.sendMessage(from, { react: { text: '✔️', key: mek.key } })
            
        ]);

    } catch (e) {
        reply('🚫 *Error Occurred !!*\n\n' + e.message);
        console.error("sindl error:", e);
    } finally {
        isUploadinggg = false; // reset lock always
    }
});


cmd({
    pattern: "daqt",
    alias: ["mdv"],
    use: '.moviedl <url>',
	 category: "movie",
    react: "🎥",
    desc: "Send full movie details from sinhalasub.lk",
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



    if (!q) return reply('🚩 *Please give me a valid movie URL!*');
//const [url, img] = q.split("±");
    // ✅ Fetch movie info from API
    const { data } = await axios.get(`https://my-apis-site.vercel.app/movie/sinhalasub/movie?url=${encodeURIComponent(q)}&apikey=${charuka}`);
    const sadas = data.result;

    if (!sadas || Object.keys(sadas).length === 0)
        return await reply('*🚫 No details found for this movie!*');

    // ✅ Fetch extra details (for footer / channel link)
    const details = (await axios.get('https://raw.githubusercontent.com/Nadeenpoorna-app/main-data/refs/heads/main/master.json')).data;

    // 🧾 Caption Template
    const msg = `*🍿 𝗧ɪᴛʟᴇ ➮* *_${sadas.title || 'N/A'}_*

*📅 𝗥𝗲𝗹𝗲𝗮𝘀𝗲𝗱 𝗗𝗮𝘁𝗲 ➮* _${sadas.releaseDate || 'N/A'}_
*🌎 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 ➮* _${sadas.country || 'N/A'}_
*💃 𝗥𝗮𝘁𝗶𝗻𝗴 ➮* _${sadas.imdb || 'N/A'}_
*⏰ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲 ➮* _${sadas.duration || 'N/A'}_
*🕵️‍♀️ 𝗗𝗶𝗿𝗲𝗰𝘁𝗲𝗱 𝗕𝘆 ➮* _${sadas.director || 'N/A'}_
*🔉𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲 ➮* _${sadas.language || 'N/A'}_

> 🌟 *Follow us :* ${config.LINK || 'N/A'}
${config.FOOTER}
`;

    // ✅ Send movie info message
    await conn.sendMessage(
        config.JID || from,
        {
            image: { url: sadas.poster|| config.LOGO },
            caption: msg,
            footer: config.FOOTER || "VISPER-MD 🎬",
        },
        { quoted: mek }
    );

    // ✅ React confirmation
    await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

} catch (error) {
    console.error('Error fetching or sending:', error);
    await conn.sendMessage(from, { text: `🚫 *Error Occurred While Fetching Movie Data!* \n\n${error.message}` }, { quoted: mek });
}
});
  
//sinhalasub tv show
const API_KEY = "${charuka}";
const BASE_URL = "https://my-apis-site.vercel.app/movie/sinhalasub";

// ----------------------------------------------------------------------------------------------------
// 1. SEARCH COMMAND (TV SHOWS ONLY) - ALIAS: sinhalasutv, sintv
// ----------------------------------------------------------------------------------------------------
cmd({
    pattern: "sinhalasubtv",
    react: '📺',
    category: "movie",
    alias: ["sinhalasutv", "sintv", "sinhalatv"],
    desc: "Search TV shows from sinhalasub.lk",
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isMe, isOwner, isSudo, isPre, reply }) => {
    try {
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            const { data: db } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            return await conn.sendMessage(from, { text: db.freemsg }, { quoted: mek });
        }

        if (!q) return reply('*❗ Please enter a TV series name (e.g. .sintv Loki)*');

        const { data } = await axios.get(`${BASE_URL}/search?text=${encodeURIComponent(q)}&apikey=${API_KEY}`);
        
        if (!data.status || !data.result || data.result.length === 0) {
            return reply("*❌ No results found on SinhalaSub!*");
        }

        // TV Shows විතරක් Filter කිරීම
        const results = data.result.filter(v => v.link.includes('/tvshows/'));
        if (results.length === 0) return reply("*❌ No TV Series found for this search!*");

        let rows = results.map(v => ({
            title: v.title.replace("Sinhala Subtitles", "").trim(),
            rowId: `${prefix}sintvinfo ${v.link}`
        }));

        await conn.listMessage(from, {
            text: `*_SINHALASUB TV SEARCH RESULTS 📺_*`,
            footer: config.FOOTER,
            title: "Select a TV Series 🎥",
            buttonText: "Click Here 🔢",
            sections: [{ title: "Search Results", rows }]
        }, mek);

    } catch (e) {
        console.log(e);
        reply("*❌ Search Error! Try again later.*");
    }
});

// ----------------------------------------------------------------------------------------------------
// 2. INFO COMMAND (FIXED UNDEFINED ERROR)
// ----------------------------------------------------------------------------------------------------
cmd({
    pattern: "sintvinfo",
    react: '🎥',
    category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return;
        
        const { data } = await axios.get(`${BASE_URL}/tvshow?url=${encodeURIComponent(q)}&apikey=${API_KEY}`);
        const show = data?.result;

        if (!show || !show.title) {
            return reply("*❌ Error: Could not fetch details for this show!*");
        }

        // විස්තර සකස් කිරීම
        let details = `🎬 *${show.title}*\n\n` +
                      `▫️⭐ *IMDB:* ${show.imdb || 'N/A'}\n` +
                      `▫️📅 *Date:* ${show.date || 'N/A'}\n` +
                      `▫️🎭 *Genres:* ${show.category ? show.category.join(', ') : 'N/A'}\n\n` +
                      `*Please select an Episode/Season below:*`;

        // Episode List එක හදනවා
        if (!show.episodes || show.episodes.length === 0) {
            return reply("*❌ No episodes found for this show!*");
        }

        let rows = show.episodes.map(v => ({
            title: v.title || "Episode",
            rowId: `${prefix}sintvepi ${v.url}±${show.image}`
        }));

        const sections = [{ title: "Available Episodes", rows }];

        // Image එකත් එක්කම විස්තර යැවීම
        await conn.sendMessage(from, {
            image: { url: show.image || config.LOGO },
            caption: details,
            footer: config.FOOTER,
            buttons: [
                { 
                    buttonId: "list_ep", 
                    buttonText: { displayText: "📂 Select Episode" }, 
                    type: 4, 
                    nativeFlowInfo: { 
                        name: "single_select", 
                        paramsJson: JSON.stringify({ title: "Episode List", sections }) 
                    }
                }
            ],
            headerType: 4
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("*❌ Info Error: API response issue or Link error!*");
    }
});

// ----------------------------------------------------------------------------------------------------
// 3. EPISODE QUALITY SELECT (FILTERING)
// ----------------------------------------------------------------------------------------------------
cmd({
    pattern: "sintvepi",
    react: '🎬',
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
    try {
        if (!q) return;
        const [epUrl, showImg] = q.split("±");

        const { data } = await axios.get(`${BASE_URL}/episode?url=${encodeURIComponent(epUrl)}&apikey=${API_KEY}`);
        const result = data?.result;

        if (!result || !result.dl_links) return reply("*❌ No download links available!*");

        // Userdrive/Telegram ලින්ක් අයින් කරනවා
        const filteredLinks = result.dl_links.filter(v => 
            !v.link.includes('userdrive') && !v.link.includes('t.me') && !v.link.includes('telegram')
        );

        if (filteredLinks.length === 0) return reply("*❌ Only Userdrive/Telegram links found. Cannot download!*");

        let rows = filteredLinks.map(v => ({
            title: `${v.quality} (${v.size})`,
            rowId: `${prefix}sintvdl ${v.link}±${result.title}±${showImg}±${v.quality}`
        }));

        await conn.listMessage(from, {
            text: `*🍿 Episode:* ${result.title}\n\n*Select quality to download:*`,
            footer: config.FOOTER,
            title: "Download Quality",
            buttonText: "Select One 🎥",
            sections: [{ title: "Available Qualities", rows }]
        }, mek);

    } catch (e) {
        console.log(e);
        reply("*❌ Episode Error!*");
    }
});

// ----------------------------------------------------------------------------------------------------
// 4. FINAL DOWNLOAD
// ----------------------------------------------------------------------------------------------------
cmd({
    pattern: "sintvdl",
    react: '⬇️',
    dontAddCommandList: true,
    filename: __filename
}, 
async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return;
        const [url, title, img, qual] = q.split("±");

        let directLink = url;
        if (url.includes("pixeldrain.com/u/")) {
            directLink = `https://pixeldrain.com/api/file/${url.split("/u/")[1]}`;
        }

        if (global.isUploading) return reply("*⏳ Another file is uploading. Wait!*");
        global.isUploading = true;

        await reply(`*🚀 Uploading:* _${title}_ (${qual})`);

        const thumbRes = await fetch(img || config.LOGO);
        const thumb = await thumbRes.buffer();

        await conn.sendMessage(from, {
            document: { url: directLink },
            mimetype: "video/mp4",
            fileName: `${title} - ${qual}.mp4`,
            jpegThumbnail: thumb,
            caption: `🎬 *${title}*\n⭐ *Quality:* ${qual}\n\n${config.FOOTER}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });
        global.isUploading = false;

    } catch (e) {
        global.isUploading = false;
        console.log(e);
        reply("*❌ Upload failed! Link may be expired.*");
    }
});
//==========================================================================================================

cmd({
  pattern: "dtaqt",
  alias: ["mdv"],
  react: "🎥",
	 category: "movie",
  desc: "Download movie details from SinhalaSub TV",
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



  if (!q) return reply('🚩 *Please give me a valid SinhalaSub TV link!*');

  const sadas = await axios.get(`https://test-sadaslk-apis.vercel.app/api/v1/movie/sinhalasub/tv/info?q=${encodeURIComponent(q)}&apiKey=vispermdv4`);
  const details = (await axios.get('https://raw.githubusercontent.com/Nadeenpoorna-app/main-data/refs/heads/main/master.json')).data;

  const result = sadas.data.result;
  if (!result) return reply('❌ *No data found!*');

  const caption = `*☘️ Title:* *_${result.title || 'N/A'}_*\n\n` +
    `*📅 Date:* _${result.date || 'N/A'}_\n` +
    `*💃 Rating:* _${result.imdb || 'N/A'}_\n` +
    `*💁‍♂️ Subtitle By:* _${result.director || 'Unknown'}_\n\n` +
    `> 🌟 Follow us : *${details.chlink || 'N/A'}*\n\n` +
    `> _*${config.FOOTER}*_`;

  await conn.sendMessage(from, { image: { url: result.image[0] }, caption }, { quoted: mek });
  await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

} catch (error) {
  console.error('Error fetching or sending:', error);
  reply('🚫 *Error fetching movie details!*');
}
});

  
//==================================================================
// 🖼️ SinhalaSub TV All Images Sender
//==================================================================
cmd({
    pattern: "ch",
    alias: ["tvimg"],
    use: '.ch <url>',
    react: "🖼️",
    desc: "Send all SinhalaSub TV screenshots/posters",
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



        if (!q) return reply('🚩 *Please provide a SinhalaSub TV URL!*');

        // API request
        let sadas = await axios.get(`https://test-sadaslk-apis.vercel.app/api/v1/movie/sinhalasub/tv/info?q=${encodeURIComponent(q)}&apiKey=vispermdv4`);

        const result = sadas.data.result;
        if (!result || !result.image || result.image.length === 0)
            return reply('⚠️ *No images found for this title!*');

        for (let url of result.image) {
            await conn.sendMessage(from, { image: { url } }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (error) {
        console.error('Error fetching or sending images:', error);
        reply('🚫 *Error while sending images!*');
    }
});

//===========================================================================================================
