const config = require('../config'),
	 Seedr = require("seedr"),
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



cmd({
  pattern: "ytsmx",
  react: "🔎",
  category: "movie",
  alias: ["yts"],
  desc: "YTS.mx movie search using list buttons",
  use: ".ytsmx avengers",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isMe, isPre, isSudo, isOwner, reply }) => {
  try {

    // ---------------- PREMIUM CHECK ----------------
    // 🛠️ පරණ URL එක වෙනුවට නවතම Workers URL එකට යාවත්කාලීන කරන ලදී
    const pr = (await axios.get(
      "https://nadeen-botzdatabse.nadeenx.workers.dev/data.json"
    )).data;

    // මෙහි pr.mvfree හෝ වෙනත් විචල්‍යයක් ඔබගේ නව json එකට අනුව වෙනස් කරගන්න. 
    // දැනට කේතයේ ගැළපීම සඳහා පැරණි විචල්‍යයන් එලෙසම තබා ඇත.
    const isFree = pr.mvfree === "true";

    if (!isFree && !isMe && !isPre) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return await conn.sendMessage(from, {
        text:
          "*`You are not a premium user⚠️`*\n\n" +
          "_Price : 200 LKR ✔️_\n\n" +
          "*👨‍💻 Contact : 0778500326 , 0722617699*"
      }, { quoted: mek });
    }

    if (config.MV_BLOCK === "true" && !isMe && !isSudo && !isOwner) {
      return reply("*🚫 Command blocked by owner*");
    }

    if (!q) return reply("*❗ Please give a movie name*");

    // ---------------- SEARCH API ----------------
    const api = `https://api-dark-shan-yt.koyeb.app/movie/ytsmx-search?q=${encodeURIComponent(q)}&apikey=${key}`;
    const res = (await axios.get(api)).data;

    if (!res.data || res.data.length === 0)
      return reply("*❌ No movies found!*");

    const caption = `🎬 *YTS SEARCH RESULT*\n\n🔍 *Input:* ${q}`;

    // ---------------- WORKING VIEW-ONCE LIST MODE ----------------
    if (config.BUTTON === "true") {
      const listRows = res.data.map(v => ({
        header: '',
        title: v.title.replace(/download/gi, "").trim(),
        description: `Tap to view download options`, // 👈 සරල විස්තරයක් පමණි
        id: `${prefix}ytnx ${v.title}±${v.link}±${v.image}` // 👈 rowId වෙනුවට 'id' විය යුතුයි
      }));

      await conn.sendMessage(from, {
        image: { url: config.LOGO },
        caption: caption,
        footer: config.FOOTER,
        optionText: "🎥 Select Movie",
        optionTitle: "YTS Results",
        nativeFlow: [{
          text: "🎥 Select Movie",
          sections: [{
            title: "YTS Results",
            rows: listRows
          }]
        }],
        viewOnce: true
      }, { quoted: mek });

    } 
    // ---------------- BUTTON FALSE ----------------
    else {
      await conn.sendMessage(from, {
        image: { url: config.LOGO },
        caption: caption,
        footer: config.FOOTER
      }, { quoted: mek });
    }

  } catch (e) {
    console.log(e);
    reply("*🚩 Error while searching!*");
  }
});

