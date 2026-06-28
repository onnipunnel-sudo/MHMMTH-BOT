const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
var { updateCMDStore,isbtnID,getCMDStore,getCmdForCmdId,connectdb,input,get, updb,updfb } = require("../lib/database")

let BOTOW = '';

if (config.LANG === 'SI') {
  BOTOW = "*ඔබ Bot හි හිමිකරු හෝ උපපරිපාලකයෙකු නොවේ !*";
} else {
  BOTOW = "*You are not the bot's owner or moderator !*";
}
//.

cmd({
    pattern: "settings",
    react: "⚙️",
    alias: ["setting",'botsetting'],
    //desc: desc2,
    category: "main",
    use: '.settings',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, prefix, isNadeen, q, isSudo, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isNadeen) return await reply('*NADEEN ONLY ⛔*') 
const sections = [
 {
  title: "⚙️ BUTTON MODE ⚙️",
  rows: [
    { title: "🔘 BUTTON MODE  |  _ON_", rowId: prefix + "button on" },
    { title: "⚪ BUTTON MODE  |  _OFF_", rowId: prefix + "button off" }
  ]
},
  {
    title: "⚙️ AUTO SETTINGS ⚙️",
    rows: [
      { title: "🟢 AUTO STATUS READ", rowId: prefix + "autos on" },
      { title: "🔴 AUTO STATUS READ (Off)", rowId: prefix + "autos off" },
      { title: "🟢 AUTO MESSAGE READ", rowId: prefix + "autoread on" },
      { title: "🔴 AUTO MESSAGE READ (Off)", rowId: prefix + "autoread off" },
      { title: "🎙 AUTO RECORDING (On)", rowId: prefix + "autorec on" },
      { title: "🔇 AUTO RECORDING (Off)", rowId: prefix + "autorec off" },
      { title: "⌨️ AUTO TYPING (On)", rowId: prefix + "autotyping on" },
      { title: "❌ AUTO TYPING (Off)", rowId: prefix + "autotyping off" }
    ]
  },

  {
    title: "🧠 SMART FEATURES 🧠",
    rows: [
      { title: "🤖 AI CHATBOT (On)", rowId: prefix + "chatbot on" },
      { title: "🧩 AUTO REACT (On)", rowId: prefix + "autoreact on" },
      { title: "🛡 ANTI DELETE (On)", rowId: prefix + "antdel on" },
      { title: "🚫 ANTI LINK (On)", rowId: prefix + "antilink on" },
      { title: "🚷 ANTI BOT (On)", rowId: prefix + "antibot on" },
      { title: "💢 ANTI BAD (On)", rowId: prefix + "antibad on" }
    ]
  },

  {
    title: "⚔️ BLOCKER FEATURES ⚔️",
    rows: [
      { title: "🎞 MOVIE LINK BLOCK", rowId: prefix + "mvblock on" },
      { title: "📵 AUTO BLOCK (On)", rowId: prefix + "autoblock on" },
      { title: "📵 ANTI CALL (On)", rowId: prefix + "anticall on" }
    ]
  },

  {
    title: "💫 ADVANCED CONTROLS 💫",
    rows: [
      { title: "📡 ALWAYS ONLINE (On)", rowId: prefix + "alo on" },
      { title: "🔊 AUTO VOICE (On)", rowId: prefix + "autovoice on" },
      { title: "📖 READ-ONLY MODE (On)", rowId: prefix + "ronly on" },
      { title: "📖 READ-ONLY MODE (Off)", rowId: prefix + "ronly off" }
    ]
  }
];

const caption = `*_⚙️ VISPER SETTINGS INFO ⚙️_*`
const listMessage = {
text: `*_⚙️ VISPER SETTINGS INFO ⚙️_*

`,
	
footer: config.FOOTER,
	
title: '',
buttonText: '*🔢 Reply below number*',
sections
}

const listButtons = {
  title: "❯❯ Choose a setting to toggle ❮❮",
  sections: [
    {
      title: "General Settings ⚙️",
      rows: [
        { title: "MODE - BUTTON", description: "Bot button on", id: prefix + "button on" },
        { title: "MODE - NON-BUTTON", description: "Only button off", id: prefix + "button off" }
      ]
    },
    {
      title: "Automation 🤖",
      rows: [
        { title: "Auto Read Status - ON", description: "Mark status as seen", id: prefix + "autos on" },
        { title: "Auto Read Status - OFF", description: "Don't mark status as seen", id: prefix + "autos off" },
        { title: "Auto Message Read - ON", description: "Marks messages as read", id: prefix + "autoread on" },
        { title: "Auto Message Read - OFF", description: "Disables auto read", id: prefix + "autoread off" },
        { title: "Auto Typing - ON", description: "Shows typing animation", id: prefix + "autotyping on" },
        { title: "Auto Typing - OFF", description: "Disables typing animation", id: prefix + "autotyping off" },
        { title: "Auto Recording - ON", description: "Shows recording animation", id: prefix + "autorec on" },
        { title: "Auto Recording - OFF", description: "Disables recording animation", id: prefix + "autorec off" }
      ]
    },
    {
      title: "Security & Filters 🛡️",
      rows: [
        { title: "Anti Link - ON", description: "Blocks group links", id: prefix + "antilink on" },
        { title: "Anti Link - OFF", description: "Allows links", id: prefix + "antilink off" },
	{ title: "Anti Link Action- delete", description: "Antilink action delete", id: prefix + "antilinkaction delete" }, 
	{ title: "Anti Link Action- remove", description: "Antilink action remove", id: prefix + "antilinkaction remove" },         
        { title: "Anti Bad Words - ON", description: "Detects and warns", id: prefix + "antibad on" },
        { title: "Anti Bad Words - OFF", description: "Disables bad word check", id: prefix + "antibad off" },
	{ title: "Anti Bad Action - delete", description: "Antibad action", id: prefix + "antibadaction delete" },
	{ title: "Anti Bad Action - remove", description: "Antibad action", id: prefix + "antibadaction remove" },
        { title: "Anti Call - ON", description: "Blocks calls automatically", id: prefix + "anticall on" },
        { title: "Anti Call - OFF", description: "Allows calls", id: prefix + "anticall off" }
      ]
    },
    {
      title: "Fun & Extras 🎭",
      rows: [
        { title: "AI Chat - ON", description: "Enable chatbot in groups", id: prefix + "chatbot on" },
        { title: "AI Chat - OFF", description: "Disable chatbot", id: prefix + "chatbot off" },
        { title: "Auto React - ON", description: "Auto reacts to messages", id: prefix + "autoreact on" },
        { title: "Auto React - OFF", description: "Disables auto react", id: prefix + "autoreact off" },
        { title: "Always Online - ON", description: "Always shows online", id: prefix + "alo on" },
        { title: "Always Online - OFF", description: "Shows real status", id: prefix + "alo off" }
      ]
    }
  ]
};



 if (config.BUTTON === "true") {
      return await conn.sendMessage(
  from,
  {
    image: { url: config.LOGO },
    caption,
    footer: config.FOOTER,
    buttons: [
          {
            buttonId: "Video quality list",
            buttonText: { displayText: "🎥 Select Option" },
            type: 4,
            nativeFlowInfo: {
              name: "single_select",
              paramsJson: JSON.stringify(listButtons)
            }
          }
        ],
    headerType: 1,
    viewOnce: true
  },
  { quoted: mek }
);


} else if (config.BUTTON === 'false') {

	
await conn.listMessage(from, listMessage,mek)
 }
       m.react('⚙️')
} catch (e) {
reply('*Error !!*')
l(e)
}
})
cmd({
    pattern: "lang",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe) return await reply(BOTOW)
let gett = await get("LANG")
if(gett === q) 
await input("LANG", q)

await reply("*Language updated: " + q + "*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})

cmd({
    pattern: "work_type",
    react: "🔁",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, msr, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isDev, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

if ( !isSudo && !isOwner && !isMe ) return await reply('*OWNER COMMAND ⛔*') 
if(!q) return 
	
if(q === "private"){
let gett = await get("WORK_TYPE")
if(gett === q) return await reply("*All ready worktype PRIVATE🧐*")  
await input("WORK_TYPE", q)

await reply("*🌐 WORK_TYPE  - PRIVATE*")
await conn.sendMessage(from, { react: { text: `✔`, key: mek.key } })
	
} else if (q === "only_group"){
let gett = await get("WORK_TYPE")
if(gett === q) return await reply('*All ready worktype ONLY_GROUP🧐*')  
await input("WORK_TYPE", q)

await reply("*🌐 WORK_TYPE  - ONLY_GROUP*")
await conn.sendMessage(from, { react: { text: `✔`, key: mek.key } })
	
} else if (q === "public"){
let gett = await get("WORK_TYPE")
if(gett === q) return await reply('*All ready worktype PUBLIC🧐*')  
await input("WORK_TYPE", q)

await reply("*🌐 WORK_TYPE  - PUBLIC*")
await conn.sendMessage(from, { react: { text: `✔`, key: mek.key } })
}  else if (q === "inbox"){
let gett = await get("WORK_TYPE")
if(gett === q) return await reply('*All ready worktype INBOX🧐*')  
await input("WORK_TYPE", q)

await reply("*🌐 WORK_TYPE  - INBOX*")
await conn.sendMessage(from, { react: { text: `✔`, key: mek.key } })
} else {
const invalid = await conn.sendMessage(from, { text: msr.valid_con }, { quoted: mek })
await conn.sendMessage(from, { react: { text: `❓`, key: invalid.key } })
}
} catch (e) {
await conn.sendMessage(from, { react: { text: `❌`, key: mek.key } })
console.log(e)
reply(`Error !!\n\n*${e}*`)
}
})

cmd({
  pattern: "valuseremove",
  react: "🗑️",
  desc: "Remove domain/link string from VALUSE list",
  category: "owner",
  filename: __filename
},
async (conn, mek, m, {
  from, isMe, isOwner, q, reply
}) => {
  try {
    if (!isMe && !isOwner) return await reply('*OWNER COMMAND ⛔*');
    if (!q) return await reply("*Please provide a domain/link to remove, e.g., youtube.com*");

    const valToRemove = q.trim().toLowerCase();

    let list = await get("VALUSE");
    if (!Array.isArray(list)) list = [];

    if (!list.includes(valToRemove)) {
      return await reply(`*${valToRemove} is not in VALUSE list ❌*`);
    }

    list = list.filter(v => v !== valToRemove);
    await input("VALUSE", list);

    await reply(`✅ Removed *${valToRemove}* from VALUSE list.`);
    await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    await reply(`❌ *Error occurred !!*\n\n${e}`);
  }
});

cmd({
  pattern: "antibadaction",
  react: "⚙️",
  filename: __filename,
  desc: "Set ANTI_LINK / ANTI_BAD action: delete, remove, both",
  dontAddCommandList: true
},
async (conn, mek, m, {
  from, q, isSudo, isOwner, isMe, reply
}) => {
  try {
    if (!isSudo && !isOwner && !isMe) return await reply('*OWNER COMMAND ⛔*');
    if (!q) return await reply("*Please provide an action type: delete / remove / both*");

    const accepted = ["delete", "remove", "both"];
    const newAction = q.toLowerCase();

    if (!accepted.includes(newAction)) {
      return await reply("*Invalid action type ❌*\n\nUse one of:\n- delete\n- remove\n- both");
    }

    let current = await get("ACTION");
    if (current === newAction) {
      return await reply(`*Already set to: ${newAction.toUpperCase()} 🧐*`);
    }

    await input("ACTION", newAction);
    await reply(`*✅ ACTION set to: ${newAction.toUpperCase()}*`);
    await conn.sendMessage(from, { react: { text: `✔`, key: mek.key } });

  } catch (e) {
    console.log(e);
    await conn.sendMessage(from, { react: { text: `❌`, key: mek.key } });
    await reply(`Error !!\n\n*${e}*`);
  }
});






cmd({
  pattern: "antilinkaction",
  react: "⚙️",
  filename: __filename,
  desc: "Set ANTI_LINK / ANTI_BAD action: delete, remove, both",
  dontAddCommandList: true
},
async (conn, mek, m, {
  from, q, isSudo, isOwner, isMe, reply
}) => {
  try {
    if (!isSudo && !isOwner && !isMe) return await reply('*OWNER COMMAND ⛔*');
    if (!q) return await reply("*Please provide an action type: delete / remove / both*");

    const accepted = ["delete", "remove", "both"];
    const newAction = q.toLowerCase();

    if (!accepted.includes(newAction)) {
      return await reply("*Invalid action type ❌*\n\nUse one of:\n- delete\n- remove\n- both");
    }

    let current = await get("ANTILINK_ACTION");
    if (current === newAction) {
      return await reply(`*Already set to: ${newAction.toUpperCase()} 🧐*`);
    }

    await input("ANTILINK_ACTION", newAction);
    await reply(`*✅ ACTION set to: ${newAction.toUpperCase()}*`);
    await conn.sendMessage(from, { react: { text: `✔`, key: mek.key } });

  } catch (e) {
    console.log(e);
    await conn.sendMessage(from, { react: { text: `❌`, key: mek.key } });
    await reply(`Error !!\n\n*${e}*`);
  }
});

cmd({
  pattern: "valuses",
  react: "🔗",
  desc: "Add domain/link string to VALUSE list",
  category: "owner",
  filename: __filename
},
async (conn, mek, m, {
  from, isMe, isOwner, q, reply
}) => {
  try {
    if (!isMe && !isOwner) return await reply('*OWNER COMMAND ⛔*');
    if (!q) return await reply("*Please provide a domain/link to add, e.g., youtube.com*");

    const newVal = q.trim().toLowerCase();

    let list = await get("VALUSE");
    if (!Array.isArray(list)) list = [];

    if (list.includes(newVal)) {
      return await reply(`*${newVal} is already in VALUSE list ✅*`);
    }

    list.push(newVal);
    await input("VALUSE", list);

    await reply(`*✅ Added ${newVal} to VALUSE list.*`);
    await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    await reply(`❌ *Error occurred !!*\n\n${e}`);
  }
});




cmd({
    pattern: "sudo",
    react: "👨🏻‍🔧",
    alias: ["set", "aaddsudo"],
    desc: "Add user to SUDO from replied message.",
    category: "owner",
    use: ".asetsudo (reply to a message)",
    filename: __filename
},
async (conn, mek, m, {
    from, isMe, isSudo, isGroup, reply
}) => {
    try {
        if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*');
        if (!isGroup) return await reply('*Group command only 🧑‍🤝‍🧑*');

        // ✅ Check if this command is replying to a message
        const isQuoted = m.quoted && m.quoted.participant;
        if (!isQuoted) return await reply("*Please reply to a user's message ❔*");

        // ✅ Get the JID of the user whose message was replied to
        const sudo_id = m.quoted.participant;

        const currentSudos = await get("SUDO");
        if (currentSudos.includes(sudo_id)) {
            return await reply("*User already in SUDO list ✅*");
        }

        currentSudos.push(sudo_id);
        await input("SUDO", currentSudos);

        await reply(`✅ *SUDO added:* ${sudo_id}`);
        await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *Error occurred !!*\n\n${e}`);
    }
});



cmd({ 
    pattern: "asetsudo",
    react: "👨🏻‍🔧",
    alias: ["set", "aaddsudo"],
    desc: "Set moderator using number.",
    category: "owner",
    use: '.setsudo 947XXXXXXXX',
    filename: __filename
},
async (conn, mek, m, {
    from, args, isMe, isSudo, reply
}) => {
    try {
        if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*');

        if (!args[0]) return await reply("*Please provide a number ❔*");

        // sanitize input number
        let number = args[0].replace(/[^0-9]/g, '');
        if (number.length < 7) return await reply("*Invalid number format ❌*");

        let sudo_id = number + "@s.whatsapp.net";

        const isAlreadySudo = async (key) => {
            let list = await get(key);
            return list.includes(sudo_id);
        };

        if (await isAlreadySudo("SUDO")) {
            return await reply("*User already in the SUDO list 😼*");
        }

        let currentSudos = await get("SUDO");
        currentSudos.push(sudo_id);
        await input("SUDO", currentSudos);

        await reply(`*✅ SUDO added:* ${sudo_id}`);
        await conn.sendMessage(from, { react: { text: '✔', key: mek.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *Error occurred !!*\n\n${e}`);
    }
});




















