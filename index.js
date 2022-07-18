const TelegramApi = require('node-telegram-bot-api')
const {
    changingUserData,
    enteringToUrfuProfile,
    moneyYearData,
    moneyMonthData,
    enteringToMoneyUrfuProfile, availableMoneyMonthData, remindAboutIterations, stopRemindAboutIterations
} = require('./options')
const spawner = require('child_process').spawn
const schedule = require('node-schedule')


const token = '5444323708:AAFCwNW_LXMHek_iwAHjoeRdBlsNELsOb0s'

const bot = new TelegramApi(token, {polling: true})

//имитация базы данных
let userData = {
    password: {},
    login: {},
    enterStatus: {},
    moneyYear: {},
    moneyMonth: {},
    enterMoneyStatus: {},
    iterations: {},
    isReminding: {},
    addIteration: {}
}


//имитация новых итераций
const addIteration = (chatId, msgChat) => {
    userData.addIteration[chatId] = true
    bot.sendMessage(chatId, `${msgChat.first_name}, добавлена новая итерация!!!`).catch()
}

//запись логина
const setLogin = (chatId, msgChat) => {
    if (!userData.login[chatId]) {
        bot.sendMessage(chatId, `${msgChat.first_name}, введите логин от личного кабинета УрФУ через reply  этого сообщения`)
            .then(addApiId => {
                bot.onReplyToMessage(addApiId.chat.id, addApiId.message_id, msg => {
                    console.log(msg)
                    userData.login[chatId] = msg.text
                    bot.sendMessage(chatId, `Получилось! ${userData.login[chatId]} - ваш логин`).catch()
                    return isDataEnterd(chatId, msgChat)
                })
            })

    } else {
        return bot.sendMessage(chatId, `${msgChat.first_name}, вы уже ввели данные - \n ${userData.login[chatId]} - логин,\n желаете заменить его?`, changingUserData)
    }
}

//запись пароля
const setPassword = async (chatId, msgChat) => {
    if (!userData.password[chatId]) {
        await bot.sendMessage(chatId, `${msgChat.first_name}, введите пароль от личного кабинета УрФУ через reply  этого сообщения`)
            .then(addApiId => {
                bot.onReplyToMessage(addApiId.chat.id, addApiId.message_id, async msg => {
                    console.log(msg)
                    userData.password[chatId] = msg.text
                    await bot.sendMessage(chatId, `Получилось! ${userData.password[chatId]} - ваш пароль`).catch()
                    return isDataEnterd(chatId, msgChat)
                })
            })
    } else {
        return bot.sendMessage(chatId, `${msgChat.first_name}, вы уже ввели данные - \n ${userData.password[chatId]} - пароль,\n желаете заменить его?`, changingUserData)
    }
}

const setUserData = async (chatId, msgChat) => {
    if (!userData.login[chatId] && !userData.password[chatId]) {
        await setLogin(chatId, msgChat)
        await setPassword(chatId, msgChat)
    } else {
        bot.sendMessage(chatId, `${msgChat.first_name}, вы уже ввели данные - \n ${userData.login[chatId]} - логин, \n${userData.password[chatId]} - пароль, \n желаете заменить их?`, changingUserData).catch()
    }
}

//берем html разметку с личного кабинета урфу
const getHtmlData = (chatId, msgChat) => {
    const data_to_pass_in = {
        data_sent: chatId,
        login: userData.login[chatId],
        password: userData.password[chatId],
        data_returned: undefined,
        enterStatus: undefined,
    }
    if (userData.login[chatId] && userData.password[chatId]) {
        console.log('Данные, которые мы отправили с js', data_to_pass_in)
        const python_process = spawner('python', ['./getUserProfile.py', JSON.stringify(data_to_pass_in)])
        python_process.stdout.on('data', async (data) => {
            console.log('Данные, которые мы получили от getUserProfile: ', JSON.parse(data.toString()))
            userData.enterStatus[chatId] = JSON.parse(data.toString()).enterStatus
            await bot.sendMessage(chatId, `${msgChat.first_name}! ${JSON.parse(data.toString()).data_returned}`).catch()
            return bot.sendMessage(chatId, `Что дальше? \nВведи /iterations,\nчтобы посмотреть когда ставить оценки в TeamProject\nВведи /money,\nчтобы посмотреть доход от стипендии или зарплаты`).catch()

        })
    } else {
        bot.sendMessage(chatId, `${msgChat.first_name}! Вы еще не вошли в личный кабинет!`).then(
        )
        setUserData(chatId, msgChat)
    }
}

