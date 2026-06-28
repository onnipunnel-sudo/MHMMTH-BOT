
const config = require('../config'),
  { cmd, commands } = require('../command'),
  axios = require('axios'),
	fg = require('api-dylux'),
  sharp = require('sharp'),
 { Sticker, StickerTypes } = require('wa-sticker-formatter'),
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
  cinesubz_tv = require('sadasytsearch'),
  {
    cinesubz_info,
    cinesubz_tv_firstdl,
    cinesubz_tvshow_info,
  } = require('../lib/cineall'),
	key = process.env.SHAN_KEY;
var { updateCMDStore,isbtnID,getCMDStore,getCmdForCmdId,connectdb,input,get, updb,updfb } = require("../lib/database")

async function resizeImaged(buffer, width, height) {
    try {
        return await sharp(buffer)
            .resize(width, height, { fit: 'cover' })
            .toFormat('jpeg')
            .jpeg({ quality: 80 })
            .toBuffer();
    } catch (e) {
        console.log("Sharp error:", e.message);
        return null;
    }
}
//---------------------------------------------
// CINESUBZ SEARCH  (NEW API)
//---------------------------------------------
//---------------------------------------------
// CINESUBZ SEARCH
//---------------------------------------------
cmd({
  pattern: "cine",
  react: '🔎',
  category: "movie",
  alias: ["cinesubz"],
  desc: "cinesubz.lk movie search",
  use: ".cine 2025",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isNadeen, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isNadeen || isSudo || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
           return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii
 if (!q) {
	 
		
const randomImages = [
    "https://files.catbox.moe/zhlw42.webp",
    "https://files.catbox.moe/v5brfd.webp",
    "https://files.catbox.moe/f4y0bg.webp",
	"https://files.catbox.moe/wghoz4.webp",
    "https://files.catbox.moe/un05fw.webp"
];
		

		const rimg = randomImages[Math.floor(Math.random() * randomImages.length)];
		
	const sticker = new Sticker(rimg, {
    pack: 'MOVIExGO', // Pack name eka
    author: 'Nadeen', // Creator name eka
    type: StickerTypes.FULL, // Sticker type eka
    categories: ['🤩', '🎉'], // Sticker categories
    id: '12345', // Sticker id
    quality: 100, // Quality eka
    background: '#000000' // Background eka (optional)
});

const stickerBuffer = await sticker.toBuffer();

		// දෙවනුව text message එක යවා එතනින් function එක නතර කරනවා (return)
// Sticker eka message ekak widiyata yawanna
await conn.sendMessage(from, { sticker: stickerBuffer }, { quoted: mek });
	 return reply("*❗ Please give a movie name*");
 }
		
    const api =
      `https://apis.sadas.dev/api/v1/movie/cinesubz/search?q=${q}&apiKey=nadeenxdev0`;
    const data = (await axios.get(api)).data;

    if (!data?.data?.length) {
      

		const randomImagesz = [
    "https://files.catbox.moe/j9lgtl.webp",
    "https://files.catbox.moe/xx7k6a.webp",
    "https://files.catbox.moe/u267ni.webp",
	"https://files.catbox.moe/lj5p18.webp",
	"https://files.catbox.moe/tvbj72.webp",
    "https://files.catbox.moe/d49s5e.webp"
];
		

		const rimgz = randomImagesz[Math.floor(Math.random() * randomImagesz.length)];
		
	const stickerz = new Sticker(rimgz, {
    pack: 'MOVIExGO', // Pack name eka
    author: 'Nadeen', // Creator name eka
    type: StickerTypes.FULL, // Sticker type eka
    categories: ['🤩', '🎉'], // Sticker categories
    id: '12345', // Sticker id
    quality: 100, // Quality eka
    background: '#000000' // Background eka (optional)
});

const stickerBufferz = await stickerz.toBuffer();

// Sticker eka message ekak widiyata yawanna
await conn.sendMessage(from, { sticker: stickerBufferz }, { quoted: mek });
	return reply("*❌ No results found!*");
	}
    
    // ================= NEW BUTTON MODE (@dnuzi/baileys) =================
    if (config.BUTTON === "true") {

      // @dnuzi/baileys nativeFlow structure එකට අනුව rows සකස් කිරීම
      const movieRows = data.data.map(v => {
        let cmdType = v.link.includes("/tvshows/") ? "cinetvdl" : "cinedl";
        return {
          header: '',
          title: v.title.replace("Sinhala Subtitles", "").trim(),
          description: 'Click to view download links',
          id: `${prefix}${cmdType} ${v.link}±${v.image}±${v.title}`
        };
      });

      // @dnuzi/baileys nativeFlow Buttons භාවිතයෙන් message එක යැවීම
      await conn.sendMessage(from, {
        image: { url: config.LOGO },
        caption: `_*CINESUBZ SEARCH RESULTS 🎬*_\n\n*Input:* ${q}`,
        footer: config.FOOTER,
        optionText: '🎥 Select Movie',
        optionTitle: '🎬 Choose a Movie',
        nativeFlow: [{
          text: '🎥 Select Movie',
          sections: [{
            title: "Cinesubz Results",
            rows: movieRows
          }]
        }]
      }, { quoted: mek });

    }
    // ================= NEW LIST MODE (@dnuzi/baileys) =================
    else {

      // @dnuzi/baileys List structure එකට අනුව rows සකස් කිරීම
      let listRows = data.data.map(v => {
        let cmdType = v.link.includes("/tvshows/") ? "cinetvdl" : "cinedl";
        return {
          title: v.title.replace("Sinhala Subtitles | සිංහල උපසිරැසි සමඟ", "").replace("Sinhala Subtitle | සිංහල උපසිරැසි සමඟ", "").trim(),
          description: 'Tap to select this movie',
          rowId: `${prefix}${cmdType} ±${v.link}±${v.image}±${v.title}`
        };
      });

      // @dnuzi/baileys නවතම List Message ක්‍රමය (මෙය private chat වල පමණක් ක්‍රියා කරයි)
      await conn.sendMessage(from, {
        text: `_*CINESUBZ SEARCH RESULTS 🎬*_\n\n\`🕵️‍♂️Input:\` ${q}`,
        footer: config.FOOTER,
        title: "Cinesubz Results",
        buttonText: "🎥 Select Movie",
        sections: [{
          title: "Results",
          rows: listRows
        }]
      }, { quoted: mek });
    }

  } catch (e) {
    console.log(e);
    reply("*Error ❗*");
  }
});


