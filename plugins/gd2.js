const config = require('../config')
const fg = require('api-dylux');
const { cmd } = require('../command')
const sharp = require('sharp')
const { getBuffer } = require('../lib/functions')

cmd({
    pattern: "gdrive",
    alias: ["gd2"],
    react: '📑',
    desc: "Download googledrive files.",
    category: "download",
    use: '.gdrive <googledrive link>',
    filename: __filename
},
async (conn, mek, m, {
    from, q, reply, l
}) => {
try {
    if (!q) return reply('*Please give me googledrive url !!*')

    let res = await fg.GDriveDl(
        q.replace(
            'https://drive.usercontent.google.com/download?id=',
            'https://drive.google.com/file/d/'
        ).replace('&export=download', '/view')
    )

    // ✅ Thumbnail from config.IMG
    let thumb = await getBuffer(config.IMG)
async function resizeImage(buffer, width, height) {
  return await sharp(buffer)
    .resize(width, height)
    .toBuffer();
}
    const botimgUrl = thumb;
        const botimgResponse = await fetch(botimgUrl);
        const botimgBuffer = await botimgResponse.buffer();
        
        // Resize image to 200x200 before sending
        const resizedBotImg = await resizeImage(botimgBuffer, 200, 200);

    await reply(
`*⬇ NADEEN-MD GDRIVE DOWNLOADER ⬇*

*📃 File name:* ${res.fileName}
*💈 File Size:* ${res.fileSize}
*🕹️ File type:* ${res.mimetype}

> *•ɴᴀᴅᴇᴇɴ-ᴍᴅ•*`
    )

    await conn.sendMessage(from, {
        document: { url: res.downloadUrl },
        fileName: res.fileName,
        mimetype: res.mimetype,
        jpegThumbnail: resizedBotImg, // 🖼️ config.IMG
        caption: res.fileName.replace('.mp4', '') +
            '\n\n> *•ɴᴀᴅᴇᴇɴ-ᴍᴅ•*'
    }, { quoted: mek })

} catch (e) {
    reply('*Error !!*')
    l(e)
}
})