cmd({
  pattern: "ytnx",
  react: "🎥",
  category: "movie",
  desc: "movie downloader using direct buttons",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
  try {

    if (!q) return reply("*❗ Invalid input data*");
    
    // input එකෙන් අගයන් වෙන් කර ගැනීම
    const parts = q.split("±");
    let title = parts[0];
    let url = parts[1];
    let img = parts[2];

    // යම් හෙයින් url එක පළමු කොටසේ ආවොත් (පැරණි input ක්‍රමවේදයන් සඳහා)
    if (!url && title && title.includes("movies")) {
      url = title;
      img = config.LOGO;
    }

    const infoAPI = `https://api-dark-shan-yt.koyeb.app/movie/ytsmx-download?url=${encodeURIComponent(url)}&apikey=${key}`;
    const data = (await axios.get(infoAPI)).data;
    const d = data.data;

    let msg = `*_▫🍿 Title ➽ ${d.title}_*\n\n` +
              `▫📅 Year ➽ ${d.year}\n` +
              `▫⭐ IMDB ➽ ${d.rating}\n` +
              `▫🎬 Info ➽ ${d.time}\n\n` +
              `*⚠ 2GB වලට අඩු ඒවා විතරක් ගන්න*`;

    const movieImage = img || d.image || config.LOGO;

    // ================= WORKING DIRECT BUTTON MODE =================
    if (config.BUTTON === "true") {
      let nativeButtons = [];

      // Movie Details බටන් එක මුලින්ම ඇතුළත් කිරීම
      nativeButtons.push({
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "📄 Movie Details",
          id: `${prefix}ytsinfo ${url}`
        })
      });

      // බාගත කිරීමේ ලින්ක්ස් Direct Buttons (quick_reply) ලෙස සකස් කිරීම
      d.downloads.forEach(v => {
        let cleanText = `${v.size} (${v.quality})`
          .replace(/WEBDL|WEB DL|BluRay HD|BluRay SD|BluRay FHD|Telegram BluRay SD|Telegram BluRay HD|Direct BluRay SD|Direct BluRay HD|Direct BluRay FHD|FHD|HD|SD|Telegram BluRay FHD/gi, "")
          .trim();

        nativeButtons.push({
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `📥 ${cleanText || v.quality}`,
            id: `${prefix}torren ${v.magnet}±${d.image}±${d.title}±${v.quality}`
          })
        });
      });

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
    reply("*Error ❗*");
  }
});
cmd({
  pattern: "ytsinfo",
  react: "🎬",
	 category: "movie",
  desc: "YTS movie downloader",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, reply }) => {
  try {

    if (!q) return reply("*❗ Missing movie data!*");

   // const [url, img, title] = q.split("±");

    const api =
      `https://api-dark-shan-yt.koyeb.app/movie/ytsmx-download?url=${encodeURIComponent(q)}&apikey=${key}`;

    const res = (await axios.get(api)).data;
    const d = res.data;

    let msg =
`*_▫🍿 Title ➽ ${d.title}_*

▫📅 Year ➽ ${d.year}
▫⭐ IMDB ➽ ${d.rating}
▫🎬 Info ➽ ${d.time}
*➣➣➣➣➣➣➣➣➣➣➣➣➣*
🪀Follow us : https://whatsapp.com/channel/0029VbCA4fF9RZAfkahNsr0s
*➣➣➣➣➣➣➣➣➣➣➣➣➣*
${config.FOOTER}
`;


      await conn.sendMessage(config.JID || from, {
        image: { url: d.image },
        caption: msg
      }, { quoted: mek });

  } catch (e) {
    console.log(e);
    reply("*🚩 Error fetching movie!*");
  }
});


const uploader = "nadeen";