//---------------------------------------------
// CINESUBZ INFO + DL LINKS
//---------------------------------------------
//---------------------------------------------
// CINESUBZ INFO + DL LINKS (DIRECT BUTTONS MODE)
//---------------------------------------------
cmd({
  pattern: "cinedl",
  react: "🎥",
  category: "movie",
  desc: "movie downloader with direct buttons",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isNadeen, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isNadeen || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }

    if (!q || !q.includes("movies"))
      return reply("*❗ Please use movie link only!*");
    console.log(`🧿Input`, q)
    
    // 🛠️ නිවැරදි අනුපිළිවෙලට split කරගැනීම (Search එකෙන් එන්නේ: link±image±title)
    let [url, img, title] = q.split("±");

    // 🛠️ චිත්‍රපටයේ නමේ ඇති සිස්ටම් එකට බාධා කරන සලකුණු ඉවත් කිරීම
    if (title) {
        title = title.replace(/[|\\/?:*<>"]/g, "").trim();
    }

    const infoAPI =
      `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-info?url=${encodeURIComponent(url)}&apikey=${key}`;
    const data = (await axios.get(infoAPI)).data;
    const d = data.data;

    const directors =
      (d.directors || "").replace(/Director:?/gi, "").trim();

    let msg =
`*_▫🍿 Title ➽ ${d.title}_*

▫📅 Year ➽ ${d.year}
▫⭐ IMDB ➽ ${d.rating}
▫⏳ Runtime ➽ ${d.duration}
▫🌎 Country ➽ ${d.country}
▫💎 Quality ➽ ${d.quality}
▫🕵️ Director ➽ ${directors}
▫🔉 Language ➽ ${d.tag}
`;

    // ================= NEW DIRECT BUTTON MODE =================
    if (config.BUTTON === "true") {

      // 🛠️ මුලින්ම "Movie Details" බොත්තම Buttons Array එකට දානවා
      let nativeButtons = [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "📄 Movie Details",
            id: `${prefix}ctdetails ±±${url}±${img}±${d.title}`
          })
        }
      ];

      // 🛠️ ඊළඟට Download Links ටික එකින් එක Direct බොත්තම් විදිහට එකතු කරනවා
      // ⚠️ සටහන: WhatsApp වල උපරිම පෙන්විය හැක්කේ Direct Buttons 10ක් පමණි.
      d.downloads.slice(0, 9).forEach(v => {
        nativeButtons.push({
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `⬇️ ${v.size} (${v.quality})`,
            id: `${prefix}paka ${img}±${v.link}±${d.title}±${v.quality}`
          })
        });
      });

      // @dnuzi/baileys හරහා කෙලින්ම Chat එකේ පෙනෙන Buttons යැවීම
      await conn.sendMessage(from, {
        image: { url: img },
        caption: msg,
        footer: config.FOOTER,
        nativeFlow: nativeButtons, // 👈 Select List නැතිව කෙලින්ම බොත්තම් ටික මෙතනට යනවා
        viewOnce: true // 👈 එක පාරක් පමණක් ක්ලික් කළ හැකි වීමට
      }, { quoted: mek });

    }
    // ================= NEW LIST MODE (@dnuzi/baileys) =================
    else {

      let listRows = [];

      listRows.push({
        title: "Movie Details",
        description: 'View full movie info',
        rowId: `${prefix}ctdetails ±±${url}±${img}±${d.title}`
      });

      d.downloads.forEach(v => {
        let cleanTitle = `${v.size} (${v.quality})`
          .replace("WEBDL", "").replace("WEB DL", "").replace("BluRay HD", "") 
          .replace("BluRay SD", "").replace("BluRay FHD", "").replace("Telegram BluRay SD", "") 
          .replace("Telegram BluRay HD", "").replace("Direct BluRay SD", "").replace("Direct BluRay HD", "") 
          .replace("Direct BluRay FHD", "").replace("FHD", "").replace("HD", "").replace("SD", "") 
          .replace("Telegram BluRay FHD", "").trim();

        listRows.push({
          title: cleanTitle,
          description: `Quality: ${v.quality} | Size: ${v.size}`,
          rowId: `${prefix}paka ${img}±${v.link}±${d.title}±${v.quality}`
        });
      });

      await conn.sendMessage(from, {
        image: { url: img },
        text: msg,
        footer: config.FOOTER,
        title: "🎬 Choose Option",
        buttonText: "⬇️ Select Link",
        sections: [{
          title: "Available Links",
          rows: listRows
        }],
        viewOnce: true
      }, { quoted: mek });
    }

  } catch (e) {
    console.log(e);
    reply("*Error ❗*");
  }
});
// ------------------ CINETVDL ------------------
// ------------------ CINETVDL ------------------
cmd({
  pattern: "cinetvdl",
  react: "📺",
  category: "movie",
  desc: "TV Show details + season selector with direct buttons",
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isNadeen, isMe, isSudo, isOwner, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isNadeen || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii

    if (!q || !q.includes("tvshows"))
      return reply("*❗ Please use a valid TV Show link!*");

    console.log("📺 Input:", q);

    // 🛠️ Search එකෙන් එන අනුපිළිවෙලට අනුව split කරගැනීම (link±image±title)
    let [urls, img, title] = q.split("±");
    
    // 🛠️ නමේ ඇති විශේෂ සලකුණු පිරිසිදු කිරීම
    if (title) {
        title = title.replace(/[|\\/?:*<>"]/g, "").trim();
    }

    let url = urls.replace('cinesubz.net', 'cinesubz.lk');
    const infoAPI =
      `https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(url)}`;

    const data = (await axios.get(infoAPI)).data;
    const d = data.result;

    /* ================= DETAILS CARD ================= */

    let detailsMsg =
      `*_▫️️🍀 Tɪᴛʟᴇ ➽ ${d.title}_*\n` +
      `*_▫️️📅 Yᴇᴀʀ ➽ ${d.year}_*\n` +
      `*_▫️️⭐ Iᴍᴅʙ ➽ ${d.imdb}_*\n` +
      `*_▫️️📺 Sᴇᴀsᴏɴs ➽ ${d.seasons.length}_*\n\n` +
      `*_▫️️🧿 Dᴇsᴄʀɪᴘᴛɪᴏัน ➽_*\n${d.description}`;

    await conn.sendMessage(from, {
      image: { url: img },
      caption: detailsMsg,
      footer: config.FOOTER
    }, { quoted: mek });

    /* ================= SEASON SELECT ================= */

    let msg =
      `📂 *Select a Season Below*\n` +
      `🎬 *${d.title}*`;

    // ===== NEW DIRECT BUTTON MODE =====
    if (config.BUTTON === "true") {

      let nativeButtons = [];

      // 🛠️ Seasons ටික එකින් එක Direct Buttons විදිහට Array එකට එකතු කරනවා
      // ⚠️ WhatsApp සීමාවන් නිසා උපරිම පෙන්විය හැක්කේ බොත්තම් 10ක් පමණි
      d.seasons.slice(0, 10).forEach(s => {
        nativeButtons.push({
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `📺 Season ${s.season}`,
            id: `${prefix}cinetvep ${img}±${url}±${d.title}±${s.season}`
          })
        });
      });

      // @dnuzi/baileys හරහා කෙලින්ම Chat එකේ පෙනෙන Buttons යැවීම
      await conn.sendMessage(from, {
        text: msg,
        footer: config.FOOTER,
        nativeFlow: nativeButtons, // 👈 ලැයිස්තු නොමැතිව කෙලින්ම බොත්තම් ටික මෙතනට යනවා
        viewOnce: true // 👈 එක පාරක් පමණක් ක්ලික් කළ හැකි වීමට
      }, { quoted: mek });

    } 
    // ===== NEW LIST MODE (@dnuzi/baileys) =====
    else {

      // @dnuzi/baileys List structure එකට අනුව rows සකස් කිරීම
      let listRows = d.seasons.map(s => ({
        title: `Season ${s.season}`,
        description: `Tap to select Season ${s.season}`,
        rowId: `${prefix}cinetvep ${img}±${url}±${d.title}±${s.season}`
      }));

      // @dnuzi/baileys නවතම List Message ක්‍රමවේදය
      await conn.sendMessage(from, {
        text: msg,
        footer: config.FOOTER,
        title: "📺 TV Show Seasons",
        buttonText: "📂 Select Season",
        sections: [{
          title: "Available Seasons",
          rows: listRows
        }],
        viewOnce: true
      }, { quoted: mek });
    }

  } catch (e) {
    console.log(e);
    reply("*❌ Error fetching TV show!*");
  }
});
// ------------------ CINETVEP ------------------
// ==================== 1. CINETVEP - EPISODES SELECTOR (ALWAYS LIST BUTTON MODE) ====================
cmd({
  pattern: "cinetvep",
  react: "📺",
  category: "movie",
  desc: "Select episodes with single select list button",
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

        if (!q) return reply("*❗ Missing season data!*");

        const [img, url, rawTitle, seasonNumber] = q.split("±");
        const title = rawTitle ? rawTitle.replace(/[±&]/g, "").trim() : "TV Show";

        const infoAPI = `https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(url.trim())}`;
        const data = (await axios.get(infoAPI)).data;
        const d = data.result;

        const season = d.seasons.find(s => s.season == seasonNumber);
        if (!season) return reply("*❌ Season not found!*");

        let msg = `🎬 *${title}*\n` +
                  `📺 *Season:* ${seasonNumber}\n\n` +
                  `📂 *Select an episode from the list below*`;

        const posterUrl = img || config.LOGO;

        // ================= WORKING VIEW-ONCE LIST MODE (FOR LARGE LISTS) =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            let listRows = [];

            // 1. ALL EPISODES OPTION
            listRows.push({
                header: '',
                title: "📦 ALL EPISODES",
                description: `Select to download whole season ${seasonNumber}`,
                id: `${prefix}cineall ${posterUrl}±${url}±${title}±${seasonNumber}`
            });

            // 2. ALL AVAILABLE EPISODES (ගොඩක් තිබුණත් ඔක්කොම List එකට වැටේ)
            season.episodes.forEach(ep => {
                listRows.push({
                    header: '',
                    title: `📺 Episode ${ep.episode}`,
                    description: `Tap to view links for Ep ${ep.episode}`,
                    id: `${prefix}cinetvepi ${posterUrl}±${ep.url}±${title}±${ep.episode}±${seasonNumber}`
                });
            });

            await conn.sendMessage(from, {
                image: { url: posterUrl },
                caption: msg,
                footer: config.FOOTER,
                optionText: "📥 Select Episode",
                optionTitle: `Episodes – Season ${seasonNumber}`,
                nativeFlow: [{
                    text: "📥 Select Episode",
                    sections: [{ title: "Available Episodes", rows: listRows }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: posterUrl },
                caption: msg + `\n\n*(Buttons Off Mode - Total Episodes: ${season.episodes.length})*`,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.log(e);
        reply("*❌ Error fetching episodes!*");
    }
});

// ==================== 2. CINETVEPI - QUALITY SELECTOR (ALWAYS LIST BUTTON MODE) ====================
cmd({
  pattern: "cinetvepi",
  react: "📥",
  category: "movie",
  desc: "TV Episode download qualities in list button",
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

        if (!q) return reply("*❗ Missing episode data!*");
        console.log("📡 Episode Input:", q);

        const [img, epUrl, rawTitle, episodeNumber, season] = q.split("±");
        const title = rawTitle ? rawTitle.replace(/[±&]/g, "").trim() : "TV Show";

        const api = `https://api-dark-shan-yt.koyeb.app/episode/cinesubz-info?url=${encodeURIComponent(epUrl.trim())}&apikey=${key}`;
        const response = await axios.get(api);
        const res = response.data; 

        if (!res.status || !res.data || !res.data.download || res.data.download.length === 0) {
            return reply("*❌ No download links found!*");
        }

        let msg = `🎬 *${title}*\n` +
                  `📺 *Episode:* ${episodeNumber}\n\n` +
                  `⬇️ *Select download quality from the list below*`;

        const posterUrl = img || config.LOGO;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            const listRows = res.data.download.map(dl => {
                let cleanQuality = dl.quality ? dl.quality.replace(/WEBDL|WEB DL|BluRay|HD|SD|FHD/gi, "").trim() : 'Link';
                return {
                    header: '',
                    title: `${cleanQuality} (${dl.size || 'N/A'})`.substring(0, 60),
                    description: 'Tap to get the direct download link',
                    id: `${prefix}pakatv ${posterUrl}±${dl.link}±${title}±${episodeNumber}±${dl.quality}±${season}`
                };
            });

            await conn.sendMessage(from, {
                image: { url: posterUrl },
                caption: msg,
                footer: config.FOOTER,
                optionText: '⬇️ Select Quality',
                optionTitle: `📥 Ep ${episodeNumber} Qualities`,
                nativeFlow: [{
                    text: '⬇️ Select Quality',
                    sections: [{ title: "Available Qualities", rows: listRows }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: posterUrl },
                caption: msg,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.log(e);
        reply("*❌ Error fetching episode download links!*");
    }
});


let isUploading = false;

cmd({
  pattern: "paka",
  react: "⬇️",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, mek, m, { from, q, isSudo,isOwner,isMe,isPre, reply }) => {

	 try {
		// isUploading = false;
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii

  if (!q) return reply("*❗ Missing download data!*");
  if (isUploading) return reply("*⏳ Another upload is in progress…*");

 // try {
    isUploading = true;

    console.log(`🤹🏼‍♂️ Final-dl:`, q);

    // q → img ± url ± title ± quality
    const [img, url, title, quality] = q.split("±");

    // Fetch download list
    const finalAPI =
      `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(url)}&apikey=${key}`;

    const data = (await axios.get(finalAPI)).data;

    const downloads = data?.data?.download;
    if (!downloads) return reply("*❌ No download links found!*");

    // ============================================
    // 🔥 SELECT BEST LINK (cloud → pix fallback)
    // ============================================
    let finalLink = null;

    // Remove Telegram links completely
    const filtered = downloads.filter(v => v.name !== "telegram");

    // 1) Try "cloud"
    const cloud = filtered.find(v => v.name === "unknown");
    if (cloud) finalLink = cloud.url;

	  if (!finalLink) {
	  const pix = filtered.find(v => v.name === "pix");
    if (pix) finalLink = pix.url;
	  }

    // 2) Else try pix
    if (!finalLink) {
      const gdrive = filtered.find(v => v.name === "gdrive");
      const GLink = gdrive.url;
let res = await fg.GDriveDl(GLink.replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/').replace('&export=download' , '/view'))

if (gdrive) finalLink = res.downloadUrl;
    }

    if (!finalLink)
      return reply("*❌ Valid download link not found!*");

    // Send uploading message
    const upmsg = await conn.sendMessage(from, { text: "*⬆️ Uploading movie...*" });

    console.log(`link:`, finalLink)

//https://i.ibb.co/m1fg0Cx/IMG-20251031-WA0012.jpg
	 const botimg = img;
async function resizeImage(buffer, width, height) {
  return await sharp(buffer)
    .resize(width, height)
    .toBuffer();
}
	  const botimgUrl = botimg;
        const botimgResponse = await fetch(botimgUrl);
        const botimgBuffer = await botimgResponse.buffer();
        
        // Resize image to 200x200 before sending
        const resizedBotImg = await resizeImage(botimgBuffer, 200, 200); 
	  
    await conn.sendMessage(config.JID || from, {
      document: { url: finalLink },
      mimetype: "video/mp4",
      caption: `🎬 *${title}*\n\n\`[${quality}]\`\n\n★━━━━━━━━✩━━━━━━━━★\n\n> *•ɴᴀᴅᴇᴇɴ-ᴍᴅ•*`,
      jpegThumbnail: resizedBotImg,
      fileName: `${title}.mp4`
    });

    await conn.sendMessage(from, { delete: upmsg.key });
    await conn.sendMessage(from, {
      react: { text: '✔️', key: mek.key }
    });

  } catch (e) {
    console.log("❌ paka error:", e);
    reply("*❗ Error while downloading*");
  }

  isUploading = false;
});


let isUploadingzm = false;

cmd({
  pattern: "pakatv",
  react: "⬇️",
	 category: "movie",
  dontAddCommandList: true,
  filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply }) => {
    try {
		 isUploadingzm = false;
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            // API එකෙන් පණිවිඩය ලබාගැනීම
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii


  if (!q) return reply("*❗ Missing download data!*");
  if (isUploadingzm) return reply("*⏳ Another upload is in progress…*");
   
 

    console.log(`🤹🏼‍♂️ Final-dl:`, q);

    // q → img ± url ± title ± quality
    const [img, url, title, num, quality, season] = q.split("±");
console.log(`🤹🏼‍♂️ link:`, url);
    // Fetch download list
    const finalAPI =
      `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(url)}&apikey=${key}`;

    const data = (await axios.get(finalAPI)).data;

    const downloads = data?.data?.download;
    if (!downloads) return reply("*❌ No download links found!!!*");

    // ============================================
    // 🔥 SELECT BEST LINK (cloud → pix fallback)
    // ============================================
    let finalLink = null;

    // Remove Telegram links completely
    const filtered = downloads.filter(v => v.name !== "telegram");

  // 1. මුලින්ම Google Drive (GDrive) පරීක්ෂා කිරීම
const gdrive = filtered.find(v => v.name === "gdrive");
if (gdrive) {
    try {
        const GLink = gdrive.url;
        // URL එක convert කර download link එක ලබා ගැනීම
        let res = await fg.GDriveDl(GLink.replace('https://drive.usercontent.google.com/download?id=', 'https://drive.google.com/file/d/').replace('&export=download' , '/view'));
        if (res && res.downloadUrl) {
            finalLink = res.downloadUrl;
        }
    } catch (e) {
        console.log("GDrive Download Error:", e);
    }
}

// 2. GDrive නැත්නම් හෝ වැඩ නොකරයි නම් "pix" පරීක්ෂා කිරීම
if (!finalLink) {
    const pix = filtered.find(v => v.name === "pix");
    if (pix) finalLink = pix.url;
}

// 3. තවමත් link එකක් නැත්නම් "unknown" පරීක්ෂා කිරීම
if (!finalLink) {
    const unknown = filtered.find(v => v.name === "unknown");
    if (unknown) finalLink = unknown.url;
}

// අවසාන පරීක්ෂාව
if (!finalLink) return reply("*❌ Could not retrieve a direct download link!*");

    // Send uploading message
    const upmsg = await conn.sendMessage(from, { text: "*⬆️ Uploading Episode...*" });

    console.log(`link:`, finalLink)
	  const botimgUrl = img;
        const botimgResponse = await fetch(botimgUrl);
        const botimgBuffer = await botimgResponse.arrayBuffer();
        async function resizeImage(buffer, width, height) {
  return await sharp(buffer)
    .resize(width, height)
    .toBuffer();
}
        // Resize image to 200x200 before sending
        const resizedBotImg = await resizeImage(botimgBuffer, 200, 200);
	  
    await conn.sendMessage(config.JID || from, {
      document: { url: finalLink},
      mimetype: "video/mp4",
      caption: `📺 *${title}*\n*[S0${season} | Episode ${num}]*\n\n\`[WEB-DL ${quality}]\`\n\n★━━━━━━━━✩━━━━━━━━★`,
      jpegThumbnail: resizedBotImg,
      fileName: `${title}(${quality}).mp4`
    });

    await conn.sendMessage(from, { delete: upmsg.key });
    await conn.sendMessage(from, {
      react: { text: '✔️', key: mek.key }
    });

  } catch (e) {
    console.log("❌ paka error:", e);
    reply("*❗ Error while downloading*");
  }

  isUploadingzm = false;
});

// ------------------ CINEALL ------------------
// ------------------ CINEALL ------------------
cmd({
  pattern: "cineall",
  react: "📦",
  category: "movie",
  desc: "Select quality for ALL episodes with direct buttons",
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

    if (!q) return reply("*❗ Missing data!*");

    // 🛠️ Search/TVDL එකෙන් එන අනුපිළිවෙලට අනුව split කරගැනීම (img±url±title±season)
    let [img, url, title, season] = q.split("±");

    // 🛠️ නමේ ඇති විශේෂ සලකුණු පිරිසිදු කිරීම
    if (title) {
        title = title.replace(/[|\\/?:*<>"]/g, "").trim();
    }

    const msg =
`📦 *ALL EPISODES*
🎬 ${title}
📺 *Season ${season}*

⬇️ *Select Quality*`;

    // ================= NEW DIRECT BUTTON MODE =================
    if (config.BUTTON === "true") {

      // @dnuzi/baileys nativeFlow quick_reply structure එකට අනුව direct buttons සකස් කිරීම
      const nativeButtons = [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "🎞 480p",
            id: `${prefix}cineallq 480p±${img}±${url}±${title}±${season}`
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "🎞 720p",
            id: `${prefix}cineallq 720p±${img}±${url}±${title}±${season}`
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "🎞 1080p",
            id: `${prefix}cineallq 1080p±${img}±${url}±${title}±${season}`
          })
        }
      ];

      // @dnuzi/baileys හරහා කෙලින්ම Chat එකේ පෙනෙන Buttons යැවීම
      await conn.sendMessage(from, {
        image: { url: img },
        caption: msg,
        footer: config.FOOTER,
        nativeFlow: nativeButtons, // 👈 ලැයිස්තු නොමැතිව කෙලින්ම බොත්තම් 3 Chat එකේ පෙන්වීමට
        viewOnce: true // 👈 එක පාරක් පමණක් ක්ලික් කළ හැකි වීමට
      }, { quoted: mek });

    }
    // ================= NEW LIST MODE (@dnuzi/baileys) =================
    else {

      const listRows = [
        { title: "480p", description: "Download season in 480p", rowId: `${prefix}cineallq 480p±${img}±${url}±${title}±${season}` },
        { title: "720p", description: "Download season in 720p", rowId: `${prefix}cineallq 720p±${img}±${url}±${title}±${season}` },
        { title: "1080p", description: "Download season in 1080p", rowId: `${prefix}cineallq 1080p±${img}±${url}±${title}±${season}` }
      ];

      await conn.sendMessage(from, {
        text: msg,
        footer: config.FOOTER,
        title: "📦 Select Quality",
        buttonText: "🎞 Select Quality",
        sections: [{
          title: "Available Qualities",
          rows: listRows
        }],
        viewOnce: true
      }, { quoted: mek });
    }

  } catch (e) {
    console.log(e);
    reply("*❌ Error showing quality list*");
  }
});

// ------------------ CINEALLQ ------------------
// ------------------ CINEALLQ (Download All Episodes) ------------------
cmd({
    pattern: "cineallq",
    react: "📥",
    category: "movie",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, m, mek, { from, q, prefix, isPre, isMe, isSudo, isOwner, reply, config }) => {
    try {
        // 1. බලය පරීක්ෂා කිරීම (Authorization)
        const isAuthorized = isMe || isOwner || isSudo || isPre;
        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }

        if (!q) return reply("*❗ දත්ත අසම්පූර්ණයි!*");
        const [quality, img, urlz, title, season] = q.split("±");
        
        const url = urlz.replace('cinesubz.net', 'cinesubz.lk');
        const wantQ = quality.replace("p", ""); // 480p -> 480
        
        // ඉහතින් ඇති key එක භාවිතා කරයි (82406ca340409d44)
        const apikey = key; 

        await reply(`✅ *Qulity:* ${quality}\n🚀 *Season ${season} All Episodes Downalding Start...*`);

        // 2. එපිසෝඩ් ලැයිස්තුව ලබා ගැනීම
        const infoAPI = `https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(url)}`;
        const { data: episodeListData } = await axios.get(infoAPI);
        const seasonData = episodeListData.result.seasons.find(s => s.season == season);
        
        if (!seasonData) return reply(`*❌ සීසන් ${season} සොයාගත නොහැකි විය!*`);

        // 3. එපිසෝඩ් එකින් එක ලූප් එකක් හරහා යැවීම
        for (const ep of seasonData.episodes) {
            try {
                console.log(`🎬 Processing Episode: ${ep.episode}`);

                // Step A: එපිසෝඩ් එකේ ඩවුන්ලෝඩ් ලින්ක්ස් ලබාගැනීම
                const epInfoAPI = `https://api-dark-shan-yt.koyeb.app/episode/cinesubz-info?url=${encodeURIComponent(ep.url)}&apikey=${apikey}`;
                const epRes = (await axios.get(epInfoAPI)).data;

                if (!epRes.data || !epRes.data.download) continue;

                // Step B: අවශ්‍ය Quality එකට අදාළ ලින්ක් එක සෙවීම
                const selectedQuality = epRes.data.download.find(v => v.quality.includes(wantQ));
                if (!selectedQuality) continue;

                // Step C: Direct ඩවුන්ලෝඩ් ලින්ක් එක (Pixeldrain/Cloud) ලබාගැනීම
                const finalAPI = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(selectedQuality.link)}&apikey=${apikey}`;
                const finalData = (await axios.get(finalAPI)).data;

                if (!finalData.status || !finalData.data.download) continue;

                const downloads = finalData.data.download;
                // Pixeldrain හෝ unknown (cloud) ලින්ක් එක තෝරා ගැනීම
                const bestLinkObj = downloads.find(v => v.name === "pix") || downloads.find(v => v.name === "unknown");

                if (!bestLinkObj || !bestLinkObj.url) continue;
configs = require('../config');
                // 4. වීඩියෝව WhatsApp වෙත යැවීම
                const botimgUrl = img;
        const botimgResponse = await fetch(botimgUrl);
        const botimgBuffer = await botimgResponse.arrayBuffer();
					
	  const resizedBotImg = await resizeImaged(botimgBuffer, 200, 200);
					
            //    } catch (e) { thumbBuffer = null; }
console.log(`🎬 Processing URL: ${bestLinkObj.url}`);
                await conn.sendMessage( configs.JID || from, {
                    document: { url: bestLinkObj.url },
                    mimetype: "video/mp4",
                    fileName: `${title} S${season}E${ep.episode} [${quality}].mp4`,
                    jpegThumbnail: resizedBotImg,
                    caption: `📺 *${title}*\n` +
                             `*[Season ${season} | Episode ${ep.episode}]*\n\n` +
                             `\`[Quality: ${quality}]\`\n\n` +
                             `> ${configs.FOOTER}`
                });

                // WhatsApp තහනම් වීම වැළැක්වීමට තත්පර 5 ක විවේකයක් (Delay)
                await new Promise(resolve => setTimeout(resolve, 5000));

            } catch (err) {
                console.log(`❌ Error in Ep ${ep.episode}:`, err.message);
            }
        }

        await reply("✅ *All Episodes Uploaded!*");

    } catch (e) {
        console.log(e);
        reply("*❌ පද්ධතියේ දෝෂයක් පවතී. පසුව උත්සාහ කරන්න.*");
    }
});

