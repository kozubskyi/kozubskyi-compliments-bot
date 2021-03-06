//* node-telegram-bot-api

require("dotenv").config() // Без этого кода перед require("node-telegram-bot-api") и NTBA_FIX_319 = 1 в файле .env выдает ошибку:
// node-telegram-bot-api deprecated Automatic enabling of cancellation of promises is deprecated. In the future, you will have to enable it yourself. See https://github.com/yagop/node-telegram-bot-api/issues/319. at node:internal/modules/cjs/loader:1105:14
// Решение: https://github.com/yagop/node-telegram-bot-api/issues/540

const TelegramBot = require("node-telegram-bot-api")
// const dotenv = require("dotenv")
const axios = require("axios")

// dotenv.config()
const { BOT_TOKEN, KOZUBSKYI_CHAT_ID, LENA_RAK_CHAT_ID, DATABASE_URL } = process.env

const bot = new TelegramBot(BOT_TOKEN, { polling: true })

bot.setMyCommands([
  // { command: "/start", description: "Начать" },
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

async function makeResponse({ firstName, lastName, username, command, chatId }) {
  const sweet = "lena_rak_05"
  const creator = "kozubskyi"
  const sweetChatId = Number(LENA_RAK_CHAT_ID)
  const creatorChatId = Number(KOZUBSKYI_CHAT_ID)
  let response
  let buttonOptions = {}

  try {
    if (username === sweet) {
      if (command === "/start") {
        response =
          "Ленусик, приветик) 😘 Денис просил передать тебе кучу комплиментиков. Напиши или нажми /compliment и получишь комплиментик)"
      } else if (command === "/compliment") {
        const { data } = await axios.get(DATABASE_URL)
        const randomIndex = Math.floor(Math.random() * data.length)

        response = data[randomIndex][1]
      } else {
        response = "Я передам Денису то, что ты написала) 😘"
      }
    } else if (username === creator) {
      const [adminCommand, newData] = splitMessage(command)

      if (adminCommand === "add") {
        await axios.post(DATABASE_URL, { text: newData })

        response = "Комплиментик добавлен"
      } else if (adminCommand === "del") {
        await axios.delete(`${DATABASE_URL}/${newData}`)

        response = "Комплиментик удален или такого и не было в базе данных"
      } else if (adminCommand === "mlr") {
        await bot.sendMessage(sweetChatId, newData)

        response = "Сообщение любимой отправлено"
      } else if (adminCommand === "msg") {
        const [receiverChatId, text] = splitMessage(newData)

        await bot.sendMessage(Number(receiverChatId), text)
        response = "Сообщение пользователю отправлено"
      } else if (command === "/all") {
        const { data } = await axios.get(DATABASE_URL)

        response = JSON.stringify(data)
      } else if (command === "/allq") {
        const { data } = await axios.get(DATABASE_URL)

        response = data.length
      } else if (command === "/help") {
        response = `
        Команды:
        "add _" - добавить новый комплиментик с текстом _;
        "del _" - удалить комплиментик с текстом _;
        "mlr _" - отправить сообщение Лене Рак с текстом _;
        "msg _ __" - отправить сообщение пользователю с id чата _ и текстом __;
        "/all" - получить entries всех комплиментиков;
        "/allq - количество всех комплиментиков в базе данных.
        `
      } else {
        response = "Некорректная команда"
      }
    } else {
      if (command === "/start" || command === "/compliment") {
        response = "К сожалению Вы не Елена Рак, а комплиментики я делаю только ей 🤷‍♂️"
        // buttonOptions = {
        //   reply_markup: JSON.stringify({
        //     inline_keyboard: [[{ text: "Получить комплиментик", callback_data: "/compliment" }]],
        //   }),
        // }
      } else {
        response = "Я передам Денису то, что Вы написали 😉"
      }
    }

    await bot.sendMessage(chatId, response, buttonOptions)

    username !== creator &&
      bot.sendMessage(
        creatorChatId,
        `Пользователь "${firstName} ${lastName} <${username}> (${chatId})" отправил(-а) сообщение "${command}" и получил(-а) ответ "${response}"`
      )
  } catch (err) {
    username !== creator && (await bot.sendMessage(chatId, "Я немножко сломался, скоро починюсь и вернусь 👨‍🔧⚙️😊"))

    bot.sendMessage(
      creatorChatId,
      `❌ Ошибка! Пользователь "${firstName} ${lastName} <${username}> (${chatId})" отправил(-а) сообщение "${command}" и получилась ошибка "${err.message}"`
    )
  }
}

function splitMessage(msg) {
  const msgArr = msg.split(" ")
  let data = msgArr[0]
  let text = msgArr.slice(1).join(" ")

  return [data, text]
}

/*

//* telegraf

const { Telegraf } = require("telegraf")
const dotenv = require("dotenv")
const axios = require("axios")

dotenv.config()
const { BOT_TOKEN, KOZUBSKYI_CHAT_ID, LENA_RAK_CHAT_ID, DATABASE_URL } = process.env

const bot = new Telegraf(BOT_TOKEN)

function start() {
  const sweet = "lena_rak_05"
  const creator = "kozubskyi"
  const sweetChatId = Number(LENA_RAK_CHAT_ID)
  const creatorChatId = Number(KOZUBSKYI_CHAT_ID)

  bot.on("text", async (ctx) => {
    const firstName = ctx.message.from.first_name
    const lastName = ctx.message.from.last_name
    const username = ctx.message.from.username
    const command = ctx.message.text
    const chatId = ctx.message.chat.id

    let response

    try {
      if (username === sweet) {
        if (command === "/start") {
          response =
            "Ленусик, приветик) 😘 Денис просил передать тебе кучу комплиментиков. Напиши или нажми /compliment и получишь комплиментик)"
        } else if (command === "/compliment") {
          const { data } = await axios.get(DATABASE_URL)
          const randomIndex = Math.floor(Math.random() * data.length)

          response = data[randomIndex].text
        } else {
          response = "Я передам Денису то, что ты написала) 😘"
        }
      } else if (username === creator) {
        const [adminCommand, newData] = splitMessage(command)

        if (adminCommand === "add") {
          await axios.post(DATABASE_URL, { text: newData })

          response = "Комплиментик успешно добавлен"
        } else if (adminCommand === "del") {
          await axios.delete(`${DATABASE_URL}/${newData}`)

          response = "Комплиментик успешно удален"
        } else if (adminCommand === "mlr") {
          ctx.telegram.sendMessage(sweetChatId, newData)

          response = "Сообщение любимой успешно отправлено"
        } else if (adminCommand === "msg") {
          const [receiverChatId, text] = splitMessage(newData)

          ctx.telegram.sendMessage(Number(receiverChatId), text)
          response = "Сообщение пользователю успешно отправлено"
        } else if (command === "/all") {
          const { data } = await axios.get(DATABASE_URL)

          response = JSON.stringify(data)
        } else if (command === "/help") {
          response = `
        "add _" - добавить новый комплиментик с текстом _
        "del _" - удалить комплиментик с текстом _
        "mlr _" - отправить сообщение Лене Рак с текстом _
        "msg _ __" - отправить сообщение пользователю с id чата _ и текстом __
        "/all" - получить массив всех комплиментиков
        `
        } else {
          response = "Некорректная команда"
        }
      } else {
        if (command === "/start" || command === "/compliment") {
          response = "К сожалению Вы не Елена Рак, а комплиментики я делаю только ей 🤷‍♂️"
        } else {
          response = "Я передам Денису то, что Вы написали 😉"
        }
      }

      ctx.reply(response)

      username !== creator &&
        ctx.telegram.sendMessage(
          creatorChatId,
          `Пользователь "${firstName} ${lastName} <${username}> (${chatId})" отправил(-а) сообщение "${command}" и получил(-а) ответ "${response}"`
        )
    } catch (err) {
      username !== creator && ctx.reply("Я немножко сломался, скоро починюсь и вернусь 👨‍🔧⚙️😊")

      ctx.telegram.sendMessage(
        creatorChatId,
        `❌ Ошибка! Пользователь "${firstName} ${lastName} <${username}> (${chatId})" отправил(-а) сообщение "${command}" и получилась ошибка "${err.message}"`
      )
    }
  })
}

start()

bot.launch()

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))

function splitMessage(msg) {
  const msgArr = msg.split(" ")
  let data = msgArr[0]
  let text = msgArr.slice(1).join(" ")

  return [data, text]
}

*/



