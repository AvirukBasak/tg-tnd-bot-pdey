const TelegramBot = require('node-telegram-bot-api');
const TOKEN = process.env.TG_TND_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

console.log("tok: " + TOKEN.toString().substring(TOKEN.length -6, TOKEN.length -1));

bot.on('message', (msg) => {
    console.log(msg);
    bot.sendMessage(msg.chat.id, "hi");
});

bot.onText(/\/about/, (msg, match) => {
    let chatId = msg.chat.id;
    bot.sendMessage(chatId,
        `finder bot\nbot where you can search for a movie and get details about it.`, { parse_mode: 'Markdown' });
});