cmd({
  pattern: "ctdetails",
  react: "🎬",
	 category: "movie",
  desc: "Show movie details with Join Us link",
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


    if (!q) return await reply("*❗ Please provide a movie link!*");

    const [title, test, url, img] = q.split("±");
console.log(`💤Input:`, q)
	  console.log(`💤img:`, img)
	  console.log(`💤link:`, url)
    const infoAPI = `https://api-dark-shan-yt.koyeb.app/movie/cinesubz-info?url=${encodeURIComponent(url)}&apikey=${key}`;
    const data = (await axios.get(infoAPI)).data;
    const d = data.data;

    const directors = (d.directors || "").replace(/Director:?/gi, "").trim();

    let msg = `*_▫️️🍀 Tɪᴛʟᴇ ➽ ${d.title}_*\n` +
      `*_▫️️📅 Yᴇᴀʀ ➽ ${d.year}_*\n` +
      `*_▫️️⭐ Iᴍᴅʙ ➽ ${d.rating}_*\n` +
      `*_▫️️⏳ Rᴜɴᴛɪᴍᴇ ➽ ${d.duration}_*\n` +
      `*_▫️️🌎 Cᴏᴜɴᴛʀʏ ➽ ${d.country}_*\n` +
      `*_▫️️💎 Qᴜᴀʟɪᴛʏ ➽ ${d.quality}_*\n` +
      `*_▫️️🕵️ Dɪʀᴇᴄᴛᴏʀ ➽ ${directors}_*\n` +
      `*_▫️️🔉 Lᴀɴɢᴜᴀɢᴇ ➽ ${d.tag}_*\n\n` +
	   `*➣➣➣➣➣➣➣➣➣➣➣➣➣*`+
      `_🔗 *J๏เи µร*_ ➽ *https://whatsapp.com/channel/0029VagN2qW3gvWUBhsjcn3I*\n*➣➣➣➣➣➣➣➣➣➣➣➣➣*`;

    // Send details card only (no download buttons)
    await conn.sendMessage(config.JID, {
      image: { url: img },
      caption: msg,
      footer: config.FOOTER
    }, { quoted: mek });

    // React with ✔️
    await conn.sendMessage(from, { react: { text: '✔️', key: mek.key } });

  } catch (e) {
    console.log(e);
    await reply("*❗ Error fetching movie details*");
  }
});

