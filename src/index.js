const TelegramBot = require('node-telegram-bot-api');
const token = process.env.AUTH_TOKEN;

const bot = new TelegramBot(token, { polling:true });

bot.onText(/\/msginf/, (msg, match) => {
    // console.log(msg);
    const codeblock = "```";
    bot.sendMessage(msg.chat.id, `${codeblock}${JSON.stringify(msg, null, 2)}${codeblock}`);
});

bot.on("polling_error", (msg) => console.log(msg));
