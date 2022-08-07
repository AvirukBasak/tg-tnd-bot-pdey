const TelegramBot = require("node-telegram-bot-api");
const Http = require('http');

// load environment variables
const TOKEN = process.env.AUTH_TOKEN;
const BOT_NAME = process.env.BOT_NAME;
const BOT_USRNAME = process.env.BOT_USRNAME;
const MASTER_PASSWD = process.env.MASTER_PASSWD;

// create bot
const Bot = new TelegramBot(TOKEN, { polling: true });

// global variables
const CODEBLOCK = "```";

// object to store all data about chats and usernames
const Obj = {};

function sendMsg(chatid, msg)
{
    Bot.sendMessage(chatid, msg, { parse_mode: "markdown" });
}

Bot.onText(/\/msginf(.*)/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (match[1] !== " " + MASTER_PASSWD)
        return;
    sendMsg(
        msg.chat.id,
        `${CODEBLOCK}${JSON.stringify(msg, null, 2)}${CODEBLOCK}`
    );
});

Bot.onText(/\/help\@(.+)/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (match[1] !== BOT_USRNAME)
        return;
    const reply = (
        "Commands:\n"
        + "  /help - Display this message\n"
        + "  /start - Listen to this chat\n"
        + "  /join - Join game\n"
        + "  /list - List players\n"
        + "  /spin - Select two randomly\n"
        + "  /leave - Leave game\n"
        + "  /stop - Stop listening\n"
        + "  /about - Sources"
    );
    sendMsg(msg.chat.id, reply);
});

Bot.onText(/\/start\@(.+)/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (match[1] !== BOT_USRNAME)
        return;
    if (Obj["" + msg.chat.id]?.players) {
        sendMsg(msg.chat.id, `Game has already started!`);
        return;
    }
    Obj["" + msg.chat.id] = {
        players: [ msg.from.username ],
        round: 0
    };
    sendMsg(msg.chat.id, `${BOT_NAME} has started listening!`);
});

Bot.onText(/\/join/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (!Obj["" + msg.chat.id]?.players) {
        sendMsg(msg.chat.id, `You need to /start the game before you can /join`);
        return;
    }
    const player = msg.from.username;
    if (!Obj["" + msg.chat.id].players.includes(player)) {
        Obj["" + msg.chat.id].players.push(player);
    } else {
        sendMsg(msg.chat.id, `\@${player}, you're already in the game!`);
        return;
    }
    sendMsg(msg.chat.id, `\@${player} has joined the game!`);
});

Bot.onText(/\/leave/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (!Obj["" + msg.chat.id]?.players) {
        sendMsg(msg.chat.id, `You need to /start the game before you can /leave`);
        return;
    }
    const players = Obj["" + msg.chat.id].players;
    const player = msg.from.username;
    if (players.includes(player)) {
        Obj["" + msg.chat.id].players.splice(players.indexOf(player), 1);
    } else {
        sendMsg(msg.chat.id, `\@${player}, you aren't in the game!`);
        return;
    }
    sendMsg(msg.chat.id, `\@${player} has left the game`);
});

Bot.onText(/\/list/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (!Obj["" + msg.chat.id]?.players) {
        sendMsg(msg.chat.id, `You need to /start the game before you can /list`);
        return;
    }
    if (Obj["" + msg.chat.id].players.length < 1) {
        sendMsg(msg.chat.id, `There're no participants`);
        return;
    }
    let reply = "Usernames of participants:\n";
    for (const player of Obj["" + msg.chat.id].players) {
        reply += `- \@${player}\n`;
    }
    sendMsg(msg.chat.id, reply);
});

Bot.onText(/\/spin/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (!Obj["" + msg.chat.id]?.players) {
        sendMsg(msg.chat.id, `You need to /start the game before you can /spin`);
        return;
    }
    const chat = Obj["" + msg.chat.id];
    const players = chat.players;
    const len = players.length;
    if (len < 2) {
        sendMsg(msg.chat.id, `Truth n Dare requires a minimum of 2 players, but they're ${len} player(s) present`);
        sendMsg(msg.chat.id, `Use /join command to participate`);
        return;
    }
    const pick1 = players[Math.floor(Math.random() * players.length)];
    let pick2 = pick1;
    while (pick2 == pick1) {
        let pick2 = players[Math.floor(Math.random() * players.length)];
    }
    const reply = `### Round ${++chat.round}\n\@${pick1} asks!\n\@${pick2} answers!`;
    sendMsg(msg.chat.id, reply);
});

Bot.onText(/\/stop\@(.+)/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (!Obj["" + msg.chat.id]?.players) {
        sendMsg(msg.chat.id, `You need to /start the game before you can /stop`);
        return;
    }
    if (match[1] !== BOT_USRNAME)
        return;
    delete Obj["" + msg.chat.id];
    sendMsg(msg.chat.id, `${BOT_NAME} has stopped listening!`);
});

Bot.onText(/\/about\@(.+)/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (match[1] !== BOT_USRNAME)
        return;
    const reply = (
        `Bot: ${BOT_NAME}:\n`
        + "sources: https://github.com/AvirukBasak/tg-tnd-bot-pdey\n"
        + "license: MIT"
    );
    sendMsg(msg.chat.id, reply);
});

Bot.on("polling_error", (msg) => {
    return;
});

Http.createServer((req, res) => {
  res.write(`<html><head><title>${BOT_USRNAME}</title></head><body><h1>started: ${BOT_NAME}: ${BOT_USRNAME}</h1></body></html>`);
  res.end();
}).listen(process.env.PORT || 8080);
