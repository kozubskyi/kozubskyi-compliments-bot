const TelegramBot = require("node-telegram-bot-api")
let compliments = require("./data")

require("dotenv").config()
const { BOT_TOKEN, KOZUBSKYI_CHAT_ID } = process.env

const bot = new TelegramBot(BOT_TOKEN, { polling: true })

bot.setMyCommands([
  { command: "/start", description: "Начать" },
  { command: "/compliment", description: "Получить комплиментик" },
])

// 👇 обработчик получения сообщения от пользователя
bot.on("message", (msg) => {
  makeResponse({
    firstName: msg.from.first_name,
    lastName: msg.from.last_name,
    username: msg.from.username,
    command: msg.text,
    chatId: msg.chat.id,
  })
})

// 👇 Обработчик клика на кнопку (если она есть)
// bot.on("callback_query", (cb) => {
//   makeResponse({
//     firstName: cb.from.first_name,
//     lastName: cb.from.last_name,
//     username: cb.from.username,
//     command: cb.data,
//     chatId: cb.message.chat.id,
//   })
// })

async function makeResponse({ firstName = "", lastName = "", username, command, chatId }) {
  const sweet = "lena_rak_05"
  const creator = "kozubskyi"
  const creatorChatId = Number(KOZUBSKYI_CHAT_ID)
  let response = "К сожалению Вы не Елена Рак, а комплиментики я делаю только ей 🤷‍♂️"
  let buttonOptions = {}

  try {
    if (username === sweet) {
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

    if (username === creator) {
      const adminCommand = command.slice(0, 3)
      const newData = command.slice(4)

      if (adminCommand === "add") {
        compliments.push(newData)
        response = "Комплиментик успешно добавлен"
      } else if (adminCommand === "del") {
        compliments = compliments.filter((compliment, index) => index != newData || compliment !== newData)
        response = "Комплиментик успешно удален"
      } else if (adminCommand === "cfd") {
        compliments = JSON.parse(newData)
        response = "Все комплиментики успешно создались"
      } else if (command === "/all") {
        response = JSON.stringify(Object.entries(compliments))
      } else {
        response = "Некорректная команда"
      }
    }

    await bot.sendMessage(chatId, response, buttonOptions)

    username !== creator &&
      bot.sendMessage(
        creatorChatId,
        `Пользователь '${firstName} ${lastName} <${username}> (${chatId})' отправил(-а) сообщение '${command}' и получил(-а) ответ '${response}'`
      )
  } catch (error) {
    bot.sendMessage(
      creatorChatId,
      `Пользователь '${firstName} ${lastName} <${username}> (${chatId})' отправил(-а) сообщение '${command}' и получилась ошибка '${error.message}'`
    )
  }
}