cmd({
    pattern: "torren",
    react: '⬇️',
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return;

        const [rawMagnet, img, title, qulity] = q.split("±");
        const dllink = decodeURIComponent(rawMagnet);

        const mail = config.SEEDR_MAIL;
        const password = config.SEEDR_PASSWORD;

        if (!mail || !password) return reply("*Please add Seedr credentials!*");

        const seedr = new Seedr();
        await seedr.login(mail, password);

        const msg = await conn.sendMessage(from, { text: '*Checking Seedr status... 🔍*' }, { quoted: mek });

        let targetJid = from;
        if (config.JID && config.JID !== 'undefined' && config.JID !== 'null' && config.JID.trim() !== '') {
            targetJid = config.JID;
        }

        // 1. පවතින ෆයිල්ස් සහ ෆෝල්ඩර්ස් පරීක්ෂා කිරීම
        const currentFiles = await seedr.getVideos();
        let fileAlreadyExists = false;

        if (currentFiles && currentFiles.length > 0) {
            for (let folder of currentFiles) {
                // ෆෝල්ඩරයේ නම පරීක්ෂා කිරීම (Seedr සාමාන්‍යයෙන් folder object එකක් ලබා දෙයි)
                if (folder.name && folder.name.includes(title)) fileAlreadyExists = true;
                
                // ෆෝල්ඩරය ඇතුළත ඇති ෆයිල්ස් පරීක්ෂා කිරීම
                if (Array.isArray(folder)) {
                    for (let file of folder) {
                        if (file.name && file.name.includes(title)) fileAlreadyExists = true;
                    }
                }
            }
        }

        // 2. 🌟 ෆෝල්ඩර් සහ ෆයිල්ස් සම්පූර්ණයෙන්ම මකාදැමීමේ නිවැරදි ක්‍රමවේදය
        if (!fileAlreadyExists) {
            await conn.sendMessage(from, { text: '*Cleaning Seedr storage & uploading movie... ⬆*', edit: msg.key });
            
            if (currentFiles && currentFiles.length > 0) {
                for (let folder of currentFiles) {
                    // අදාළ ෆෝල්ඩරය ඇතුළේ ෆයිල්ස් තියෙනවා නම් ඒවා මුලින්ම මකනවා
                    if (Array.isArray(folder)) {
                        for (let file of folder) {
                            if (file.id) await seedr.deleteFile(file.id);
                        }
                    } else if (folder.id) {
                        // යම් හෙයකින් එය තනි ෆයිල් එකක් නම්
                        await seedr.deleteFile(folder.id);
                    }

                    // 🔥 දැන් ප්‍රධාන ෆෝල්ඩරය (Folder/Directory) සම්පූර්ණයෙන්ම මකාදමයි
                    // Seedr API අනුව ෆෝල්ඩර හැඳින්වීමට id, fid හෝ folder_id භාවිත විය හැක
                    const folderId = folder.fid || folder.id || folder.folder_id;
                    if (folderId) {
                        try {
                            await seedr.deleteFolder(folderId);
                        } catch (err) {
                            console.log("Folder delete reference error, trying alternative standard delete...");
                            // Seedr library එකේ විවිධ අනුවාද අනුව deleteFolder ක්‍රමවේදය
                            if (typeof seedr.deleteFolder === 'function') {
                                await seedr.deleteFolder(folderId).catch(e => console.log(e.message));
                            }
                        }
                    }
                }
            }
            // අලුත් මීඩියා එක ඇතුළත් කිරීම
            await seedr.addMagnet(dllink);
        }

        // 3. ෆයිල් එක බාගත වන තෙක් රැඳී සිටීම (Polling)
        let success = false;
        for (let i = 0; i < 40; i++) {
            await new Promise(r => setTimeout(r, 30000));
            const info = await seedr.getVideos();
            
            if (info && info.length > 0) {
                for (let folder of info) {
                    // ෆෝල්ඩරය ඇතුළත ඇති ෆයිල්ස් ලූප් කිරීම
                    const filesArray = Array.isArray(folder) ? folder : (folder.files || [folder]);
                    
                    for (let file of filesArray) {
                        if (!file.id) continue;
                        const fileData = await seedr.getFile(file.id);
                        
                        if (fileData && fileData.url) {
                            success = true;
                            
                            console.log("==================================================");
                            console.log(`🎬 MOVIE TITLE: ${title}`);
                            console.log(`🔗 SEEDR FINAL DIRECT DL LINK: ${fileData.url}`);
                            console.log("==================================================");

                            await conn.sendMessage(from, { text: `⬆️ *Uploading Movie as Document...*` }, { edit: msg.key });

                            let resizedThumb = null;
							async function resizeImaged(buffer, width, height) {
  try {
    return await sharp(buffer).resize(width, height).toBuffer();
  } catch (e) {
    return buffer;
  }
}
                            try {
                                const imgRes = await axios.get(decodeURIComponent(img), { responseType: 'arraybuffer' });
                                let thumbBuffer = Buffer.from(imgRes.data);
                                resizedThumb = await resizeImaged(thumbBuffer, 200, 200);
                            } catch (e) {
                                console.log("Thumbnail fetch error:", e.message);
                                resizedThumb = null;
                            }

                            await conn.sendMessage(targetJid, {
                                document: { url: fileData.url },
                                mimetype: "video/mp4",
                                fileName: `${title}.mp4`,
                                jpegThumbnail: resizedThumb ? resizedThumb : undefined,
                                caption: `*🎬 Name :* ${title}\n\n\`[${qulity}]\`\n${config.NAME || ''}\n\n${config.FOOTER || ''}`
                            }, { quoted: mek });
                            
                            break;
                        }
                    }
                    if (success) break;
                }
            }
            if (success) break;
            console.log(`Still downloading to Seedr... Attempt ${i+1}`);
        }

        if (!success) {
            return await conn.sendMessage(from, { text: '*❌ Error: Link not found or download took too long on Seedr!*', edit: msg.key });
        }
        
        await conn.sendMessage(from, { text: `*Movie sent successfully! ✔*`, edit: msg.key });
        await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

    } catch (e) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        console.error("❌ Torrent Command Error:", e);
        reply(`❌ *Error:* ${e.message}`);
    }
});
