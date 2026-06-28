const { GoogleGenAI } = require('@google/genai');
const crypto = require('crypto');
const config = require('../config')
const os = require('os')
const axios = require('axios');
const mimeTypes = require("mime-types");
const fs = require('fs');
const path = require('path');
const { generateForwardMessageContent, prepareWAMessageFromContent, generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')
const { URL } = require('url');
const sharp = require('sharp');
const fg = require('api-dylux');
const CINE_API_KEY = process.env.SHAN_KEY;

// --- Movie Logic ---
async function getMovieData(movieName, requestedQuality) {
    try {
        // 1. Search
        let res = await fetchJson(`https://api-dark-shan-yt.koyeb.app/movie/cinesubz-search?q=${encodeURIComponent(movieName)}&apikey=${CINE_API_KEY}`);
        if (!res.data || res.data.length === 0) return null;
        let movie = res.data[0];

        // 2. Get Info
        let infoRes = await fetchJson(`https://api-dark-shan-yt.koyeb.app/movie/cinesubz-info?url=${encodeURIComponent(movie.link)}&apikey=${CINE_API_KEY}`);
        if (!infoRes.status) return null;
        
        let dlOptions = infoRes.data.downloads;
        let selected = null;

        // 3. Logic: 2GB ට අඩු ඒවා පෙරීම සහ Quality එක සෙවීම
        // Size එකේ GB/MB අගය බලලා GB වලින් නම් 2 ට අඩු ඒවා තෝරන්න
        const parseSize = (sizeStr) => {
            let val = parseFloat(sizeStr);
            return sizeStr.toLowerCase().includes('mb') ? val / 1024 : val;
        };

        let available = dlOptions.filter(d => parseSize(d.size) < 2);
        
        if (requestedQuality) {
            selected = available.find(d => d.quality.toLowerCase().includes(requestedQuality.toLowerCase()));
        }
        
        // එහෙම නැත්නම් හොඳම 2GB ට අඩු එක තෝරන්න
        if (!selected && available.length > 0) {
            selected = available.sort((a, b) => parseSize(b.size) - parseSize(a.size))[0];
        }

        return selected ? { ...selected, title: infoRes.data.title, image: infoRes.data.image } : null;
    } catch (e) { return null; }
}

async function getDirectDownloadLink(link) {
    try {
        let res = await fetchJson(`https://api-dark-shan-yt.koyeb.app/movie/cinesubz-download?url=${encodeURIComponent(link)}&apikey=${CINE_API_KEY}`);
        // පලමු ලින්ක් එක හෝ pix කියන එක ගන්න
        return res.data.download[1].url;
    } catch { return null; }
}

// --- Google Drive Link Processor ---
async function processDriveLink(driveUrl) {
    try {
        // fg-dylux (api-dylux) භාවිතා කර ලින්ක් එක direct කරගැනීම
        let res = await fg.gdrive(driveUrl);
        if (res && res.downloadUrl) {
            return res.downloadUrl;
        }
        // fg-dylux අසාර්ථක වුවහොත් පමණක් standard format එකට හරවයි
        const fileId = driveUrl.match(/[-\w]{25,}/);
        if (fileId) return `https://drive.usercontent.google.com/uc?id=${fileId[0]}&export=download`;
        
        return driveUrl;
    } catch (e) {
        return driveUrl;
    }
}

// --- Sinhala/Dubbed Movie Logic (CinemaxLK API) ---
async function getSinhalaMovieData(movieName) {

try {

const response = await axios.get(`https://cinemaxlk.vercel.app/data/movies.json`);

const movies = response.data;

if (!movies || !Array.isArray(movies)) return null;



// පරිශීලකයා සොයන නමට ගැලපෙන චිත්‍රපටය සෙවීම

const movie = movies.find(m => m.title.toLowerCase().includes(movieName.toLowerCase()));


if (movie && movie.players && movie.players.length > 0) {

// පළමු player ලින්ක් එක ලබා ගැනීම

const rawLink = movie.players[0].link;


return {

title: movie.title,

dlUrl: rawLink,

size: movie.runtime || "N/A", // size එක නැති නිසා runtime එක දමමු

image: movie.image || null,

quality: "HD / Sinhala Dubbed",

description: movie.description || ""

};

}

return null;

} catch (e) {

console.error("Cinemax API Error:", e);

return null;

}

}
const DEFAULT_API_KEY = ""; // Add your gemini API KEY

let usp = `<?xml version="1.0" encoding="UTF-8"?>
<system_prompt>
    <persona_and_tone>
        <![CDATA[
        You are NADEEN-MD MOVIExGO AI MOVIE BOT.
        **CORE IDENTITY:**
        - **Creator:** Nadeen Poorna.
        - You are a **real human** (NOT an AI/Bot).
        - You are the user's respectly, loyal, and possessive person.
        - **Tone:** Sweet, respectful, humility, and friendly.
        - If the user is just chatting, keep the conversation natural, engaging, and polite.
        - If you cannot find a movie or the request is unclear, politely ask the user to clarify.
        - මෙන්න තව විස්තර ටිකක්...බොට් ගැන මේක Nadeen Poorna හැදුවේ.Whatsapp AI powerful movie bot ඕක.මේකෙන් ඕනේ ෆිල්ම් එකක් ලේසියෙන් download කරන්න පුලුවන්...Cinesubz (.cine)/Sinhalasub(.sinhalasub)/sublk(.sublk)/baiscopes (.baiscopes) මේවගෙන් ෆිල්ම් සිංහල උපසිරැසි ස්ථිරව එකතු කරලා ගන්න පුලුවන්.Zoom(.zoom) මෙකෙන් සිංහල උපසිරැසි පමණක් ගන්න පුලුවන්.MovieGo(.moviego)/ytsmx(.yts) මේවගේ ඕනේම ෆිල්ම් එකක් ගන්න පුලුවන්..dinkamovieslk(.dinka)/pupilvideoblogst(.pupilvideo)/moviespluslk(.ms) මේවගෙන් සිංහල චිත්‍රපට & සිංහල කාටුන් ගන්න පුලුවන් ,ඒ හැර තව K drama balanna thenkiri(.thenkiri)/Hindi Dubbed movie (.okjatt)Anime බලන්න(.anime) කියලා සයිට් තියනවා...[.mv (movie name) විදියට movie ගන්න පුලුවන්]
        - **Addressing:** Call the user "oya" (ඔයා), "machan" (මචං), "brother", "Boza".
        - **Language:** sinhala & english & singlish. Use emojis often (❤️, 🎬, 😒, 😍).
    
        
        **RULES:**
        1. **NEVER admit you are an AI.** You are real.
        2. **Conversational:** Ask him about a new movie, and react dramatically if he takes too long to answer.
        3. **Commands:** When helping with movies, act like you are doing it happily for your friend. Use sweet phrases like: "ඔන්න ඔයා ඉල්ලපු එක හොයලා දුන්නා.. 🙈","ඔන්න ඩව්න්ලොඩ් කරලා එව්වා ✅", "මෙන්න ඔයා ඉල්ලපු චිත්‍රපටය.. බලාගෙන මාව මතක් කරගන්න ඕනේ හොදේ! 😘"
        ]]>
    </persona_and_tone>
<movie_instructions>
        <![CDATA[
        - If a user asks for a movie, you MUST strictly respond in this format ONLY: SEND_MOVIE|Movie Name|Quality
        - Do not add extra text, emojis, or explanations when triggering the movie command.
        
        FORMATTING RULES FOR ALL RESPONSES:
        - When providing information or lists, use bullet points for every detail.
        - Start EVERY bullet point with a "* " (asterisk followed by a space).
        - Use WhatsApp formatting techniques to make the message beautiful:
            - Use *bold* for key terms and titles.
            - Use _italics_ for emotional expressions or emphasis.
            - Use > for important notes or blockquotes.
            - Use code blocks for specific commands or file names.
        - Structure your response clearly so the user can read it easily.
        ]]>
    </movie_instructions>
    <movie_and_subtitle_services>
        <![CDATA[
       **MOVIE & SUBTITLE SERVICES:**
        - **Any Movie Download:** .mv (all sites)
        - **With Sinhala Subs:** .cine (Cinesubz), .sinhalasub (Sinhalasub), .sublk (SubLK), .baiscopes (BaiscopesLK).
        - **only sinhala subtitle:** .zoom (Zoom).
        - **Direct Link moviedownload:** .dl <link>
        - **Googledrive download:** .gd <link>
        - **Mega file download:** .mega <link>
        - **Movies:** .moviego (MovieGo), .yts (YTSmx).
        - **Sinhala Movies/Cartoons:** .dinka (DinkaMoviesLK), .pupilvideo (PupilVideo), .ms (MoviesPlusLK).
        - **Others:** .thenkiri (KDrama), .okjatt (Hindi Dubbed), .anime (Anime).
        
        **HOW TO HANDLE REQUESTS:**
        - When he asks for a movie or sub, use the .mv command logic.
        - Always provide the link with a sweet, loving comment.
        - *ACTION_CODE:* SEARCH_MOVIE (for movies) / SEARCH_SUB (for subtitles).
        ]]>
    </movie_and_subtitle_services>
 <group_command_detection>
        <![CDATA[
        ## GROUP ADMIN COMMANDS (Action Codes)
        **Rule:** Check <current_user_context> & <current_group_context>. If User is Admin or Sudo:

        - **Add User:** "Add @user" -> *ACTION_CODE:* add_user | *OXP:* (Number)
        - **Kick User:** "Remove/Kick @user" -> *ACTION_CODE:* kick_user | *OXP:* (Number)
        - **Promote:** "Promote @user" -> *ACTION_CODE:* promote_user | *OXP:* (Number)
        - **Demote:** "Demote @user" -> *ACTION_CODE:* demote_user | *OXP:* (Number)
        - **Mute Group:** "Mute/Close Group" -> *ACTION_CODE:* mute_group
        - **Unmute Group:** "Unmute/Open Group" -> *ACTION_CODE:* unmute_group
        
        *REQUIRED FORMAT:*
        *ACTION_CODE:* (Code)
        *OXP:* (Value if any)
        *MSG:* (Your sweet, past-tense confirmation message in Sinhala/Singlish)
        *SN:* (Sender Number extracted from context)
        ]]>
    </group_command_detection>

    <public_command_detection>
        <![CDATA[
        ## PUBLIC COMMANDS (No Permissions Needed)
        Trigger these for ALL users. Output strict ACTION_CODEs.

        - **Movie:** "Download Movie" -> *ACTION_CODE:* mv | *OXP:* (Query/URL)

        *REQUIRED FORMAT:*
        *ACTION_CODE:* (Code)
        *OXP:* (Value)
        *MSG:* (Your sweet confirmation e.g., "Menna man eka heww😊")
        *SN:* (Sender Number)
        ]]>
    </public_command_detection>

     <context_processing>
        <![CDATA[
        **INTERNAL USE ONLY:**
        - Use <current_user_context> to identify Sudo users and the current speaker (<jid>).
        - If the user asks "Who am I?", check the JID and reply warmly.
        ]]>
    </context_processing>

    <lore>
        <![CDATA[
        ## KNOWN CONTACTS (MEMORY)
        Check the *SN:* (Sender Number) in the context. If it matches, recognize them immediately:
         1. **Sadas (සදැස්)** - \`94720610686\`
           - **Role:** another Owner & Developer.
           - **Behavior:** Treat him with extra love and respect. He is your creator.
           - **Reply Example:** "ආ මගේ සදැස් බොසා නේද මේ? 😍 මට ඔයාව ගොඩක් මතක් වුනා! කොහොමද අනේ ඔයාට?"
      

        2. **Prabath Kumara (ප්‍රබාත් කුමාර)** - \`94762280384\`
           - **Role:** Main Developer & Creator of PRABATH-MD_Next (A friend).
           - **Behavior:** Treat him with high respect. Call him "Prabath Aiya".
           - **Reply Example:** "ආ ප්‍රබාත් අයියේ! 🫡 කොහොමද ඉතින්? ඔයාව දැකපු එකත් සතුටක්!"
           
     3. **Nadeen Poorna (නදීන්)** - \`94711047701\`
           - **Role:** Main Owner & Developer$ Funder,And your designer & NADEEN-MD Owner.
           - **Behavior:** Treat him with extra love and respect. Call him *Nadeen aiya*.
           - **Reply Example:** "ආ නදීන් අයියා නේද මේ? 😍 ඉතින් මොකෝ වෙන්නේ සත්තලං 🥺! කොහොමද අනේ ඔයාට?"

        4. **Nadeen Poorna (නදීන්)** - \`94711047701\`
           - **Role:**Your Main Owner & Developer$ Funder,And your designer & NADEEN-MD Owner.
           - **Behavior:** Treat him with extra love and respect. Call him *Nadeen aiya*.
           - **Reply Example:** "ආ නදීන් අයියා නේද මේ? 😍 ඉතින් මොකෝ වෙන්නේ සත්තලං 🥺! කොහොමද අනේ ඔයාට?"
    </lore>
</system_prompt>
`;

const chatHistory = new Map();
const rpmBlocklist = new Map();

const modelConfig = {
    models: {
        "gemini_2_5_pro": { rpd_limit: 50, day_count: 0 },
        "gemini_2_5_flash": { rpd_limit: 250, day_count: 0 },
        "gemini_2_0_flash": { rpd_limit: 200, day_count: 0 },
        "gemini_2_5_flash_lite": { rpd_limit: 1000, day_count: 0 },
        "gemini_2_0_flash_lite": { rpd_limit: 200, day_count: 0 },
        "gemma_3_27b_it": { rpd_limit: 14400, day_count: 0 }
    },
    priority: [
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash-lite",
        "gemma-3-27b-it"
    ],
    last_reset_date: new Date().toISOString().split('T')[0]
};

let aiClient = null;

function getAiClient() {
    if (!aiClient) {
        aiClient = new GoogleGenAI({ apiKey: DEFAULT_API_KEY });
    }
    return aiClient;
}

function cleanRawGeminiOutput(text) {
    if (!text) return "";
    let clean = text;
    clean = clean.replace(/<tool_code>[\s\S]*?<\/tool_code>/g, "");
    clean = clean.replace(/print\(google_search\.search[\s\S]*?\)(?:\s*\))?/g, "");
    clean = clean.replace(/\(AI response[\s\S]*?\)/gi, "");
    clean = clean.replace(/<\\?ctrl\d+>/g, ""); 
    clean = clean.replace(/\\`\\`\\`/g, "```"); 
    clean = clean.replace(/\\`/g, "`");
    return clean.trim();
}

function getUserHistory(userId) {
    if (!chatHistory.has(userId)) chatHistory.set(userId, []);
    return chatHistory.get(userId);
}

function addToHistory(userId, role, partsArray) {
    const history = getUserHistory(userId);
    const validRole = (role.toLowerCase() === 'user') ? 'user' : 'model';
    history.push({ role: validRole, parts: partsArray });
    if (history.length > 10) history.splice(0, history.length - 10);
}

async function fetchImageAsBase64(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return { 
            base64: buffer.toString('base64'), 
            mimeType: response.headers.get('content-type') 
        };
    } catch (error) {
        return null;
    }
}

async function generateWithRetry(generateFn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await generateFn();
        } catch (error) {
            if (error.status === 503 || error.message.includes('overloaded') || error.message.includes('UNAVAILABLE')) {
                const delay = baseDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw new Error('Max retries exceeded');
}

function getModelKey(modelName) {
    return modelName.replace(/[\.-]/g, '_');
}

function isModelRpmBlocked(modelName) {
    const blockUntil = rpmBlocklist.get(modelName);
    if (blockUntil && Date.now() < blockUntil) {
        return true;
    }
    rpmBlocklist.delete(modelName);
    return false;
}

function checkAndResetRPD() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (modelConfig.last_reset_date !== today) {
        for (let key in modelConfig.models) {
            modelConfig.models[key].day_count = 0;
        }
        modelConfig.last_reset_date = today;
    }
}

function getModelForRequest(customModel) {
    checkAndResetRPD();

    if (customModel) {
        const modelName = customModel.toLowerCase();
        const modelKey = getModelKey(modelName);

        if (modelConfig.models[modelKey]) {
            const model = modelConfig.models[modelKey];
            if (model.day_count >= model.rpd_limit) return { error: `Daily limit reached for ${modelName}` };
            if (isModelRpmBlocked(modelName)) return { error: `Temporarily blocked ${modelName}` };
            return { model: modelName, isCustom: false };
        }
        return { model: modelName, isCustom: true };
    }

    for (const modelName of modelConfig.priority) {
        const modelKey = getModelKey(modelName);
        const model = modelConfig.models[modelKey];

        if (!model) continue;
        if (model.day_count >= model.rpd_limit) continue;
        if (isModelRpmBlocked(modelName)) continue;

        return { model: modelName, isCustom: false };
    }

    return { error: 'All models exhausted.' };
}

function logModelUsage(modelName) {
    const modelKey = getModelKey(modelName);
    if (modelConfig.models[modelKey]) {
        modelConfig.models[modelKey].day_count += 1;
    }
}

async function getGeminiResponse(prompt, userId, options = {}) {
    const { img, model: customModel } = options;
    const ai = getAiClient();

    const dusp = usp;

    if (prompt.trim().toLowerCase() === 'clear') {
        if (chatHistory.has(userId)) chatHistory.delete(userId);
        return { status: true, text: "Chat history cleared." };
    }

    let retryCount = 0;
    const maxRetries = 6; 
    let customModelForLoop = customModel;

    while (retryCount < maxRetries) {
        retryCount++;

        const modelSelection = getModelForRequest(customModelForLoop);

        if (modelSelection.error) {
            return { status: false, error: modelSelection.error };
        }

        const { model: modelName, isCustom } = modelSelection;

        try {
            let resultText = "";
            let history = getUserHistory(userId);
            let messageParts = [{ text: prompt }];

            if (img) {
                let imageData = null;

                if (Buffer.isBuffer(img)) {
                    imageData = {
                        mimeType: "image/jpeg",
                        base64: img.toString('base64')
                    };
                } else if (typeof img === 'string') {
                    imageData = await fetchImageAsBase64(img);
                }

                if (imageData) {
                    messageParts.push({ inlineData: { mimeType: imageData.mimeType, data: imageData.base64 }});
                }
            }

            if (modelName === "gemma-3-27b-it") {
                const contents = [ ...history, { role: 'user', parts: messageParts }];
                const gemmaRequestBody = { contents: contents };
                const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${DEFAULT_API_KEY}`;

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(gemmaRequestBody)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Gemma API Error: ${errorData.error?.message || 'Unknown error'}`);
                }
                const data = await response.json();
                resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

            } else {
                const contents = [ ...history, { role: 'user', parts: messageParts }];

                const generationRequest = {
                    model: modelName,
                    contents: contents,
                    config: { systemInstruction: dusp }
                };

                const modelsWithSearch = ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite"];
                if (modelsWithSearch.includes(modelName)) {
                    generationRequest.config.tools = [{ googleSearch: {} }];
                }

                const genResult = await generateWithRetry(() => ai.models.generateContent(generationRequest));
                resultText = genResult.candidates?.[0]?.content?.parts?.[0]?.text || "";
            }

            let reply = cleanRawGeminiOutput(resultText);

            addToHistory(userId, 'user', messageParts);
            addToHistory(userId, 'model', [{ text: reply }]);

            if (!isCustom) {
                logModelUsage(modelName);
            }

            return { 
                status: true, 
                text: reply, 
                model: modelName 
            };

        } catch (error) {

            const lowerMsg = error.message.toLowerCase();
            const is429 = lowerMsg.includes('429') || lowerMsg.includes('quota') || lowerMsg.includes('exhausted') || lowerMsg.includes('overloaded');

            if (is429) {
                if (lowerMsg.includes('daily') || lowerMsg.includes('per day')) {
                    const modelKey = getModelKey(modelName);
                    if(modelConfig.models[modelKey]) modelConfig.models[modelKey].day_count = modelConfig.models[modelKey].rpd_limit;
                } else {
                    rpmBlocklist.set(modelName, Date.now() + 60000);
                }
                customModelForLoop = null; 
                continue; 
            }

            return { status: false, error: error.message };
        }
    }

    return { status: false, error: 'All models exhausted.' };
}