cmd({
    pattern: "setsudo",
    react: "👨🏻‍🔧",
    alias: ["set","addsudo"],
    desc: "Set moderator.",
    category: "owner",
    use: '.setsudo',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, isNadeen, command, args, q, msr, creator, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, isDev, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isNadeen) return await reply('*OWNER COMMAND ⛔*') 
 
const sudo_id = m.mentionUser[0]
    if(!sudo_id) return await reply("*Please mention user ❔*")
 
const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === sudo_id) return true
}
return false
}


 
if(await isAnti("SUDO")) return await reply("*You are allready added moderater list😾*")
let olddata = await get("SUDO")
olddata.push(sudo_id)
await input("SUDO", olddata)
await reply("*Moderater Add Successfull ✅*")
await conn.sendMessage(from, { react: { text: '✔', key: mek.key } })
  
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
})



cmd({
    pattern: "delsudo",
    alias: ["rsudo","removesudo"],
    react: "👨🏻‍🔧",
    desc: "Remove moderater.",
    category: "owner",
    use: '.delsudo',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, isNadeen , q, msr, creator, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, isDev, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

if (!isMe && !isNadeen) return await reply('*OWNER COMMAND ⛔*') 

const sudo_id = m.mentionUser[0]
   if(!sudo_id) return await reply("*Please mention user ❔*")
 
const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === sudo_id) return true
}
return false
}
 
