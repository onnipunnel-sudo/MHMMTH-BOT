const { cmd ,commands } = require('../command');
const { exec } = require('child_process');
const config = require('../config');
const {sleep} = require('../lib/functions')

cmd({
    pattern: "hidetags",
    fromMe: true,  // Only bot owner can use this command
    desc: "Send a message with hidden tags to all group members.",
    category: "group",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, args, q, participants, reply }) => {
    try {
        // Check if the command is used in a group
        if (!isGroup) {
            return await reply("❌ This command can only be used in a group.");
        }
        // Check if a message is provided
        if (!q) {
            return await reply("❗ Please provide a message to send.");
        }
        // Extract group participants' contact IDs
        const participantIds = participants.map((participant) => participant.id);
        // Send the message with hidden tags
        await conn.sendMessage(from, { 
            text: q, 
            mentions: participantIds 
        });
        console.log("Hidetag message sent to all group members.");
    } catch (e) {
        console.error("Error while sending hidetag message:", e);
        await reply("❗ An error occurred while trying to send the hidetag message.");
    }
});

cmd({
  pattern: "forward3",
  fromMe: true,
  desc: "Send a TEXT to JIDs. Format: .sendjid jid1,jid2 | message  (Groups => hidetag)",
  category: "owner",
  react: "📤",
  filename: __filename
}, async (conn, mek, m, { q, reply }) => {
  try {
    if (!q || !q.includes("|")) {
      return await reply(
        "❗ Usage:\n.sendjid jid1,jid2 | your message\n\n" +
        "✅ Example:\n.sendjid 9477xxxxxxx@s.whatsapp.net,1203xxxx-123456@g.us | Hello!"
      );
    }

    const pipeIndex = q.indexOf("|");
    const jidPart = q.slice(0, pipeIndex).trim();
    const msgPart = q.slice(pipeIndex + 1).trim();

    const jids = [...new Set(
      jidPart.split(",")
        .map(x => x.trim())
        .filter(Boolean)
        .map(x => x.replace(/\s+/g, ""))
    )];

    if (!jids.length) return await reply("❗ Valid JID එකක්වත් නැහැ.");
    if (!msgPart) return await reply("❗ Message එක දාන්න ( | එකට පස්සේ ).");

    // (optional) remove manual @mentions you typed
    const textToSend = msgPart
      .replace(/@\d{5,20}/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    let success = 0, failed = 0;
    const failedList = [];

    for (const jid of jids) {
      try {
        let mentions = [];

        // Group => hidetag (auto mention everyone)
        if (jid.endsWith("@g.us")) {
          const meta = await conn.groupMetadata(jid);
          mentions = meta.participants.map(p => p.id);
        }

        await conn.sendMessage(jid, {
          text: textToSend,
          mentions
        });

        success++;
      } catch (err) {
        failed++;
        failedList.push(jid);
        console.log("sendjid failed:", jid, err?.message || err);
      }
    }

    let summary =
      `✅ *Send Done*\n\n` +
      `📌 Total: ${jids.length}\n` +
      `✅ Success: ${success}\n` +
      `❌ Failed: ${failed}`;

    if (failedList.length) {
      summary += `\n\n❌ Failed JIDs:\n` + failedList.map(x => `- ${x}`).join("\n");
    }

    return await reply(summary);

  } catch (e) {
    console.log("sendjid error:", e);
    return await reply("❗ Error occurred.");
  }
});
