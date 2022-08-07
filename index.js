process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const Agent = require('socks5-https-client/lib/Agent');
const token = process.env.AUTH_TOKEN;

const bot = new TelegramBot(token, {polling:true,request:{
    agentClass: Agent,
    agentOptions: {
        socksHost: process.env.SOCKS5_HOST
        socksPort: process.env.SOCKS5_PORT
    }
}});

bot.on('message', (msg) => {
    bot.sendMessage(msg.chat.id, "hello");
});

bot.on("polling_error", (msg) => console.log(msg));