if(!await isAnti("SUDO")) return await reply("*You are not a moderater 🧐*")
const array = await get("SUDO")
const itemToRemove = m.mentionUser[0] ? m.mentionUser[0] : from
const indexToRemove = array.indexOf(itemToRemove);
if (indexToRemove !== -1) {
  array.splice(indexToRemove, 1);
}
await input("SUDO", array)
await reply("*Moderater Delete Successfull ✅*")
await conn.sendMessage(from, { react: { text: '✔', key: mek.key } })
  
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
})



cmd({
    pattern: "delallsudo",
    alias: ["rasudo","removeallsudo"],
    react: "👨🏻‍🔧",
    desc: "Remove ALL Moderaters",
    category: "owner",
    use: '.delallsudo',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, msr, creator, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, isDev, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 


const jid_rem = []
 
await input("SUDO", jid_rem)
await reply("*All Moderater remove ✅*")
await conn.sendMessage(from, { react: { text: '✔', key: mek.key } })
  
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
})

//






















cmd({
    pattern: "ban",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 


const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}

if(q === "on"){
if(await isAnti("JID_BLOCK")) return reply("*This settings all ready updated ☑️*")
let olddata = await get("JID_BLOCK")
olddata.push(from)
await input("JID_BLOCK", olddata)
await reply("*Sucssessfully banned this chat ✔️*")
} else {
if(!await isAnti("JID_BLOCK")) return reply("*This settings all ready updated ☑️*")
const array = await get("JID_BLOCK")
const itemToRemove = from
const indexToRemove = array.indexOf(itemToRemove);
if (indexToRemove !== -1) {
  array.splice(indexToRemove, 1);
}
await input("JID_BLOCK", array)
await reply("*Sucssessfully unbanned this chat ❌*")
}
} catch (e) {
reply('*Error !!*')
l(e)
}
})



