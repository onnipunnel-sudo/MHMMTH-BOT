const axios = require('axios');
const config = require('../config');
const { get, input } = require("../lib/database");

/**
 * GitHub එකෙන් File එක සහ SHA එක ලබා ගැනීම
 */
async function getGithubFile(repo, path) {
    const url = `https://api.github.com/repos/Nadeenpoorna-app/${repo}/contents/${path}`;
    try {
        const { data } = await axios.get(url, {
            headers: { 
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Node.js-Bot'
            }
        });
        return {
            content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8')),
            sha: data.sha
        };
    } catch (error) {
        console.error(`❌ Error fetching ${path} from ${repo}:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * GitHub එකට අලුත් දත්ත Upload කිරීම
 */
async function updateGithubFile(repo, path, content, sha) {
    const url = `https://api.github.com/repos/Nadeenpoorna-app/${repo}/contents/${path}`;
    try {
        await axios.put(url, {
            message: "Premium Database Update 🚀",
            content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
            sha: sha
        }, {
            headers: { 
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
    } catch (error) {
        console.error(`❌ Error updating ${path}:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * Premium එකතු කිරීමේ Logic එක
 */
async function addPremiumUser(number, days) {
    try {
        const numberOnly = number.replace(/[^0-9]/g, "");
        
        // 1. numbers.json පරීක්ෂා කිරීම
        const premFile = await getGithubFile('BUY-MOVIEXGO-BOT', 'prem/numbers.json');
        let currentNumbersString = premFile.content.numbers || "";
        let numbersArray = currentNumbersString.split(",").map(n => n.trim()).filter(n => n !== "");

        if (numbersArray.includes(numberOnly)) {
            return { 
                status: 'already_exists', 
                message: "⚠️ මේ අංකය දැනටමත් Premium ලැයිස්තුවේ තියෙනවා." 
            };
        }

        // මිල තීරණය කිරීම
        const d = parseInt(days);
        let price = (d === 15) ? 200 : (d === 30) ? 350 : (d === 31) ? 400 : (d === 45) ? 500 : (d === 90) ? 900 : 0;
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + d);
        const dateString = expiryDate.toISOString().split('T')[0];

        // 2. data.json (movie-plans) update කිරීම
        const dataFile = await getGithubFile('movie-plans', 'data.json');
        if (!dataFile.content.total_income) dataFile.content.total_income = 0;
        dataFile.content.total_income += price;
        
        if (!dataFile.content.active) dataFile.content.active = [];
        dataFile.content.active.push({ 
            number: numberOnly, 
            date: dateString,
            price: price,
            addedAt: new Date().toISOString().split('T')[0]
        });
        
        await updateGithubFile('movie-plans', 'data.json', dataFile.content, dataFile.sha);

        // 3. numbers.json update කිරීම
        numbersArray.push(numberOnly);
        premFile.content.numbers = numbersArray.join(',');
        
        await updateGithubFile('BUY-MOVIEXGO-BOT', 'prem/numbers.json', premFile.content, premFile.sha);
        
        return { status: 'success', dateString, price };
    } catch (e) {
        console.error("Critical Error in addPremiumUser:", e);
        return { status: 'error', message: "Internal Error" };
    }
}

/**
 * කාලය ඉකුත් වූ අය අයින් කිරීම
 */
async function checkAndRemoveExpired(conn) {
    try {
        const { get, input } = require("../lib/database"); // 👈 Database functions මෙතනට ගත්තා
        const today = new Date().toISOString().split('T')[0];
        
        const dataFile = await getGithubFile('movie-plans', 'data.json');
        let activeUsers = dataFile.content.active || [];
        let expiredUsers = dataFile.content.expired || [];
        
        let stillActiveInPlans = activeUsers.filter(user => user.date > today);
        let justExpired = activeUsers.filter(user => user.date <= today);

        if (justExpired.length > 0) {
            const numbersToRemove = justExpired.map(u => u.number);

            // 1. Movie Plans Database Update
            dataFile.content.active = stillActiveInPlans;
            dataFile.content.expired = expiredUsers.concat(justExpired.map(u => ({ ...u, status: 'expired' })));
            await updateGithubFile('movie-plans', 'data.json', dataFile.content, dataFile.sha);

            // 2. Numbers.json Database Update
            const premFile = await getGithubFile('BUY-MOVIEXGO-BOT', 'prem/numbers.json');
            let allNumbers = (premFile.content.numbers || "").split(",").map(n => n.trim()).filter(n => n !== "");
            let updatedNumbers = allNumbers.filter(num => !numbersToRemove.includes(num));
            premFile.content.numbers = updatedNumbers.join(',');
            await updateGithubFile('BUY-MOVIEXGO-BOT', 'prem/numbers.json', premFile.content, premFile.sha);

            // 3. SUDO ලැයිස්තුවෙන් ඉවත් කිරීම (ඔයා ඉල්ලපු කොටස)
            try {
                let sudoList = await get("SUDO");
                if (sudoList && Array.isArray(sudoList)) {
                    // Expired වුණු අංක SUDO ලිස්ට් එකේ තියෙනවා නම් ඒවා අයින් කරනවා
                    let updatedSudoList = sudoList.filter(sudoNum => {
                        return !numbersToRemove.some(expNum => sudoNum.includes(expNum));
                    });

                    if (sudoList.length !== updatedSudoList.length) {
                        await input("SUDO", updatedSudoList);
                        console.log("🚫 Removed expired users from SUDO.");
                    }
                }
            } catch (err) {
                console.error("Error updating SUDO list:", err);
            }

            // 4. Admin දැනුවත් කිරීම
            const payNumber = "94711047701@s.whatsapp.net";
            for (let user of justExpired) {
                const msg = `⚠️ *PREMIUM EXPIRED ALERT*\n\n` +
                            `👤 *User:* ${user.number}\n` +
                            `📅 *Expired On:* ${user.date}\n\n` +
                            `*Status:* Removed from Premium & SUDO list. ✅`;
                const usermsg = `⚠️ *YOUR PACKAGE EXPIRED*\n\n` +
                            `👤 *User ID:* ${user.number}\n` +
                            `📅 *Added on:* ${user.addedAt}\n\n` +
                            `*🟢Status:* Please Contact Owner wa.me/94711047701`;
                const UNumber = `${user.number}`;
                
                await conn.sendMessage(payNumber, { text: usermsg });
              //  await conn.sendMessage(UNumber, { text: msg });
            }
            return true;
        }
    } catch (e) {
        console.error("CheckExpired Error:", e);
    }
    return false;
}

/**
 * Menu එකට විස්තර ලබා ගැනීම
 */
async function getPremiumInfo(number) {
    const numberOnly = number.replace(/[^0-9]/g, "");
    try {
        const dataFile = await getGithubFile('movie-plans', 'data.json');
        const user = (dataFile.content.active || []).find(u => u.number === numberOnly);

        if (!user) return null;

        const today = new Date();
        const expiry = new Date(user.date);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)); 

        return {
            expiryDate: user.date,
            remainingDays: diffDays > 0 ? diffDays : 0
        };
    } catch (e) {
        return null;
    }
}
async function addDirectIncome(number) {
    try {
        const numberOnly = number.replace(/[^0-9]/g, "");
        const price = 200; // ස්ථාවර මුදල රු. 200
        const dateString = new Date().toISOString().split('T')[0];

        // 1. data.json (movie-plans) update කිරීම
        const dataFile = await getGithubFile('movie-plans', 'data.json');
        
        if (!dataFile.content.total_income) dataFile.content.total_income = 0;
        dataFile.content.total_income += price; // රු. 200ක් එකතු කිරීම

        if (!dataFile.content.direct_sales) dataFile.content.direct_sales = [];
        
        // Record එකක් විදිහට තබා ගැනීමට
        dataFile.content.direct_sales.push({
            number: numberOnly,
            amount: price,
            addedAt: dateString
        });

        await updateGithubFile('movie-plans', 'data.json', dataFile.content, dataFile.sha);

        return { status: 'success', price };
    } catch (e) {
        console.error("Critical Error in addDirectIncome:", e);
        return { status: 'error', message: "Internal Error" };
    }
}
module.exports = { 
    addPremiumUser, 
    addDirectIncome,
    checkAndRemoveExpired, 
    getGithubFile,
    getPremiumInfo
};
