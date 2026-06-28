const { addPremiumUser, getGithubFile, addDirectIncome } = require('../lib/github_db');
const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config'); // config එකෙන් owner තහවුරු කරගන්න

cmd({
    pattern: "addprem",
    react: "💸",
    category: "owner",
    desc: "Add premium user using LID and send Order with URL thumbnail (Owner Only)",
    use: ".addprem 947xxx,30"
}, async (conn, mek, m, { args, isOwner, isNadeen, reply }) => {
    // Owner පරීක්ෂාව
    if (!isOwner && !isNadeen) return reply("⚠️ *Access Denied:* This command is for the owner only.");

    try {
        if (!args[0]) return reply("Usage: .addprem 947xxxxxxxx,30");
        
        // Input එක වෙන් කර ගැනීම
        let [num, days] = args[0].split(",");
        if (!num || !days) return reply("⚠️ වැරදි ආකෘතියක්! Usage: .addprem 947xxxxxxxx,30");

        num = num.replace(/[^0-9]/g, '');
        const jid = num + "@s.whatsapp.net";

        reply("🔍 Searching for WhatsApp LID...");

        // ================= STEP 1: FIND LID =================
        const idResult = await conn.findUserId(jid);
        if (!idResult || idResult.lid === 'id-not-found') {
            return reply("❌ මෙම අංකයට අදාළ LID එකක් සොයාගත නොහැකි විය.");
        }

        const userLID = idResult.lid;

        // ================= STEP 2: SAVE TO DB =================
        const result = await addPremiumUser(userLID, days);

        // Owner ට සාර්ථකයි කියා මැසේජ් එකක් යැවීම
        await reply(`✅ *PREMIUM ADDED TO DB*\n\n👤 Phone: ${num}\n🪪 LID: ${userLID}\n📅 Expiry: ${result.dateString}\n💰 Price: Rs. ${result.price}`);

        // ================= STEP 3: CONVERT URL TO BUFFER =================
        // ඔයාට Thumbnail එක විදිහට දාන්න ඕනේ පින්තූරයේ URL එක මෙතනට දාන්න
        const thumbUrl = config.LOGO; 
        
        let thumbBuffer;
        try {
            // URL එකෙන් පინතූරය Download කර Buffer එකක් බවට පත් කිරීම
            const response = await axios.get(thumbUrl, { responseType: 'arraybuffer' });
            thumbBuffer = Buffer.from(response.data, 'binary');
        } catch (downloadError) {
            console.error("Thumbnail download failed, using empty buffer", downloadError);
            thumbBuffer = Buffer.alloc(0); // Download වෙන්නෙ නැතිවුණොත් හිස් buffer එකක් දීමට
        }

        // ================= STEP 4: SEND ORDER TO USER =================
        // දැන් Download කරගත්තු thumbBuffer එක යොදාගෙන Order Message එක යැවීම
        await conn.sendMessage(userLID, {
            orderText: `🛍️ *MOVIExGO PREMIUM ACTIVATED*\n\n✨ Hello ${num}, Your Premium Plan has been successfully activated!\n\n💎 Plan: Premium Subscription\n⏳ Validity: ${days} Days\n📅 Expiry Date: ${result.dateString}\n💵 Price: Rs. ${result.price}.00\n\n🍿 Enjoy your cinematic automation!\n\n> 👨🏻‍💻Contact Owner - wa.me/94711047701`,
            thumbnail: thumbBuffer // 👈 මෙතනට URL එකෙන් හදාගත්ත Buffer එක දෙනවා
        }, { quoted: mek });

    } catch (e) {
        reply("Error: " + e.message);
        console.error(e);
    }
});
cmd({
    pattern: "addpay",
    react: "💸",
    category: "owner",
    desc: "Add direct sale income Rs.200 (Owner Only)",
    use: ".addsales 947xxx"
}, async (conn, mek, m, { args, isOwner, isNadeen, reply }) => {
    // Owner පරීක්ෂාව
    if (!isOwner && !isNadeen) return reply("⚠️ *Access Denied:* This command is for the owner only.");

    try {
        if (!args[0]) return reply("Usage: .addsales 947xxx");
        const num = args[0].trim();
        
        // අලුත් function එක call කිරීම
        const result = await addDirectIncome(num);
        
        if (result.status === 'success') {
            reply(`✅ *INCOME ADDED*\n\n👤 Number: ${num}\n💰 Amount: Rs. ${result.price}\n💳 Total Income Updated Successfully! 🚀`);
        } else {
            reply("⚠️ Failed to update income. Internal Error.");
        }
    } catch (e) {
        reply("Error: " + e.message);
    }
});
cmd({
    pattern: "listprem",
    category: "owner",
    desc: "Check premium list and total income (Owner Only)"
}, async (conn, mek, m, { isOwner, reply }) => {
    // Owner පරීක්ෂාව
    if (!isOwner && !isNadeen) return reply("⚠️ *Access Denied:* This command is for the owner only.");

    try {
        const dataFile = await getGithubFile('movie-plans', 'data.json');
        const activeUsers = dataFile.content.active;
        const totalIncome = dataFile.content.total_income || 0;
        
        if (activeUsers.length === 0) return reply("No active premium users found.");

        let listMsg = `📊 *PREMIUM STATISTICS*\n\n`;
        listMsg += `👥 Total Active: ${activeUsers.length}\n`;
        listMsg += `💰 Total Income: Rs. ${totalIncome}\n\n`;
        listMsg += `*ACTIVE USERS LIST:*\n`;

        activeUsers.forEach((user, index) => {
            listMsg += `\n${index + 1}. 📱 ${user.number}\n   📅 Expiry: ${user.date}\n   💵 Paid: Rs.${user.price || 0}\n`;
        });

        reply(listMsg);
    } catch (e) {
        reply("Error: " + e.message);
    }
});