cmd({
  alias: ["apply"],
  filename: __filename
},
async(conn, mek, m,{from, l, quoted, prefix, body, isCmd, command, args, q, isNadeen, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isNadeen) return await reply('*OWNER COMMAND ⛔*') 



let text = q;

 
let caption = `*\`↔️ VISPER CHANGE DATABASE INFO ↔️\`*

*┌──────────────────┐*
*├ 🔮Input :* ${text}
*└──────────────────┘*`
const buttons = [
  {buttonId: prefix + 'setprefix ' + text, buttonText: {displayText: '_*Change bot prefix*_'}, type: 1},
  {buttonId: prefix + 'setmvfooter ' + text, buttonText: {displayText: '_*Change bot movie footer*_'}, type: 1},
{buttonId: prefix + 'setdoc ' + text, buttonText: {displayText: '_*Change bot movie file Name*_'}, type: 1},
	{buttonId: prefix + 'setuploder ' + text, buttonText: {displayText: '_*Change bot movie Uploder Name*_'}, type: 1},
	{buttonId: prefix + 'setcaption ' + text, buttonText: {displayText: '_*Change bot movie Group Name*_'}, type: 1},
  {buttonId: prefix + 'setmail ' + text , buttonText: {displayText: '_*Add seedr account mail*_'}, type: 1},
  {buttonId: prefix + 'setpassword ' + text , buttonText: {displayText: '_*Add seedr account password*_'}, type: 1},
  {buttonId: prefix + 'asetsudo ' + text , buttonText: {displayText: '_*Change bot sudo numbers*_'}, type: 1},
  {buttonId: prefix + 'valuses ' + text , buttonText: {displayText: '_*Antilink values add*_'}, type: 1},
  {buttonId: prefix + 'removevaluses ' + text , buttonText: {displayText: '_*Antilink values remove*_'}, type: 1},
  {buttonId: prefix + 'resetdb' , buttonText: {displayText: '_*Reset database*_'}, type: 1}
]
  const buttonMessage = {
      image: {url: config.LOGO},
      caption: caption,
      footer: config.FOOTER,
      buttons: buttons,
      headerType: 1
  }

 if (config.BUTTON === 'true') {
      const listData = {
        title: "Change Database :)",
        sections: [
          {
            title: "VISPER-MD-DATABASE-INFO",
            rows: [
             { title: "Change bot prefix", "description":"", id: prefix + 'setprefix ' + text },
             { title: "Change bot alive", "description":"", id: prefix + 'setalive ' + text },
             { title: "Change bot owner", "description":"", id: prefix + 'setowner ' + text },
				{ title: "Change bot movie Uploder name", "description":"", id: prefix + 'setuploder ' + text },
				{ title: "Change bot movie Group Name", "description":"", id: prefix + 'setcaption ' + text },
				{ title: "Change bot movie file Name", "description":"", id: prefix + 'setdoc ' + text },
             { title: "Change bot movie footer", "description":"", id: prefix + 'setmvfooter ' + text },
	     { title: "Add seedr account mail", "description":"", id: prefix + 'setmail ' + text },
	     { title: "Add seedr account password", "description":"", id: prefix + 'setpassword ' + text },
	     { title: "Change bot sudo numbers", "description":"", id:  prefix + 'asetsudo ' + text },
	     { title: "Antilink values add", "description":"", id: prefix + 'valuses ' + text },
	     { title: "Antilink values remove", "description":"", id: prefix + 'removevaluses ' + text },
	     { title: "Reset database", "description":"", id: prefix + 'resetdb' }   
            ]
          }
        ]
      };

      return await conn.sendMessage(from, {
         image: {url: config.LOGO}, 
        caption,
        footer: config.FOOTER,
        buttons: [
          {
            buttonId: "action",
            buttonText: { displayText: "🔽 Select Option" },
            type: 4,
            nativeFlowInfo: {
              name: "single_select",
              paramsJson: JSON.stringify(listData)
            }
          }

		
        ],
        headerType: 1,
        viewOnce: true
      }, { quoted: mek });

    } else {
	
return await conn.buttonMessage(from, buttonMessage, mek)

 }
} catch (e) {
reply(N_FOUND)
l(e)
}
})
//============================================================================================================
cmd({
    pattern: "autosreact",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, isMe, reply}) => {
  try {
    if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

    if (!q) return reply("*Use: .autosreact on / off*")

    if (q.toLowerCase() === "on") {
      let gett = await get("AUTO_STATUS_REACT")
      if (gett === true || gett === "true") return reply("*AUTO_STATUS_REACT already ON ☑️*")
      await input("AUTO_STATUS_REACT", "true")
      await reply("*AUTO_STATUS_REACT ➜ true ✅*")
    } 
    else if (q.toLowerCase() === "off") {
      let gett = await get("AUTO_STATUS_REACT")
      if (gett === false || gett === "false") return reply("*AUTO_STATUS_REACT already OFF ☑️*")
      await input("AUTO_STATUS_REACT", "false")
      await reply("*AUTO_STATUS_REACT ➜ false ❌*")
    } 
    else {
      reply("*Invalid option ⚠️*\nUse: .autosreact on / off")
    }

  } catch (e) {
    reply('*Error !!*')
    l(e)
  }
})