cmd({
  pattern: "ctvdetails",
  react: "📺",
	 category: "movie",
  desc: "Show TV series details",
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


    if (!q) return reply("*❗ Please provide a TV show link!*");

    const [title, test, url, img] = q.split("±");

    console.log("📺 Input:", q);
    console.log("🖼 Image:", img);
    console.log("🔗 Link:", url);

    const infoAPI =
      `https://episodes-cine.vercel.app/api/details?url=${encodeURIComponent(url)}`;

    const data = (await axios.get(infoAPI)).data;
    const d = data.result;

    let msg =
      `*_▫️️🍀 Tɪᴛʟᴇ ➽ ${d.title}_*\n` +
      `*_▫️️📅 Yᴇᴀʀ ➽ ${d.year}_*\n` +
      `*_▫️️⭐ Iᴍᴅʙ ➽ ${d.imdb}_*\n` +
      `*_▫️️📺 Sᴇᴀsᴏɴs ➽ ${d.seasons.length}_*\n` +
      `*_▫️️🌎 Cᴏᴜɴᴛʀʏ ➽ ${d.country || "N/A"}_*\n\n` +
      `*_▫️️🧿 Dᴇsᴄʀɪᴘᴛɪᴏɴ ➽_*\n${d.description}\n\n` +
      `*➣➣➣➣➣➣➣➣➣➣➣➣➣*\n` +
      `_🔗 *J๏เи µร*_ ➽ *https://whatsapp.com/channel/0029VagN2qW3gvWUBhsjcn3I*\n` +
      `*➣➣➣➣➣➣➣➣➣➣➣➣➣*`;

    // 📺 SEND IMAGE + DETAILS
    await conn.sendMessage(config.JID || from, {
      image: { url: img },
      caption: msg,
      footer: config.FOOTER
    }, { quoted: mek });

    // ✔️ react
    await conn.sendMessage(from, {
      react: { text: "✔️", key: mek.key }
    });

  } catch (e) {
    console.log(e);
    reply("*❗ Error fetching TV show details*");
  }
});

