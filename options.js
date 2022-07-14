module.exports = {


    changingUserData: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Изменить логин и пароль', callback_data: '/changeLoginAndPassword'}],
                [{text: 'Изменить пароль', callback_data: '/changePassword'}],
                [{text: 'Изменить логин', callback_data: '/changeLogin'}],
                [{text: 'Нет, не меняй мои данные', callback_data: '/back'}]

            ]
        })
    },

    enteringToUrfuProfile: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Да! Зайди в личный кабинет!', callback_data: '/getUserName'}],
                [{text: 'Нет! Потом этим займусь', callback_data: '/back'}],
            ]
        })
    },

    enteringToMoneyUrfuProfile: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Покажи мои доходы!', callback_data: '/getUserMoney'}]
            ]
        })
    },

    moneyYearData: {
        reply_markup: JSON.stringify({
            inline_keyboard: [

                [{text: '2020', callback_data: '/2020'}, {text: '2021', callback_data: '/2021'}, {
                    text: '2022', callback_data: '/2022'
                }]
            ]
        })
    },

    moneyMonthData: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'январь', callback_data: '/january'}, {text: 'февраль', callback_data: '/february'}],
                [{text: 'март', callback_data: '/march'}, {text: 'апрель', callback_data: '/april'}],
                [{text: 'май', callback_data: '/may'}, {text: 'июнь', callback_data: '/june'}],
                [{text: 'июль', callback_data: '/july'}, {text: 'август', callback_data: '/august'}],
                [{text: 'сентябрь', callback_data: '/september'}, {text: 'октябрь', callback_data: '/october'}],
                [{text: 'ноябрь', callback_data: '/november'}, {text: 'декабрь', callback_data: '/december'}]
            ]
        })
    },

    availableMoneyMonthData: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Показать месяца, когда приходил доход', callback_data: '/getAvailableMonthes'}]
            ]
        })
    },

    remindAboutIterations: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Напоминай мне о предстоящих итерациях!', callback_data: '/remindAboutIterations'}]
            ]
        })
    },

    stopRemindAboutIterations: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Больше не напоминай!', callback_data: '/stopRemindAboutIterations'}]
            ]
        })
    }


}