cmd({
    pattern: "autovoice",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("AUTO_VOICE")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("AUTO_VOICE", true)
await reply("*AUTO_VOICE ➜ true ✅*")
} else{
let gett = await get("AUTO_VOICE")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("AUTO_VOICE", false)
await reply("*AUTO_VOICE ➜ false ❌*")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})

cmd({
    pattern: "button",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, isNadeen, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isNadeen) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("BUTTON")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("BUTTON", true)
await reply("*BUTTON ➜ true ✅*")
} else{
let gett = await get("BUTTON")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("BUTTON", false)
await reply("*BUTTON ➜ false ❌*")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})
cmd({
    pattern: "mvblock",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("MV_BLOCK")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("MV_BLOCK", true)
await reply("*MV_BLOCK ➜ true ✅*")
} else{
let gett = await get("MV_BLOCK")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("MV_BLOCK", false)
await reply("*MV_BLOCK ➜ false ❌*")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})



















cmd({
    pattern: "antilink",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("ANTI_LINK")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("ANTI_LINK", true)
await reply("*ANTI_LINK ➜ true ✅*")
} else{
let gett = await get("ANTI_LINK")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("ANTI_LINK", false)
await reply("*ANTI_LINK ➜ false ❌*")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})


cmd({
    pattern: "antdel",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("ANTI_DELETE")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("ANTI_DELETE", true)
await reply("*ANTI_DELETE ➜ true ✅*")
} else{
let gett = await get("ANTI_DELETE")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("ANTI_DELETE", false)
await reply("*ANTI_DELETE ➜ false ❌*")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})