//проверка введенного логина и пароля
const isDataEnterd = (chatId, msgChat) => {
    if (userData.login[chatId] && userData.password[chatId]) {
        bot.sendMessage(chatId, ` ${msgChat.first_name}! Вы ввели данные от личного кабинета УрФУ. \n Проверим данные?`, enteringToUrfuProfile).catch()
    }
}

//отправка сообщения с введенными данными
const getUserData = async (chatId, msgChat) => {
    if (userData.login[chatId] && userData.password[chatId] && userData.enterStatus[chatId]) {
        bot.sendMessage(chatId, `${msgChat.first_name}, ваш логин и пароль от личного кабинета УрФУ -  \n${userData.login[chatId]} - логин \n${userData.password[chatId]} - пароль\n${userData.enterStatus[chatId]} - статус аутефикации`)
            .catch()
    }
    if (!userData.login[chatId] && !userData.password[chatId]) {
        await bot.sendMessage(chatId, `${msgChat.first_name}, вы еще не ввели логин и пароль!`).catch(

        )
        return setUserData(chatId, msgChat)
    }
}

//преобразование итераций в читаемый вид
const getReadableIterations = async (chatId, msgChat, data_returned, callFromLoop, new_iterations) => {
    if (userData.addIteration[chatId]) {
        data_returned = new_iterations
    }
    console.log(Object.keys(data_returned))

    let stringLine = "\n----------------------------------------------------------------"
    let projectName = Object.keys(data_returned)
    let iterations = Object.keys(data_returned[projectName])
    let size = Object.keys(data_returned[projectName]).length
    let iterationKeys = Object.keys(data_returned[projectName][iterations[0]])


    let newIterations = ""
    let newIterationLength = 0
    let readableData = ""
    let doesntMark = ""
    readableData = projectName

    for (let i = 0; i < size; i += 1) {
        let iterationStart = data_returned[projectName][iterations[i]][iterationKeys[0]]
        let iterationEnd = data_returned[projectName][iterations[i]][iterationKeys[1]]
        let outputMarkup = data_returned[projectName][iterations[i]][iterationKeys[3]]
        let allStudents = data_returned[projectName][iterations[i]][iterationKeys[5]]
        let inputMarkup = data_returned[projectName][iterations[i]][iterationKeys[4]]
        //
        if (userData.iterations[chatId]) {
            if ((iterations[i]).includes((Object.keys(userData.iterations[chatId][projectName]))[i])) {
                console.log('(Object.keys(userData.iterations[chatId][projectName]))[i]', (Object.keys(userData.iterations[chatId][projectName]))[i].includes(iterations[i]), iterations[i])
                readableData = readableData
                    + stringLine + '\n'
                    + iterations[i] + '\n\n'
                    + iterationStart + " - начало итерации\n"
                    + iterationEnd + " - конец итерации\n"
            } else {
                readableData = readableData
                    + stringLine + '\n'
                    + iterations[i] + ' - новая итерация\n\n'
                    + iterationStart + " - начало итерации\n"
                    + iterationEnd + " - конец итерации\n\n"
                    + "вы оценили " + outputMarkup + " человек из " + allStudents + "\n"
                    + "вас оценили " + inputMarkup + " человек из " + allStudents + "\n"

                newIterations = newIterations + iterations[i] + '\n'
                newIterationLength += 1
            }
        } else {
            readableData = readableData
                + stringLine + '\n'
                + iterations[i] + ' - новая итерация\n\n'
                + iterationStart + " - начало итерации\n"
                + iterationEnd + " - конец итерации\n\n"
                + "вы оценили " + outputMarkup + " человек из " + allStudents + "\n"
                + "вас оценили " + inputMarkup + " человек из " + allStudents + "\n"

            newIterations = newIterations + iterations[i] + '\n'
            newIterationLength += 1
        }
        if (outputMarkup !== inputMarkup) {
            doesntMark = doesntMark
                + stringLine + '\n'
                + iterations[i] + ' - итерация не оценена\n\n'
                + iterationStart + " - начало итерации\n"
                + iterationEnd + " - конец итерации\n\n"
                + "вы оценили " + outputMarkup + " человек из " + allStudents + "\n"
                + "вас оценили " + inputMarkup + " человек из " + allStudents + "\n"
        }

    }
    if (newIterations) {

        if (newIterationLength === 1) {
            console.log('newIterationLength 1', newIterationLength)
            await bot.sendMessage(chatId,
                `Добавлена одна новая итерация!${stringLine}\n${newIterations}`).catch()
        }

        if (newIterationLength === 2 || newIterationLength === 3 || newIterationLength === 4) {
            console.log('newIterationLength 2  3 4', newIterationLength)
            await bot.sendMessage(chatId,
                `Добавлено ${newIterationLength} новых итерации!${stringLine}\n${newIterations}`).catch()
        }

        if (newIterationLength > 4) {
            await bot.sendMessage(chatId,
                `Добавлено ${newIterationLength} новых итераций!${stringLine}\n${newIterations}`).catch()
        }
    }


    if (!callFromLoop) {
        await bot.sendMessage(chatId, readableData).catch()
        if (doesntMark) {
            await bot.sendMessage(chatId, doesntMark).catch()
        }
        if (!userData.isReminding[chatId]) {
            await bot.sendMessage(chatId, `Напоминать о предстоящих итерациях?`, remindAboutIterations).catch()
        }
        userData.iterations[chatId] = data_returned

    } else {
        if (newIterations) {
            await bot.sendMessage(chatId, readableData, stopRemindAboutIterations).catch()
        }
        if (doesntMark) {
            await bot.sendMessage(chatId, doesntMark, stopRemindAboutIterations).catch()
        }
        if (!doesntMark) {
            await bot.sendMessage(chatId, `Нет обновлений`, stopRemindAboutIterations).catch()
        }
        userData.iterations[chatId] = data_returned
    }

}
//преобразование разметки с доходами в читаемый вид
const getReadableMoneyAndMonthes = async (chatId, msgChat, data_returned) => {
    let years = Object.keys(data_returned)
    let str = ''
    for (let i = 0; i < years.length; i += 1) {
        await bot.sendMessage(chatId, `Доступные месяца ${years[i]} года:
         `).then()
        for (let j = 0; j < data_returned[years[i]].length; j += 1) {
            str = str + ' ' + data_returned[years[i]][j]
        }
        await bot.sendMessage(chatId, `\n${str}
         `,).then()
        str = ''
    }

}