// ==================== 1. PUPILVIDEO SEARCH (LIST BUTTON MODE) ====================
cmd({
    pattern: 'pupilvideo',
    react: '🔎',
    category: 'movie',
    alias: ['sinhalafilm'],
    desc: 'pupilvideo.blogspot.com movie search using list buttons',
    use: '.pupilvideo tape',
    filename: __filename,
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

        if (!q) {
            return await reply('*Please provide a movie name!*');
        }

        let res = await fetchJson('https://darksadas-yt-new-movie-search.vercel.app/?url=' + encodeURIComponent(q));

        if (!res || !res.data || res.data.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: '*No results found ❌*' }, { quoted: mek });
        }

        let captionText = `_*🎬PUPILVIDEO MOVIE SEARCH RESULTS 🎬*_\n\n*Movie Search :* ${q} 🔎`;

        // ================= WORKING VIEW-ONCE LIST MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            const listRows = res.data.map(v => {
                let cleanTitle = v.title ? v.title.replace(/[±&]/g, "").trim() : 'Movie';
                return {
                    header: '', // 👈 හිස්ව තැබීම අනිවාර්යයි
                    title: cleanTitle.substring(0, 60),
                    description: "Tap to view download options", // 👈 සරල විස්තරයක්
                    id: `${prefix}newdl ${v.link}` // 👈 rowId වෙනුවට 'id'
                };
            });

            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: captionText,
                footer: config.FOOTER,
                optionText: "Click to View Results 🎬",
                optionTitle: "PupilVideo Results",
                nativeFlow: [{
                    text: "Click to View Results 🎬",
                    sections: [{ title: "Search Results", rows: listRows }]
                }],
                viewOnce: true
            }, { quoted: mek });

        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: config.LOGO },
                caption: captionText,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { text: '🚩 *Error occurred!!*' }, { quoted: mek });
    }
});