cmd({
    pattern: "xblock",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("XNXX_BLOCK")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("XNXX_BLOCK", true)
await reply("*XNXX_BLOCK ➜ true ✅*")
} else{
let gett = await get("XNXX_BLOCK")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("XNXX_BLOCK", false)
await reply("*XNXX_BLOCK ➜ false ❌*")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})


cmd({
    pattern: "alo",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("ALLWAYS_OFFLINE")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("ALLWAYS_OFFLINE", true)
await reply("*ALLWAYS_OFFLINE ➜ true ✅*")
} else{
let gett = await get("ALLWAYS_OFFLINE")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("ALLWAYS_OFFLINE", false)
await reply("*ALLWAYS_OFFLINE ➜ false ❌*")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})














cmd({
    pattern: "chatbot",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd,isNadeen , command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isNadeen) return await reply('*OWNER COMMAND ⛔*') 
const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("CHAT_BOT")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("CHAT_BOT", true)
await reply("*AI_CHAT ➜ true ✅*")
} else{
let gett = await get("CHAT_BOT")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("CHAT_BOT", false)
await reply("*AI_CHAT ➜ false ❌*")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})




























cmd({
    pattern: "antibot",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("ANTI_BOT")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("ANTI_BOT", true)
await reply("*💁‍♂️ ANTI_BOT ➨* on")
} else{
let gett = await get("ANTI_BOT")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("ANTI_BOT", false)
await reply("*💁‍♂️ ANTI_BOT ➨* off")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})



















cmd({
    pattern: "antibad",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("ANTI_BAD")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("ANTI_BAD", true)
await reply("*💁‍♂️ ANTI_BAD ➨* on")
} else{
let gett = await get("ANTI_BAD")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("ANTI_BAD", false)
await reply("*💁‍♂️ ANTI_BAD ➨* off")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})

cmd({
    pattern: "onlygroup",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("ONLY_GROUP")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("ONLY_GROUP", true)
await reply("*💁‍♂️ ONLY_GROUP ➨* on")
} else{
let gett = await get("ONLY_GROUP")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("ONLY_GROUP", false)
await reply("*💁‍♂️ ONLY_GROUP ➨* off")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})

cmd({
    pattern: "autoreact",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isSudo, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("AUTO_REACT")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("AUTO_REACT", true)
await reply("*💁‍♂️ AUTO_REACT ➨* on")
} else{
let gett = await get("AUTO_REACT")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("AUTO_REACT", false)
await reply("*💁‍♂️ AUTO_REACT ➨* off")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})




cmd({
    pattern: "pv",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isSudo, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("PRIVATE")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("PRIVATE", true)
await reply("*💁‍♂️ MODE ➨* private")
} else{
let gett = await get("PRIVATE")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("PRIVATE", false)
await reply("*💁‍♂️ MODE ➨* public")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})















cmd({
    pattern: "anticall",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("ANTI_CALL")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("ANTI_CALL", true)
await reply("*💁‍♂️ ANTI_CALL ➨* on")
} else{
let gett = await get("ANTI_CALL")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("ANTI_CALL", false)
await reply("*💁‍♂️ ANTI_CALL ➨* off")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})






