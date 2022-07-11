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

async function makeResponse({ username, command, chatId }) {
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
      const newData = command.slice(4)

      if (adminCommand === "add") {
        compliments.push(newData)
        response = "Комплиментик успешно добавлен"
      } else if (adminCommand === "del") {
        compliments = compliments.filter((compliment) => compliment !== newData)
        response = "Комплиментик успешно удален"
      } else if (adminCommand === "ccd") {
        compliments = JSON.parse(newData)
      } else if (command === "/all") {
        response = JSON.stringify(compliments)
      } else {
        response = "Некорректная команда"
      }
    }

    await bot.sendMessage(chatId, response, buttonOptions)

    bot.sendMessage(
      397376590,
      `Пользователь '${username}' отправил(-а) сообщение '${command}' и получил(-а) ответ '${response}'`
    )
  } catch (error) {
    bot.sendMessage(
      397376590,
      `Пользователь '${username}' отправил(-а) сообщение '${command}' и получилась ошибка '${error.message}'`
    )
  }
}