// ==================== 2. PUPILVIDEO DOWNLOADER (DIRECT BUTTONS MODE) ====================
cmd({
    pattern: 'newdl',
    react: '🎥',
    category: "movie",
    desc: 'Movie downloader with quick reply options',
    filename: __filename,
},
async (conn, m, mek, { from, q, isMe, isPre, isSudo, isOwner, prefix, reply }) => {
    try {
        // 🧩 Sudo, Owner, Me හෝ Premium නම් පමණක් අවසර ඇත
        const isAuthorized = isMe || isOwner || isSudo || isPre;

        if (!isAuthorized) {
            const { data } = await axios.get('https://nadeen-botzdatabse.nadeenx.workers.dev/data.json');
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return await conn.sendMessage(from, { text: data.freemsg }, { quoted: mek });
        }
//iwaraiiii

        if (!q) {
            return await reply('*Please provide a valid link!*');
        }

        let res = await fetchJson('https://darksadasyt-new-mv-site-info.vercel.app/?url=' + encodeURIComponent(q));

        if (!res || !res.downloadLinks || res.downloadLinks.length < 1) {
            return await conn.sendMessage(from, { text: 'Error: Movie details or download links not found!' }, { quoted: mek });
        }

        let detailsMsg = `*🍟 𝗧ɪᴛլ𝗲 ➮* _${res.title || 'N/A'}_\n\n` +
                         `*📅 𝖱ᴇʟᴇᴀꜱᴇᴅ ᴅᴀᴛᴇ ➮* _${res.date || 'N/A'}_\n` +
                         `*👤 𝖲ᴜʙᴛɪᴛʟᴇ ʙʏ ➮* _${res.subtitle_author || 'N/A'}_\n\n` +
                         `*Select a download option below:*`;

        let nativeButtons = [];

        // Details Button එක එකතු කිරීම
        nativeButtons.push({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "📋 Details Send",
                id: `${prefix}dubdet ${q}`
            })
        });

        // බාගත කිරීමේ ක්වලිටි බොත්තම් එකතු කිරීම
        res.downloadLinks.forEach((dl) => {
            let cleanMovieTitle = res.title ? res.title.replace(/[±&]/g, "").trim() : 'Movie';
            nativeButtons.push({
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: `${dl.title}`.substring(0, 20),
                    id: `${prefix}ndll ${res.image}±${dl.link}±${cleanMovieTitle}`
                })
            });
        });

        const posterUrl = res.image || config.LOGO;

        // ================= WORKING DIRECT BUTTON MODE =================
        if (config.BUTTON === "true" || config.BUTTON === true) {
            await conn.sendMessage(from, {
                image: { url: posterUrl },
                caption: detailsMsg,
                footer: config.FOOTER,
                nativeFlow: nativeButtons.slice(0, 10), // Quick Reply බොත්තම් උපරිම 10කට යටත්ව
                viewOnce: true
            }, { quoted: mek });
        } 
        // ================= BUTTONS OFF MODE =================
        else {
            await conn.sendMessage(from, {
                image: { url: posterUrl },
                caption: detailsMsg,
                footer: config.FOOTER
            }, { quoted: mek });
        }

    } catch (e) {
        console.log(e);
        await conn.sendMessage(from, { text: '🚩 *Error !!*' }, { quoted: mek });
    }
});
cmd(
  {
    pattern: 'ndll',
    react: '\u2B07️',
	   category: "movie",
    dontAddCommandList: true,
    filename: __filename,
  },
  async (
    _0x2f0ef6,
    _0xd77443,
    _0x545d16,
    { from: _0x14af92, q: _0x16142, isMe: _0x3ce2c9, reply: _0x3e4568 }
  ) => {
    if (!_0x16142) {
      return await _0x3e4568('*Please provide a direct URL!*')
    }
    try {
      await _0x2f0ef6.sendMessage(
        _0x14af92,
        { text: '*Downloading your movie..\u2B07️*' },
        { quoted: _0xd77443 }
      )
      const _0x13ee02 = _0x16142.split('\xB1')[0],
        _0x5399c1 = _0x16142.split('\xB1')[1],
        _0x1a3677 = _0x16142.split('\xB1')[2],
        _0x29f4d8 = _0x5399c1 + '&download=true',
        _0x24c123 = _0x29f4d8.trim(),
        _0x49581f = await axios.get(_0x24c123, { responseType: 'arraybuffer' }),
        _0x27fa04 = Buffer.from(_0x49581f.data, 'binary'),
        _0x80bac7 = _0x13ee02,
        _0x3d0418 = await fetch(_0x80bac7),
        _0x17a7d5 = await _0x3d0418.buffer(),
        _0x2da743 = await resizeImage(_0x17a7d5, 200, 200),
        _0x2a71be = {
          document: _0x27fa04,
          caption:
            '\uD83C\uDFAC ' +
            _0x1a3677 +
            '\n\n' +
            config.NAME +
            '\n\n> _*\uD83C\uDFACNADEEN MD\uD83C\uDFAC*_',
          jpegThumbnail: _0x2da743,
          mimetype: 'video/mp4',
          fileName: _0x1a3677 + '.mp4',
        }
      await _0x2f0ef6.sendMessage(_0x14af92, {
        react: {
          text: '\u2B06️',
          key: _0xd77443.key,
        },
      })
      await _0x2f0ef6.sendMessage(
        _0x14af92,
        { text: '*Uploading your movie..\u2B06️*' },
        { quoted: _0xd77443 }
      )
      await _0x2f0ef6.sendMessage(config.JID, _0x2a71be)
      await _0x2f0ef6.sendMessage(_0x14af92, {
        react: {
          text: '\u2714️',
          key: _0xd77443.key,
        },
      })
    } catch (_0x5baf73) {
      console.error('Error fetching or sending', _0x5baf73)
      await _0x2f0ef6.sendMessage(_0x14af92, '*Error fetching or sending *', {
        quoted: _0xd77443,
      })
    }
  }
)
cmd(
  {
    pattern: 'dubmv',
    react: '\u2B07️',
	category: "movie",
    dontAddCommandList: true,
    filename: __filename,
  },
  async (
    _0x2f0ef6,
    _0xd77443,
    _0x545d16,
    { from: _0x14af92, q: _0x16142, isMe: _0x3ce2c9, reply: _0x3e4568 }
  ) => {
    if (!_0x16142) {
      return await _0x3e4568('*Please provide a direct URL!*')
    }
    try {
      await _0x2f0ef6.sendMessage(
        _0x14af92,
        { text: '*Downloading your movie..\u2B07️*' },
        { quoted: _0xd77443 }
      )
      const _0x13ee02 = _0x16142.split('\xB1')[0],
        _0x5399c1 = _0x16142.split('\xB1')[1],
        _0x1a3677 = _0x16142.split('\xB1')[2],
        _0x29f4d8 = _0x5399c1,
        _0x24c123 = _0x29f4d8.trim(),
        _0x49581f = await axios.get(_0x24c123, { responseType: 'arraybuffer' }),
        _0x27fa04 = Buffer.from(_0x49581f.data, 'binary'),
        _0x80bac7 = _0x13ee02,
        _0x3d0418 = await fetch(_0x80bac7),
        _0x17a7d5 = await _0x3d0418.buffer(),
        _0x2da743 = await resizeImage(_0x17a7d5, 200, 200),
        _0x2a71be = {
          document: _0x27fa04,
          caption:
            '\uD83C\uDFAC ' +
            _0x1a3677 +
            '\n\n' +
            config.NAME +
            '\n\n> _*\uD83C\uDFACNADEEN MD\uD83C\uDFAC*_',
          jpegThumbnail: _0x2da743,
          mimetype: 'video/mp4',
          fileName: _0x1a3677 + '.mp4',
        }
      await _0x2f0ef6.sendMessage(_0x14af92, {
        react: {
          text: '\u2B06️',
          key: _0xd77443.key,
        },
      })
      await _0x2f0ef6.sendMessage(
        _0x14af92,
        { text: '*Uploading your movie..\u2B06️*' },
        { quoted: _0xd77443 }
      )
      await _0x2f0ef6.sendMessage(config.JID, _0x2a71be)
      await _0x2f0ef6.sendMessage(_0x14af92, {
        react: {
          text: '\u2714️',
          key: _0xd77443.key,
        },
      })
    } catch (_0x5baf73) {
      console.error('Error fetching or sending', _0x5baf73)
      await _0x2f0ef6.sendMessage(_0x14af92, '*Error fetching or sending *', {
        quoted: _0xd77443,
      })
    }
  }
)
cmd(
  {
    pattern: 'dubdet',
    react: '\uD83C\uDFA5',
	   category: "movie",
    desc: 'moive downloader',
    filename: __filename,
  },
  async (
    _0x1875c6,
    _0x63b81d,
    _0x102c8d,
    { from: _0x5e2ca4, q: _0x3c3a9e, isMe: _0x4a995d, reply: _0x1e2b99 }
  ) => {
    try {
      if (!_0x3c3a9e) {
        return await _0x1e2b99('*please give me text !..*')
      }
      let _0x2f20f2 = await fetchJson(
        'https://darksadasyt-new-mv-site-info.vercel.app/?url=' + _0x3c3a9e
      )
      const _0x430178 = (
        await axios.get(
          'https://nadeen-botzdatabse.nadeenx.workers.dev/data.json'
        )
      ).data
      let _0x341eab =
        '*\uD83C\uDF5F \uD835\uDDE7ɪᴛʟᴇ \u27AE*  _' +
        (_0x2f20f2.title || 'N/A') +
        '_\n\n*\uD83D\uDCC5 \uD835\uDDE5ᴇʟᴇꜱᴇᴅ ᴅᴀᴛᴇ \u27AE*  _' +
        (_0x2f20f2.date || 'N/A') +
        '_\n*\uD83D\uDC81‍\u2642️ \uD835\uDDE6ᴜʙᴛɪᴛʟᴇ ʙʏ \u27AE* _' +
        (_0x2f20f2.subtitle_author || 'N/A') +
        '_\n\n> \uD83C\uDF1F Follow us : *' +
        _0x430178.chlink +
        '*\n\n> _*\uD83C\uDFACNADEEN MD\uD83C\uDFAC*_\n'
      await _0x1875c6.sendMessage(config.JID, {
        image: { url: _0x2f20f2.image },
        caption: _0x341eab,
      })
      await _0x1875c6.sendMessage(_0x5e2ca4, {
        react: {
          text: '\u2714️',
          key: _0x102c8d.key,
        },
      })
    } catch (_0x56c49e) {
      console.error('Error fetching or sending', _0x56c49e)
      await _0x1875c6.sendMessage(_0x5e2ca4, '*Error fetching or sending *', {
        quoted: _0x102c8d,
      })
    }
  }
)