const getAvailableMonthesMoney = (chatId, msgChat) => {


    const data_to_pass_in = {
        data_sent: chatId,
        login: userData.login[chatId],
        password: userData.password[chatId],
        data_returned: undefined,
        enterMoneyStatus: undefined,
    }


    console.log('Данные, которые мы отправили с js', data_to_pass_in)
    const python_process = spawner('python', ['./getAvailableMonthes.py', JSON.stringify(data_to_pass_in)])
    python_process.stdout.on('data', (data) => {
        console.log('Данные, которые мы получили от getAvailableMonthes: ', JSON.parse(data.toString()))
        if (JSON.parse(data.toString()).enterMoneyStatus) {
            getReadableMoneyAndMonthes(chatId, msgChat, JSON.parse(data.toString()).data_returned)
        } else {
            return bot.sendMessage(chatId, `${msgChat.first_name}! ${JSON.parse(data.toString()).data_returned}`
            )
        }
    })
}

const getUserIterations = (chatId, msgChat, callFromLoop = false) => {
    const data_to_pass_in = {
        data_sent: chatId,
        login: 'Simeon02908@gmail.com',
        password: 'bw89bAzt',
        data_returned: undefined,
        new_iterations: undefined,
        enterMoneyStatus: undefined,
    }

    //console.log('Данные, которые мы отправили с js', data_to_pass_in)
    const python_process = spawner('python', ['./getUserIterations.py', JSON.stringify(data_to_pass_in)])
    python_process.stdout.on('data', (data) => {

        console.log('Данные, которые мы получили от питона3: ', JSON.parse(data.toString()))
        if (JSON.parse(data.toString()).enterMoneyStatus) {
            //if (!userData.isReminding[chatId]){
            console.log('Вызов из итераций')
            return getReadableIterations(chatId, msgChat, JSON.parse(data.toString()).data_returned, callFromLoop, JSON.parse(data.toString()).new_iterations)
            //}else{
            //
            // return remindMeAboutIterations(chatId, msgChat, JSON.parse(data.toString()).data_returned)
            //}
        } else {
            return bot.sendMessage(chatId,
                `${msgChat.first_name}! Не получилось войти в TeamProject!`
            )
        }
    })

}
const getMoney = (chatId, msgChat) => {
    const months = {
        "январь": '1',
        'февраль': '2',
        'март': '3',
        'апрель': '4',
        'май': '5',
        'июнь': '6',
        'июль': '7',
        'август': '8',
        'сентябрь': '9',
        'октябрь': '10',
        'ноябрь': '11',
        'декабрь': '12'
    }


    const data_to_pass_in = {
        data_sent: chatId,
        login: userData.login[chatId],
        password: userData.password[chatId],
        year: userData.moneyYear[chatId],
        month: months[userData.moneyMonth[chatId]],
        data_returned: undefined,
    }

    console.log('Данные, которые мы отправили с js', data_to_pass_in)
    const python_process = spawner('python', ['./getMoney.py', JSON.stringify(data_to_pass_in)])
    python_process.stdout.on('data', (data) => {

        console.log('Данные, которые мы получили от питона4: ', JSON.parse(data.toString()))
        if (JSON.parse(data.toString()).enterMoneyStatus) {
            console.log('Данные, которые мы получили от питона4: ', JSON.parse(data.toString()))
            bot.sendMessage(chatId,
                `${JSON.parse(data.toString()).data_returned}`, availableMoneyMonthData
            )
        } else {
            return bot.sendMessage(chatId,
                `${msgChat.first_name}! ${JSON.parse(data.toString()).data_returned}`
            )
        }
    })

}


