const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TG_TND_BOT_TOKEN, { polling: true });
const request = require('request');
const express = require('express');
const app = express();


require('dotenv').config();



bot.onText(/\/movie (.+)/, (msg, match) => {
    let movie = match[1];
    let chatId = msg.chat.id;
    request(`http://www.omdbapi.com/?apiKey=${process.env.OMD_API_KEY}=${movie}`, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            bot.sendMessage(chatId, '_Looking for _' + movie + '...', { parse_mode: 'Markdown' })
                .then((msg) => {
                    let res = JSON.parse(body);
                    bot.sendPhoto(chatId, res.Poster, { caption: 'Result: \nTitle: ' + res.Title + '\nYear: ' + res.Year + '\nRated: ' + res.Rated + '\nReleased: ' + res.Released + '\nRuntime: ' + res.Runtime + '\nGenre: ' + res.Genre + '\nDirector: ' + res.Director + '\nPlot: ' + res.Plot })
                        .catch((err) => {
                            if (err) {
                                bot.sendMessage(chatId, 'Error in finding,Check the movie title');
                            }
                        })
                })


        }
    })
})

bot.onText(/\/about (.+)/, (msg, match) => {
    if (match[1]) {
        let chatId = msg.chat.id;
        bot.sendMessage(chatId,
            `finder bot\nbot where you can search for a movie and get details about it.`, { parse_mode: 'Markdown' });
    }
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log(`Server is running at port ${PORT}`);
});
