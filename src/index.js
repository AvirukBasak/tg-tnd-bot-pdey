const TelegramBot = require("node-telegram-bot-api");

// load environment variables
const TOKEN = process.env.AUTH_TOKEN;
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

Bot.onText(/\/msginf (.+)/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (match[0] !== MASTER_PASSWD) {
        sendMsg("Command /msginf requires `MASTER_PASSWD` as argument");
        return;
    }
    sendMsg(
        msg.chat.id,
        `${CODEBLOCK}${JSON.stringify(msg, null, 2)}${CODEBLOCK}`
    );
});

Bot.onText(/\/help@(.+)/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (match[0] !== BOT_USRNAME)
        return;
    const reply = (
        "Commands:\n"
        + "  /help  -- Display this message\n"
        + "  /start -- Make bot listen to this chat/group\n"
        + "  /join  -- Participate in the Truth n Dare game\n"
        + "  /list  -- List all participants\n"
        + "  /spin  -- Select two random people\n"
        + "  /leave -- Leave the game\n"
        + "  /stop  -- Make bot stop listening to this chat/group\n"
        + "  /about -- Link to sources"
    );
    sendMsg(msg.chat.id, reply);
});

Bot.onText(/\/start@(.+)/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (match[0] !== BOT_USRNAME)
        return;
    Obj["" + msg.chat.id] = {
        players: [],
        round: 0
    };
    sendMsg(msg.chat.id, `@${BOT_USRNAME} has started listening!`);
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
        sendMsg(msg.chat.id, `@${player}, you're already in the game!`);
        return;
    }
    sendMsg(msg.chat.id, `@${player} has joined the game!`);
});

Bot.onText(/\/leave/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (!Obj["" + msg.chat.id]?.players) {
        sendMsg(msg.chat.id, `You need to /start the game before you can /leave`);
        return;
    }
    const player = msg.from.username;
    if (Obj["" + msg.chat.id].players.includes(player)) {
        Obj["" + msg.chat.id].players.splice(players.indexOf(player), 1);
    } else {
        sendMsg(msg.chat.id, `@${player}, you aren't in the game!`);
        return;
    }
    sendMsg(msg.chat.id, `@${player} has left the game`);
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
    const reply = "### Usernames of participants:";
    for (const player of Obj["" + msg.chat.id].players) {
        reply += `- ${player}\n`;
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
        sendMsg(msg.chat.id, `Truth n Dare requires a minimum of 2 players, but they're only ${len} players present`);
        sendMsg(msg.chat.id, `Use /join command to participate`);
        return;
    }
    const pick1 = players[Math.floor(Math.random() * players.length)];
    let pick2 = pick1;
    while (pick2 == pick1) {
        let pick2 = players[Math.floor(Math.random() * players.length)];
    }
    const reply = `### Round ${++chat.round}\n@${pick1} asks!\n@${pick2} answers!`;
    sendMsg(msg.chat.id, reply);
});

Bot.onText(/\/stop@(.+)/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (!Obj["" + msg.chat.id]?.players) {
        sendMsg(msg.chat.id, `You need to /start the game before you can /stop`);
        return;
    }
    if (match[0] !== BOT_USRNAME)
        return;
    delete Obj["" + msg.chat.id];
    sendMsg(msg.chat.id, `@${BOT_USRNAME} has stopped listening!`);
});

Bot.onText(/\/about@(.+)/, (msg, match) => {
    if (msg.from.is_bot)
        return;
    if (match[0] !== BOT_USRNAME)
        return;
    const reply = (
        `Bot @${BOT_USRNAME}:`
        + "sources: https://github.com/AvirukBasak/tg-tnd-bot-pdey\n"
        + "license: MIT"
    );
    sendMsg(msg.chat.id, reply);
});

Bot.on("polling_error", (msg) => console.log(msg));