cmd({
    pattern: "autoblock",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("AUTO_BLOCK")
if(gett === true) return reply("*This settings all ready updated ☑️*")
await input("AUTO_BLOCK", true)
await reply("*💁‍♂️ AUTO_BLOCK ➨* on")
} else{
let gett = await get("AUTO_BLOCK")
if(gett === false) return reply("*This settings all ready updated ☑️*")
await input("AUTO_BLOCK", false)
await reply("*💁‍♂️ AUTO_BLOCK ➨* off")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})

cmd({
    pattern: "setmvsize",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("MV_SIZE")
if(gett === q) return reply("*This settings all ready updated ☑️*")
await input("MV_SIZE", q)

await reply("*Done: " + q + "*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})

cmd({
    pattern: "setlink",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("LINK")
if(gett === q) return reply("*This settings all ready updated ☑️*")
await input("LINK", q)

await reply("*🎁Done: " + q + "*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})

cmd({
    pattern: "creact",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("CUSTOM_REACT")
if(gett === q) return reply("*This settings all ready updated ☑️*")
await input("CUSTOM_REACT", q)

await reply("*CUSTOM_REACT updated: " + q + "*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})




cmd({
    pattern: "lang",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("LANG")
if(gett === q) return reply("*This settings all ready updated ☑️*")
await input("LANG", q)

await reply("*Language updated: " + q + "*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})

cmd({
    pattern: "uploadsz",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, q, isMe, reply, l }) => {
    try {
        // Only bot owner can change max upload size
        if (!isMe) return await reply("You are not authorized to use this command.");

        if (!q || isNaN(q)) return await reply("Please provide a valid number.");

        let gett = await get("MAX_SIZE");
        if (gett === Number(q)) return await reply("Max size is already set to " + q);

        await input("MAX_SIZE", Number(q));
        await reply("*✅ Max upload size updated: " + q + "*");

    } catch (e) {
        await reply("*❌ Error occurred!*");
        l(e);
    }
});



cmd({
    pattern: "alivemg",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("ALIVE")
if(gett === q) return reply("*This settings all ready updated ☑️*")
await input("ALIVE", q)

await reply("*Alive massage updated:* " + q )

} catch (e) {
reply('*Error !!*')
l(e)
}
})

cmd({
    pattern: "active",
   category: "movie",
    desc: "Active to jid",
    
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, isNadeen, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!q || !q.includes('@')) {
    console.log('Invalid input:', q);
    return await reply('*❗ Invalid input example : .active 94787318729@s.whatsapp.net or .active 120363387559195313@g.us*');
}
    
if (!isMe && !isNadeen) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("JID")
if(gett === q) return reply("*This settings all ready updated ☑️*")
await input("JID", q)

await reply("*Activated this jid : " + q +" 🟢*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})
cmd({
    pattern: "setmvfooter",
	use: "BOT FOOTER",
   category: "movie",
    desc: "Active to jid",
    
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isNadeen, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

    
if (!isMe && !isNadeen) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("NAME")
if(gett === q) return reply("*This settings all ready updated ☑️*")
await input("NAME", q)

await reply("*MOVIE FOOTER SET : " + q +" 🟢*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})

cmd({
    pattern: "sinid",
	use: "BOT FOOTER",
   //category: "movie",
    desc: "Active to jid",
    
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

    
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("SIN_LINK")
//if(gett === q) return reply("*This settings all ready updated ☑️*")
await input("SIN_LINK", q)

//await reply("*MV LINK SET : " + q +" 🟢*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})

cmd({
    pattern: "setcaption",
	use: "Group Name",
   category: "movie",
    desc: "Active to jid",
    
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

    
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("CAPTION")
if(gett === q) return reply("*This settings all ready updated ☑️*")
await input("CAPTION", q)

await reply("*MOVIE CAPTION SET : " + q +" 🟢*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})

cmd({
    pattern: "automv",
	use: "Group Name",
   //category: "movie",
    desc: "Active to jid",
    
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

    
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("AUTO_SIN")
if(gett === q) return reply("*This settings all ready updated ☑️*")
await input("AUTO_SIN", q)

await reply("*AUTO MV : " + q +" 🟢*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})
cmd({
    pattern: "setdoc",
	use: "Send FIle Name",
   category: "movie",
    desc: "Active to jid",
    
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

    
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("DOC")
if(gett === q) return reply("*This settings all ready updated ☑️*")
await input("DOC", q)

await reply("*MOVIE DOC NAME SET : " + q +" 🟢*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})
cmd({
    pattern: "setuploder",
	use: "Movie Uploder Name",
   category: "movie",
    desc: "Active to jid",
    
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isGroup, isSudo, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

    
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("UPLODER")
if(gett === q) return reply("*This settings all ready updated ☑️*")
await input("UPLODER", q)

await reply("*MOVIE UPLODER SET : " + q +" 🟢*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})
cmd({
    pattern: "setowner",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isSudo, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("OWNER_NUMBER")
if(gett === q) return 
await input("OWNER_NUMBER", q)

await reply("*OWNER_NUMBER:* " + q)

} catch (e) {
reply('*Error !!*')
l(e)
}
})
cmd({
    pattern: "setmail",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isSudo, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("SEEDR_MAIL")
if(gett === q) return 
await input("SEEDR_MAIL", q)

await reply("*Seedr account mail added sucssess full✅*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})

cmd({
    pattern: "setpassword",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isSudo, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("SEEDR_PASSWORD")
if(gett === q) return 
await input("SEEDR_PASSWORD", q)

await reply("*Seedr account password added sucssess full✅*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})










cmd({
    pattern: "setsudo",
    react: "👨🏻‍🔧",
    alias: ["set","addsudo"],
    desc: "Set moderator.",
    category: "owner",
    use: '.setsudo',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, msr, creator,isNadeen, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, isDev, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

if (!isMe && !isNadeen) return await reply('*OWNER COMMAND ⛔*') 
 
const sudo_id = m.mentionUser[0]
    if(!sudo_id) return 
 
const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === sudo_id) return true
}
return false
}


 
if(await isAnti("SUDO")) return
let olddata = await get("SUDO")
olddata.push(sudo_id)
await input("SUDO", olddata)
await reply("*Successful added Moderater list ✅*")
await conn.sendMessage(from, { react: { text: '✔', key: mek.key } })
  
} catch (e) {
await conn.sendMessage(from, { react: { text: '❌', key: mek.key } })
console.log(e)
reply(`❌ *Error Accurated !!*\n\n${e}`)
}
})




cmd({
    pattern: "setlogo",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, isSudo, q,isNadeen, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isNadeen) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("LOGO")
if(gett === q) return 
await input("LOGO", q)

await reply("*Logo updated: " + q + "*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})

var needus =''
if(config.LANG === 'SI') needus = 'එය දත්ත සමුදාය නැවත සකසයි.'
else needus = "It resets database." 
cmd({
    pattern: "resetdb",
    desc: needus,
    category: "owner",
    use: '.resetdb',
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, isSudo, args, q,isNadeen, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
    if (!isMe && !isNadeen) return 
   await updfb()
return reply("*Database reseted ✅*")
} catch (e) {
reply(cantf)
l(e)
}
})


cmd({
    pattern: "autotyping",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, q, isSudo,  isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("AUTO_TYPING")
if(gett === true) return 
await input("AUTO_TYPING", true)
await reply("*AUTO_TYPING updated: " + q + "*")
} else{
let gett = await get("AUTO_TYPING")
if(gett === false) return 
await input("AUTO_TYPING", false)
await reply("*AUTO_TYPING updated: " + q + "*")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})

cmd({
    pattern: "autorec",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args, isSudo, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("AUTO_RECORDING")
if(gett === true) return
await input("AUTO_RECORDING", true)
await reply("*💁‍♂️ AUTO_RECORDING ➨* on")
} else{
let gett = await get("AUTO_RECORDING")
if(gett === false) return
await input("AUTO_RECORDING", false)
await reply("*💁‍♂️ AUTO_RECORDING ➨* off")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})



cmd({
    pattern: "autos",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, isSudo, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("AUTO_READ_STATUS")
if(gett === true) return
await input("AUTO_READ_STATUS", true)
await reply("*💁‍♂️ AUTO_READ_STATUS ➨* on")
} else{
let gett = await get("STATUS_VIEW")
if(gett === false) return
await input("AUTO_READ_STATUS", false)
await reply("*💁‍♂️ AUTO_READ_STATUS ➨* off")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})

cmd({
    pattern: "setprefix",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, command, args,isNadeen, q, isSudo, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isNadeen) return await reply('*OWNER COMMAND ⛔*') 
let gett = await get("PREFIX")
if(gett === q) return 
await input("PREFIX", q)

await reply("*PREFIX UPDATED*")

} catch (e) {
reply('*Error !!*')
l(e)
}
})

cmd({
    pattern: "autoread",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, isSudo, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("AUTO_MSG_READ")
if(gett === true) return
await input("AUTO_MSG_READ", true)
await reply("*AUTO_MSG_READ updated: " + q + "*")
} else{
let gett = await get("AUTO_MSG_READ")
if(gett === false) return
await input("AUTO_MSG_READ", false)
await reply("*AUTO_MSG_READ updated: " + q + "*")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})
cmd({
    pattern: "ronly",
    dontAddCommandList: true,
    filename: __filename
},
async(conn, mek, m,{from, l, quoted, body, isCmd, isSudo,  command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if (!isMe && !isSudo) return await reply('*OWNER COMMAND ⛔*') 

const isAnti = async(teks) => {
let getdata = await get(teks)
for (let i=0;i<getdata.length;i++) {
if(getdata[i] === from) return true
}
return false
}


if(q === "on"){
let gett = await get("CMD_ONLY_READ")
if(gett === true) return
await input("CMD_ONLY_READ", true)
await reply("*CMD_ONLY_READ updated: " + q + "*")
} else{
let gett = await get("CMD_ONLY_READ")
if(gett === false) return
await input("CMD_ONLY_READ", false)
await reply("*CMD_ONLY_READ updated: " + q + "*")
}
} catch (e) {
reply('*Error !!*')
l(e)
}

})
