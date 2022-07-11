const TelegramBot = require("node-telegram-bot-api")
let compliments = require("./data")

require("dotenv").config()

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

bot.setMyCommands([
  { command: "/start", description: "Начать" },
  { command: "/compliment", description: "Получить комплиментик" },
])

// 👇 обработчик получения сообщения от пользователя
bot.on("message", (msg) => {
  makeResponse({
    username: msg.from.username,
    command: msg.text,
    chatId: msg.chat.id,
  })
})

// 👇 Обработчик клика на кнопку (если она есть)
bot.on("callback_query", (cb) => {
  makeResponse({
    username: cb.from.username,
    command: cb.data,
    chatId: cb.message.chat.id,
  })
})

function makeResponse({ username, command, chatId }) {
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

    if (username === "kozubskyi") {
      const adminCommand = command.slice(0, 3)
      const newCompliment = command.slice(4)

      if (adminCommand === "add") {
        compliments.push(newCompliment)
        response = "Комплиментик успешно добавлен"
      } else if (adminCommand === "del") {
        compliments = compliments.filter((compliment) => compliment !== newCompliment)
        response = "Комплиментик успешно удален"
      } else {
        response = "Некорректная команда"
      }
    }

    bot.sendMessage(chatId, response, buttonOptions)
  } catch (error) {
    console.log(error)
  }
}

