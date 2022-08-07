const TelegramBot = require("node-telegram-bot-api");
const Http = require('http');

// load environment variables
const TOKEN = process.env.AUTH_TOKEN;
const APP_URL = process.env.APP_URL;
const BOT_NAME = process.env.BOT_NAME;
const BOT_USRNAME = process.env.BOT_USRNAME;
const MASTER_PASSWD = process.env.MASTER_PASSWD;
const SELF_REQ_TIMELIM = Number(process.env.SELF_REQ_TIMELIM);

// create bot
const Bot = new TelegramBot(TOKEN, { polling: true });

// global variables
const CODEBLOCK = "```";

// help text
const HELP_TXT = (
    "Start the bot service by visiting https://tg-tnd-bot-pdey.herokuapp.com\n\n" + 
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

// developer commands
const DEV_CMD = (
    "Developer's commands:\n"
    + "  /msginfo - Info about msg\n"
    + "  /debug - Log replies at server"
);

// DEBUG flag
const DEBUG = [];

// object to store all data about chats and usernames
const Obj = {};

function sendMsg(chatid, msg)
{
    if (DEBUG.includes("" + chatid))
        console.log("reply: " + chatid + ": " + msg.replace(/\n/g, "; "));
    Bot.sendMessage(chatid, msg);
}

Bot.onText(/^\/dev/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    sendMsg(msg.chat.id, DEV_CMD);
});

Bot.onText(/^\/debug/, (msg, match) => {
    if (!DEBUG.includes("" + msg.chat.id)) {
        DEBUG.push("" + msg.chat.id);
        sendMsg(msg.chat.id, "Turned ON debug mode");
    } else {
        DEBUG.splice(DEBUG.indexOf("" + msg.chat.id), 1);
        sendMsg(msg.chat.id, "Turned OFF debug mode");
    }
});

Bot.onText(/^\/msginfo/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    Bot.sendMessage(
        msg.chat.id,
        `${CODEBLOCK}${JSON.stringify(msg, null, 2)}${CODEBLOCK}`,
        { parse_mode: "markdown" }
    );
});

Bot.onText(/^\/help/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    sendMsg(msg.chat.id, HELP_TXT);
});

Bot.onText(/^\/start/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (msg.chat.type === "private") {
        sendMsg(msg.chat.id, HELP_TXT);
        return;
    }
    if (Obj["" + msg.chat.id]?.players) {
        sendMsg(msg.chat.id, `${BOT_NAME} is already listening!`);
        return;
    }
    Obj["" + msg.chat.id] = {
        players: [ msg.from.username ],
        round: 0
    };
    sendMsg(msg.chat.id, `${BOT_NAME} has started listening!`);
});

Bot.onText(/^\/join/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (msg.chat.type === "private") {
        sendMsg(msg.chat.id, "Truth n Dare should be played in a Group of friends!");
        return;
    }
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

Bot.onText(/^\/leave/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (msg.chat.type === "private") {
        sendMsg(msg.chat.id, "Truth n Dare should be played in a Group of friends!");
        return;
    }
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

Bot.onText(/^\/list/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (msg.chat.type === "private") {
        sendMsg(msg.chat.id, "Truth n Dare should be played in a Group of friends!");
        return;
    }
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

Bot.onText(/^\/spin/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (msg.chat.type === "private") {
        sendMsg(msg.chat.id, "Truth n Dare should be played in a Group of friends!");
        return;
    }
    if (!Obj["" + msg.chat.id]?.players) {
        sendMsg(msg.chat.id, `You need to /start the game before you can /spin`);
        return;
    }
    const chat = Obj["" + msg.chat.id];
    const players = chat.players;
    const len = players.length;
    if (len < 2) {
        sendMsg(msg.chat.id,
            `Truth n Dare requires a minimum of 2 players, but they're ${len} player(s) present\n`
            + `Use /join command to participate`
        );
        return;
    }
    const pick1 = players[Math.floor(Math.random() * players.length)];
    let pick2 = pick1;
    while (pick2 == pick1) {
        pick2 = players[Math.floor(Math.random() * players.length)];
    }
    const reply = `Round ${++chat.round}\n\@${pick1} asks!\n\@${pick2} answers!`;
    sendMsg(msg.chat.id, reply);
});

Bot.onText(/^\/stop/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (msg.chat.type === "private") {
        sendMsg(msg.chat.id, "Truth n Dare should be played in a Group of friends!");
        return;
    }
    if (!Obj["" + msg.chat.id]?.players) {
        sendMsg(msg.chat.id, `You need to /start the game before you can /stop`);
        return;
    }
    delete Obj["" + msg.chat.id];
    sendMsg(msg.chat.id, `${BOT_NAME} has stopped listening!`);
});

Bot.onText(/^\/about/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    const reply = (
        `Bot: ${BOT_NAME}:\n`
        + "Sources: https://github.com/AvirukBasak/tg-tnd-bot-pdey\n"
        + "License: MIT"
    );
    sendMsg(msg.chat.id, reply);
});

Bot.on("polling_error", (msg) => {
    // hide multiple instances active error
    if (msg.message !== "ETELEGRAM: 409 Conflict: terminated by other getUpdates request; make sure that only one bot instance is running")
        console.log(JSON.stringify(msg));
});

Http.createServer((req, res) => {
  res.write(`<html><head><title>${BOT_USRNAME}</title></head><body><h1 style="font-family: monospace">started: ${BOT_NAME}: ${BOT_USRNAME}</h1></body></html>`);
  res.end();
}).listen(process.env.PORT || 8080);