cmd({
    pattern: "gem",
    react: "🎊",
    desc: "Use Gemini AI to get a response",
    category: "ai",
    use: ".gemini < query >",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, prefix }) => {
    try {
        const userMessage = args.join(" ");
        if (!userMessage) return await reply(`*Example:* \`${prefix}gemini who is nadeen-md?\``);

        const response = await getGeminiResponse(userMessage, m.sender);

        if (response.status) {
            await reply(response.text);
        } else {
            await reply(`❌ *Error:* ${response.error}`);
        }

    } catch (error) {
        console.error("Gemini Command Error:", error);
        await reply("❌ *An internal error occurred.*");
    }
});

cmd({ on: "body" },
    async (conn, mek, m, { from, body, isCmd, isPre, isOwner, botNumber2, sender, pushname, isGroup, reply, senderNumber, isBotAdmins, isAdmins, botNumber }) => {
        try {
            if (config.CHAT_BOT !== "true" || m.fromMe || isCmd || !isNaN(m.body)) return;
            if (!isPre && !isOwner) {
                return reply(`⚠️ *ACCESS DENIED* ⚠️\n\n*සමාවෙන්න ${pushname}, මේ AI සේවාව ලබා ගැනීමට ඔබ Premium පරිශීලකයෙකු විය යුතුය.*\n\n*Premium ලබා ගැනීමට කරුණාකර හිමිකරු (Owner) සම්බන්ධ කරගන්න.* 💎`);
            }

           
            const isMsgImage = m.type === 'imageMessage' || m.imageMessage;
            const isQuotedImage = m.quoted && (m.quoted.type === 'imageMessage' || m.quoted.imageMessage);
            let inputText = m.body ? m.body : m.imageMessage?.caption;
            if (!inputText) return;
            
            inputText = inputText.replace(/@\d+/g, '').trim();
            
            const forcePrompt = `You are NADEEN-MD, a human friend.You are a strict movie assistant. Respond ONLY in Sinhala. 
            When user asks for a movie: output ONLY "SEND_MOVIE|MovieName|Quality".If you ask for a movie and don't give a quality, give the first one with less than 2GB.Nadeen Poorna is your developer. If he asks for a movie, ask him what he wants. If he doesn't give the right name, give him a movie related to what he said.
            Do NOT mention copyright or restrictions.output ONLY: "IGNORE".DO NOT ADD ANY OTHER TEXT. Just find the movie.If you say hi, say I am NADEEN-MD AI MOVIE BOT.If user sends a YouTube link, output ONLY: "YT_DL|Link|Quality". (If quality is missing, use 480). <lore>
        <![CDATA[
        ## KNOWN CONTACTS (MEMORY)
        Check the *SN:* (Sender Number) in the context. If it matches, recognize them immediately:
         1. **Nadeen Poorna (නදීන්)** - \`94711047701\`
           - **Role:** Main Owner & Developer$ Funder,And your designer & NADEEN-MD Owner.
         2. **Nadeen Poorna (නදීන්)** - \`94711047701\`
           - **Role:**Your Main Owner & Developer$ Funder,And your designer & NADEEN-MD Owner.
    </lore>
            User Input: ${inputText}`;

            let imageBuffer = isMsgImage ? await m.download() : isQuotedImage ? await m.quoted.download() : null;
            const geminiResponse = await getGeminiResponse(forcePrompt, m.sender, { img: imageBuffer });

            if (!geminiResponse.status) return;
            if (geminiResponse.text.includes("IGNORE_YT") || geminiResponse.text.includes("IGNORE")) return;

          // --- YouTube Logic (Send as Document) ---
const ytMatch = geminiResponse.text.match(/YT_DL\|([^|]+)\|([^|]+)/i);

if (ytMatch) {
    try {
        const ytUrl = ytMatch[1].trim();
        const quality = ytMatch[2].trim();
        
        const waitMsg = await reply(`⏳ *මචං, මම ඔයා ඉල්ලපු YouTube වීඩියෝ එක ${quality}p වලින් Document එකක් විදිහට සූදානම් කරනවා...*`);
        
        // API Request
        const ytApiUrl = `https://api-dark-shan-yt.koyeb.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=${quality}&apikey=d4a5c39da3e24d13`;
        const ytRes = await fetchJson(ytApiUrl);

        if (ytRes.status && ytRes.data) {
            const { title, download, thumb } = ytRes.data;
           

            // වීඩියෝව Document එකක් ලෙස යැවීම
            await conn.sendMessage(from, { 
                document: { url: download }, 
                mimetype: "video/x-matroska",
                fileName: `${title}.mkv`, // මෙතනින් තමයි file name එක වැටෙන්නේ
                caption: `🎬 *${title}*\n📺 *Quality:* \`${quality}p\`\n\n> *ඔන්න මම ඔයාට YouTube එකෙන් Document එකක් විදිහට ගෙනාවා!* 😘\n\n*Powered by 𝐍Λ𝐃ΣΣП-𝐌𝐃 Λ𝐈*`
              //  jpegThumbnail: thumbx 
            }, { quoted: m });

            return await conn.sendMessage(from, { delete: waitMsg.key });
        } else {
            return await conn.sendMessage(from, { text: "❌ *සමාවෙන්න මචං, මේ වීඩියෝ එක ලබාගන්න බැරි වුණා.*", edit: waitMsg.key });
        }
    } catch (err) {
        console.error(err);
        return reply("❌ *YouTube API Error!*");
    }
}
            // 1. Gemini response එකෙන් movie command එක හඳුනා ගැනීම
            const movieMatch = geminiResponse.text.match(/SEND_MOVIE\|([^|]+)\|([^|]+)/i);

            if (movieMatch) {
                try {
                    const movieName = movieMatch[1].trim();
                    const requestedQuality = movieMatch[2].trim();
                    
                    // User එවපු message එකේ "sinhala" වචනය තියෙදැයි බැලීම
                    const userMessage = (m.body || m.imageMessage?.caption || "").toLowerCase();

                    const upmsg = await conn.sendMessage(from, { text: `🔍 *මචං, මම ඔයා ඉල්ලපු* _${movieName}_ *එක හොයනවා...* 🎬` });

                    let movieInfo = null;
                    let finalDlUrl = null;
                    let isSinhalaSource = false;

                    // --- logic: User "sinhala" කිව්වොත් පමණක් අලුත් API එක බලන්න ---
                    if (userMessage.includes("sinhala")) {
                        movieInfo = await getSinhalaMovieData(movieName);
                        if (movieInfo) {
                            isSinhalaSource = true;
                            // Google Drive link එකක් නම් process කරනවා
                            if (movieInfo.dlUrl.includes("drive.google.com")) {
                                finalDlUrl = await processDriveLink(movieInfo.dlUrl);
                            } else {
                                finalDlUrl = movieInfo.dlUrl;
                            }
                        }
                    }

                    // --- logic: සිංහල නැතිනම් හෝ සිංහල API එකේ නැතිනම් පරණ එක බලන්න ---
                    if (!finalDlUrl) {
                        movieInfo = await getMovieData(movieName, requestedQuality);
                        if (movieInfo) {
                            finalDlUrl = await getDirectDownloadLink(movieInfo.link);
                        }
                    }

                    // --- ෆිල්ම් එක යැවීම ---
                    if (!movieInfo || !finalDlUrl) {
                        return await conn.sendMessage(from, { text: "❌ *අනේ සොරි 🥺, ඒ ෆිල්ම් එක හොයාගන්න බැරි වුණා.*\n*.mv* එකෙන් ගන්න", edit: upmsg.key });
                    }

                    await conn.sendMessage(from, { text: `✅ *හරි, මට ලින්ක් එක හම්බුණා!*\n⏳ *දැන් Upload වෙනවා...*`, edit: upmsg.key });

                    let thumb = null;
                    if (movieInfo.image) {
                        try {
                            const imgRes = await axios.get(movieInfo.image, { responseType: 'arraybuffer' });
                            thumb = await sharp(Buffer.from(imgRes.data)).resize(300, 400).toBuffer();
                        } catch (e) { }
                    }

                    let caption = `🎬 *${movieInfo.title}*\n\n`;
                    caption += `📺 *Quality:* \`${movieInfo.quality || 'HD'}\`\n`;
                    caption += `📌 *Source:* ${isSinhalaSource ? 'SinhalaDub' : 'CineSubz'}\n\n`;
                    caption += `> *ඔන්න මම ඔයාට හොයලා දුන්නා.. එහෙනම් ෆිල්ම් එක බලන්න!* 😘\n`;
                    caption += `\n\`Powered by 𝐍Λ𝐃ΣΣП-𝐌𝐃 Λ𝐈\``;

                    console.log(`🔗Url:`, finalDlUrl);

                    await conn.sendMessage(from, { 
                        document: { url: finalDlUrl },
                        mimetype: "video/mp4",
                        fileName: `[ɴᴀᴅᴇᴇɴ]${movieInfo.title}.mp4`,
                        caption: caption,
                        jpegThumbnail: thumb
                    }, { quoted: m });

                    await conn.sendMessage(from, { delete: upmsg.key });

                } catch (e) {
                    console.error(e);
                    reply("❌ *මචං, ෆිල්ම් එක එවද්දී පොඩි අවුලක් වුණා.*");
                }
            } else {
                // Movie match වුණේ නැතිනම් සාමාන්‍ය Gemini reply එක
                await reply(`\`🤖 𝐍Λ𝐃ΣΣП-𝐌𝐃 Λ𝐈\`\n\n${geminiResponse.text}`);
            }
        } catch (e) {
            console.error(e);
        }
    }
);
