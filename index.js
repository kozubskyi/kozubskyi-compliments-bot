const TelegramBot = require("node-telegram-bot-api")
const compliments = require("./data")

require("dotenv").config()

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

bot.setMyCommands([
  { command: "/start", description: "Начать" },
  { command: "/compliment", description: "Получить комплиментик" },
])

// 👇 обработчик получения сообщения от пользователя
bot.on("message", (msg) => {
  makeResponse({
    command: msg.text,
    chatId: msg.chat.id,
    username: msg.from.username,
  })
})

// 👇 Обработчик клика на кнопку (если она есть)
bot.on("callback_query", (cb) => {
  makeResponse({
    command: cb.data,
    chatId: cb.message.chat.id,
    username: cb.from.username,
  })
})

function makeResponse({ command, chatId, username }) {
  try {
    let response = "К сожалению Вы не Елена Рак, а комплиментики я делаю только ей 🤷‍♂️"
    let buttonOptions = {}

    if (username === "lena_rak_05") {
      if (command === "/start") {
        response =
          "Ленусик, приветик) 😘 Денис просил передать тебе кучу комплиментиков. Напиши или нажми /compliment и получишь комплиментик)"
        // buttonOptions = {
        //   reply_markup: JSON.stringify({
        //     inline_keyboard: [[{ text: "Получить комплиментик", callback_data: "/compliment" }]],
        //   }),
        // }
      } else if (command === "/compliment") {
        const randomIndex = Math.floor(Math.random() * compliments.length)
        response = compliments[randomIndex]
        // buttonOptions = {
        //   reply_markup: JSON.stringify({
        //     inline_keyboard: [[{ text: "Получить еще комплиментик", callback_data: "/compliment" }]],
        //   }),
        // }
      } else {
        response = "Ленусик, такой команды не существует) Пока есть только команды /start и /compliment"
      }
    }

    bot.sendMessage(chatId, response, buttonOptions)
  } catch (error) {
    console.log(error)
  }
}

