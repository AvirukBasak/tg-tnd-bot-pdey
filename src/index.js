const TelegramBot = require('node-telegram-bot-api');
const token = process.env.AUTH_TOKEN;

const bot = new TelegramBot(token, { polling:true });

bot.on('message', (msg) => {
    console.log(msg);
    bot.sendMessage(msg.chat.id, "hello, I recieved msg from you");
});

bot.on("polling_error", (msg) => console.log(msg));