//метод с таймером для напоминания об итерациях
const remindMeAboutIterations = async (chatId, msgChat) => {
    let projectName = Object.keys(userData.iterations[chatId])
    let iterations = Object.keys(userData.iterations[chatId][projectName])

    function sendTime(time, chatId) {
        new schedule.scheduleJob({
            start: new Date(Date.now() + Number(time) * 1000 * 60),
            end: new Date(new Date(Date.now() + Number(time) * 1000 * 60 + 1000)),
            rule: '*/1 * * * * *'
            //rule: '1 1 0 * * *' - 1 минута 1 секунда 00:00 часов
        }, async function () {
            if (userData.isReminding[chatId] === true) {
                console.log('Вызов из RemindMe')
                /*for (let i = 0; i < iterations.length; i += 1) {
                    let dateStart = Date.parse(userData.iterations[chatId][projectName][iterations[i]]['Начало итерации'])
                    let dateEnd = Date.parse(userData.iterations[chatId][projectName][iterations[i]]['Конец итерации'])
                    //let dateNow = Date.parse(new Date())
                    let dateNow = Date.parse("2022-06-08")
                    console.log(userData.iterations[chatId][projectName][iterations[i]])
                    console.log([iterations[i]])
                    //new Date()
                    if (dateNow < dateStart) {
                        console.log('Итерация еще не началась')
                        await bot.sendMessage(chatId,
                            `Итерация - ${[iterations[i]]} - еще не началась!`
                        ).catch()
                    }
                    if (dateNow > dateEnd) {
                        console.log('Итерация закончилась')
                        await bot.sendMessage(chatId,
                            `Итерация - ${[iterations[i]]} - уже закрыта!`
                        ).catch()
                    }
                    //((dateNow > dateStart) && (dateEnd < dateNow))
                    else {
                        await bot.sendMessage(chatId,
                            `Итерация - ${[iterations[i]]} - открыта! Самое время поставить оценки!`
                        ).catch()
                    }
                }*/
                /* await bot.sendMessage(chatId,
                     `Остановить напоминания?`, stopRemindAboutIterations
                 ).catch()*/
//вызывается один раз в 5 МИНУТ
                let callFromLoop = true
                getUserIterations(chatId, msgChat, callFromLoop)
                return sendTime(0.3, chatId)
            }
            console.log('return')
        })
    }

    sendTime(0.05, chatId)
}

bot.setMyCommands([
    {command: '/start', description: 'Начальное приветствие',},
    {command: '/data', description: 'Ввести свои данные'},
    {command: '/mydata', description: 'Мои данные'},
    {command: '/money', description: 'Мои доходы'},
    {command: '/iterations', description: 'Итерации TeamProject'},
    {command: '/additeration', description: 'Добавить итерацию'}
]).catch()

bot.on('message', async msg => {
    const chatId = msg.chat.id
    let text = msg.text
    switch (text) {
        case '/start':
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/1.webp')
            return bot.sendMessage(chatId,
                `Добро пожаловать, ${msg.chat.first_name}! Я буду напоминать тебе об итерациях оценок в TeamProject! \nНачнем работать? Введи "/data", чтобы я сохранил твои данные`
            )
        case  '/data':
            return setUserData(chatId, msg.chat)

        case  '/getuseraccount':
            return getHtmlData(chatId, msg.chat)

        case  '/mydata':
            return getUserData(chatId, msg.chat)
        case  '/money':
            return bot.sendMessage(chatId, `Выберете год:`, moneyYearData)
        case '/iterations':
            return getUserIterations(chatId, msg.chat)
        case '/additeration':
            return addIteration(chatId, msg.chat)
    }
})
bot.on('callback_query', msg => {
    const data = msg.data
    const chatId = msg.message.chat.id

    switch (data) {
        case '/changeLogin':

            bot.sendMessage(chatId,
                `Обнуляю старый логин...`
            ).catch()
            userData.login[chatId] = undefined
            return setLogin(chatId, msg.message.chat)

        case '/changePassword':
            bot.sendMessage(chatId,
                `Обнуляю старый пароль...`
            ).catch()
            userData.password[chatId] = undefined
            return setPassword(chatId, msg.message.chat)

        case  '/changeLoginAndPassword':

            bot.sendMessage(chatId,
                `Обнуляю старый пароль и логин...`
            ).catch()
            userData.password[chatId] = undefined
            userData.login[chatId] = undefined

            return (setPassword(chatId, msg.message.chat), setLogin(chatId, msg.message.chat))


        case '/back':
            return bot.sendMessage(chatId,
                `Как скажешь...`
            )

        case  '/getUserName':
            return getHtmlData(chatId, msg.message.chat)

        case  '/getUserMoney':
            return getMoney(chatId, msg.message.chat)

        case  '/remindAboutIterations':
            userData.isReminding[chatId] = true
            console.log(userData.iterations[chatId], userData.isReminding[chatId])
            bot.sendMessage(chatId,
                `Хорошо!`
            ).catch()
            return remindMeAboutIterations(chatId, msg.message.chat)

        case  '/stopRemindAboutIterations':
            userData.isReminding[chatId] = false
            console.log(userData.iterations[chatId], userData.isReminding[chatId])
            return bot.sendMessage(chatId,
                `Как скажешь...`
            )

        case  '/getAvailableMonthes':
            return getAvailableMonthesMoney(chatId, msg.message.chat)
        case  '/2020':
            userData.moneyYear[chatId] = 2020
            return bot.sendMessage(chatId,
                `Выбранный год - ${userData.moneyYear[chatId]}, выберете месяц.`
                , moneyMonthData)

        case  '/2021':
            userData.moneyYear[chatId] = 2021

            return bot.sendMessage(chatId,
                `Выбранный год - ${userData.moneyYear[chatId]}, выберете месяц.`
                , moneyMonthData)

        case  '/2022':
            userData.moneyYear[chatId] = 2022
            return bot.sendMessage(chatId,
                `Выбранный год - ${userData.moneyYear[chatId]}, выберете месяц.`
                , moneyMonthData)

        case  '/january':
            userData.moneyMonth[chatId] = 'январь'
            return bot.sendMessage(chatId,
                `Выбранный период -\n${userData.moneyMonth[chatId]} ${userData.moneyYear[chatId]}`
                , enteringToMoneyUrfuProfile)

        case '/february':
            userData.moneyMonth[chatId] = 'февраль'
            return bot.sendMessage(chatId,
                `Выбранный период -\n${userData.moneyMonth[chatId]} ${userData.moneyYear[chatId]}`
                , enteringToMoneyUrfuProfile)

        case  '/march':
            userData.moneyMonth[chatId] = 'март'
            return bot.sendMessage(chatId,
                `Выбранный период -\n${userData.moneyMonth[chatId]} ${userData.moneyYear[chatId]}`
                , enteringToMoneyUrfuProfile)

        case  '/april':
            userData.moneyMonth[chatId] = 'апрель'
            return bot.sendMessage(chatId,
                `Выбранный период -\n${userData.moneyMonth[chatId]} ${userData.moneyYear[chatId]}`
                , enteringToMoneyUrfuProfile)

        case  '/may':
            userData.moneyMonth[chatId] = 'май'
            return bot.sendMessage(chatId,
                `Выбранный период -\n${userData.moneyMonth[chatId]} ${userData.moneyYear[chatId]}`
                , enteringToMoneyUrfuProfile)

        case  '/june':
            userData.moneyMonth[chatId] = 'июнь'
            return bot.sendMessage(chatId,
                `Выбранный период -\n${userData.moneyMonth[chatId]} ${userData.moneyYear[chatId]}`
                , enteringToMoneyUrfuProfile)

        case  '/july':
            userData.moneyMonth[chatId] = 'июль'
            return bot.sendMessage(chatId,
                `Выбранный период -\n${userData.moneyMonth[chatId]} ${userData.moneyYear[chatId]}`
                , enteringToMoneyUrfuProfile)

        case  '/august':
            userData.moneyMonth[chatId] = 'август'
            return bot.sendMessage(chatId,
                `Выбранный период -\n${userData.moneyMonth[chatId]} ${userData.moneyYear[chatId]}`
                , enteringToMoneyUrfuProfile)

        case  '/september':
            userData.moneyMonth[chatId] = 'сентябрь'
            return bot.sendMessage(chatId,
                `Выбранный период -\n${userData.moneyMonth[chatId]} ${userData.moneyYear[chatId]}`
                , enteringToMoneyUrfuProfile)

        case  '/october':
            userData.moneyMonth[chatId] = 'октябрь'
            return bot.sendMessage(chatId,
                `Выбранный период -\n${userData.moneyMonth[chatId]} ${userData.moneyYear[chatId]}`
                , enteringToMoneyUrfuProfile)

        case  '/november':
            userData.moneyMonth[chatId] = 'ноябрь'
            return bot.sendMessage(chatId,
                `Выбранный период -\n${userData.moneyMonth[chatId]} ${userData.moneyYear[chatId]}`
                , enteringToMoneyUrfuProfile)

        case  '/december':
            userData.moneyMonth[chatId] = 'декабрь'
            return bot.sendMessage(chatId,
                `Выбранный период -\n${userData.moneyMonth[chatId]} ${userData.moneyYear[chatId]}`
                , enteringToMoneyUrfuProfile)

    }
})




