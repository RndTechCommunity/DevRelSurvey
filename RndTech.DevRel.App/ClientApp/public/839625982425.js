Survey.StylesManager.applyTheme("modern");

const surveyJSON = {
    "locale": "ru",
    "title": "Узнаваемость и привлекательность IT-компаний в Ростовской области 2020",
    "completedHtml": {
        "ru": "<h3>Супер!</h3>\n<div><a href=\"https://devrel.rndtech.pro\">К результатам 2019 года</a></div>\n  <div><a href=\"https://habr.com/ru/post/483110/\">Хабр. \"Ростов-на-Дону: IT-компании, сообщества и мероприятия в 2019 году\"</a></div>\n  <div><a href=\"https://t.me/RndTechChat\">Чат сообщества в Телеграм</a></div>\n  <div><a href=\"https://vk.com/rndtech\">Сообщество в ВК</a></div>\n  <div><a href=\"https://www.instagram.com/rndtechpro/\">Сообщество в Instagram</a></div>"
    },
    "pages": [
        {
            "name": "WelcomePage",
            "elements": [
                {
                    "type": "html",
                    "name": "WelcomeBlock",
                    "html": {
                        "ru": "Привет! <br />\n<p>Мы в IT-сообществе RndTech делаем ежегодное исследование узнаваемости и привлекательности IT-компаний в Ростовской области. В прошлом году анкету заполнили больше 700 раз, мы выложили обезличенные данные в открытый доступ, а ещё сделали большую <a href=\"https://habr.com/ru/post/483110/\">статью на Хабре</a>.</p>\n\n<p>Нам <b>нужна ваша помощь</b> чтобы собрать данные за 2020 год — узнать, что изменилось, какие компании улучшили свою репутацию и где захотят работать разработчики в 2021. Это анкета от сообщества, про сообщество и для сообщества. Обезличенные результаты расскажем в наших группах, на Хабре и на сайте.</p> \n\n<p>Вот что мы обещаем:\n<ol>\n <li>В опросе можно не указывать ваши личные данные, но даже если укажете, мы никогда не передадим их никаким компаниям и даже не будем хранить их вместе с ответами. То есть, даже если вы получили эту ссылку в корпоративном чате, то у работодателя нет доступа к данным, а у нас нет возможности сопоставить ответы и данные отвечающих.</li>\n <li>Не публикуем в открытом доступе ваши личные данные ни сейчас, ни в дальнейшем.</li>\n <li>Разыграем среди заполнивших анкету аж 50 крутых футболок RndTech! Примерно таких:  <br /> \n<a href=\"https://habrastorage.org/webt/4d/vm/r4/4dvmr4hheddycgxngjmngdr45h4.png\"><img src=\"https://habrastorage.org/webt/4d/vm/r4/4dvmr4hheddycgxngjmngdr45h4.png\" width=\"300\" /></a>\n<a href=\"https://habrastorage.org/webt/7j/vn/nq/7jvnnqqmxcvazc2lkyoya0ybsrs.png\"><img src=\"https://habrastorage.org/webt/7j/vn/nq/7jvnnqqmxcvazc2lkyoya0ybsrs.png\" width=\"300\" /></a>\n<a href=\"https://habrastorage.org/webt/en/tk/hp/entkhp4bg0j8d3rve7c4yd_ezoo.png\"><img src=\"https://habrastorage.org/webt/en/tk/hp/entkhp4bg0j8d3rve7c4yd_ezoo.png\" width=\"300\" /></a> <br />\nПо 5 штук каждую неделю опроса до конца года и ещё 10 на новогодних праздниках. А ещё лицензии на продукты JetBrains и билеты на RndTechConf 2021.</li>\n <li>После заполнения анкеты перенаправим вас на сайт с данными за 2019 год, где можно будет посмотреть крутые графики и пофильтровать данные по городу, языку программирования, профессии, квалификации. Например, посмотреть, где хотят работать рубисты и какие компании популярнее всего у студентов Таганрога. <br /> <img src=\"https://habrastorage.org/webt/6y/-p/ri/6y-priid8spu4iz_f2o0k7zm5bw.png\" align=\"center\" width=\"500\" /></li>\n <li>Пришлём абсолютно всем заполнившим приятный подарок на новый год ;)</li>\n</ol>\n</p>\n<p>Внимательное заполнение с обдумыванием ответов займёт 10-12 минут.</p> \n"
                    }
                }
            ]
        },
        {
            "name": "SocialParameters",
            "elements": [
                {
                    "type": "text",
                    "name": "CityQuestion",
                    "title": {
                        "ru": "В каком городе работаете/учитесь?"
                    },
                    "description": {
                        "ru": "Ростов? Таганрог? А, может, вы переехали? Хотим сравнить, как видят IT-компании в разных городах.\n\n"
                    },
                    "isRequired": true,
                    "requiredErrorText": {
                        "ru": "Это один из самых важных вопросов, не пропускайте его :("
                    },
                    "maxLength": 100,
                    "placeHolder": {
                        "ru": "Название города на русском"
                    },
                    "choices": [
                        "Ростов-на-Дону",
                        "Таганрог",
                        "Москва",
                        "Новочеркасск",
                        "Волгодонск",
                        "Санкт-Петербург",
                        "Краснодар",
                        "Тюмень",
                        "Амстердам",
                        "Ейск",
                        "Нью-Йорк",
                        "Шахты",
                        "Цюрих",
                        "Париж",
                        "Франфурт",
                        "Рига",
                        "Моздок",
                        "Ставрополь",
                        "Ульяновск",
                        "Жлобин",
                        "Батайск",
                        "Новороссийск",
                        "Курск",
                        "Рязань",
                        "Ижевск",
                        "Екатеринбург",
                        "Хабаровск",
                        "Пермь",
                        "Казань",
                        "Иннополис",
                        "Иваново",
                        "Новосибирск",
                        "Нижний Новгород",
                        "Челябинск",
                        "Самара",
                        "Омск",
                        "Уфа",
                        "Красноярск",
                        "Воронеж",
                        "Волгоград",
                        "Саратов",
                        "Тольятти",
                        "Барнаул",
                        "Иркутск"
                    ]
                },
                {
                    "type": "text",
                    "name": "AgeQuestion",
                    "title": {
                        "ru": "Сколько вам лет?"
                    },
                    "isRequired": true,
                    "inputType": "number",
                    "min": "10",
                    "max": "80",
                    "step": 1,
                    "placeHolder": {
                        "ru": "Возраст"
                    }
                },
                {
                    "type": "radiogroup",
                    "name": "EducationQuestion",
                    "title": {
                        "ru": "Какое у вас образование?"
                    },
                    "isRequired": true,
                    "choices": [
                        "Высшее",
                        "Высшее, в процессе получения",
                        "Среднее специальное",
                        "Среднее"
                    ]
                },
                {
                    "type": "dropdown",
                    "name": "ProfessionQuestion",
                    "title": {
                        "ru": "Какой ваш основной род деятельности?"
                    },
                    "description": {
                        "ru": "Если несколько, то основной или текущий актуальный"
                    },
                    "isRequired": true,
                    "commentText": {
                        "ru": "что"
                    },
                    "choices": [
                        "Backend-разработчик",
                        "Frontend-разработчик",
                        "Fullstack-разработчик",
                        "Мобильный разработчик",
                        "Desktop разработчик",
                        "Gamedev разработчик",
                        "Hardware-разработчик",
                        "Teamlead/Teachlead",
                        "QA",
                        "Системный/бизнес аналатик",
                        "Аналитик данных / Data scientist",
                        "Дизайн UX/UI",
                        "Project manager",
                        "Product manager",
                        "DevOps/SRE-инженер",
                        "CTO",
                        "Техническая поддержка",
                        "Системный администратор",
                        "Agile / scrum master",
                        "HR",
                        "Студент (но лучше выберите кем собираетесь быть)",
                        "Другое"
                    ]
                },
                {
                    "type": "checkbox",
                    "name": "TechnologiesQuestion",
                    "visibleIf": "{ProfessionQuestion} = 'Backend-разработчик' or {ProfessionQuestion} = 'Teamlead/Teachlead' or {ProfessionQuestion} = 'Frontend-разработчик' or {ProfessionQuestion} = 'Fullstack-разработчик' or {ProfessionQuestion} = 'Мобильный разработчик' or {ProfessionQuestion} = 'Desktop разработчик' or {ProfessionQuestion} = 'Gamedev разработчик' or {ProfessionQuestion} = 'Hardware-разработчик'",
                    "title": {
                        "ru": "На каком языке или языках вы пишете код на работе?"
                    },
                    "description": {
                        "ru": "Если не работаете, но уже выбрали специализацию, напишите. Если не выбрали, то выбирайте те языки, которые знаете лучше всего."
                    },
                    "isRequired": true,
                    "choices": [
                        "1С",
                        "Assembler",
                        "C / C++",
                        "C#",
                        "Elixir",
                        "Elm",
                        "Erlang",
                        "F#",
                        "Go",
                        "Groovy",
                        "Haskell",
                        "Java",
                        "JavaScript",
                        "Kotlin",
                        "Lua",
                        "Objective-C",
                        "Perl",
                        "PHP",
                        "Python",
                        "R",
                        "Ruby",
                        "Rust",
                        "SAP",
                        "Scala",
                        "SQL",
                        "Swift",
                        "TypeScript",
                        "VBA",
                        "Другой"
                    ],
                    "colCount": 3
                },
                {
                    "type": "radiogroup",
                    "name": "ProfessionLevelQuestion",
                    "title": {
                        "ru": "Как лучше всего охарактеризовать ваш опыт в этой профессии?"
                    },
                    "isRequired": true,
                    "choices": [
                        "Junior/начинающий",
                        "Middle/опытный",
                        "Senior/гуру"
                    ]
                }
            ],
            "title": {
                "ru": "Вначале немного о вас. "
            },
            "description": {
                "ru": "Эти данные понадобятся, чтобы можно было делать аналитику по разным срезам данных, например, разницу в узнаваемости у специалистов с разным опытом в IT."
            }
        },
        {
            "name": "CommunityParameters",
            "elements": [
                {
                    "type": "boolean",
                    "name": "MeetupsQuestion",
                    "title": {
                        "ru": "Ходите на митапы или встречи IT-сообщества?"
                    },
                    "description": {
                        "ru": "Когда они разрешены :)"
                    },
                    "isRequired": true,
                    "labelTrue": {
                        "ru": "Да"
                    },
                    "labelFalse": {
                        "ru": "Нет"
                    }
                },
                {
                    "type": "checkbox",
                    "name": "MeetupsSourceQuestion",
                    "visibleIf": "{MeetupsQuestion} = true",
                    "title": {
                        "ru": "А из каких источников узнаёте о мероприятиях?"
                    },
                    "description": {
                        "ru": "Хотим, чтобы больше людей узнавало про встречи ИТ-сообщества, поэтому ищем, какие каналы стоит развивать"
                    },
                    "isRequired": true,
                    "choices": [
                        "От друзей / коллег",
                        "Анонсы на meetup.com",
                        "Анонсы в телеграм-канал @rndtechevents или чат @RndTechChat",
                        "Анонсы в чатах профильных сообществ и других телеграм-чатах",
                        "Гуглокалендарь ИТ-событий Ростовской области",
                        "Ростовская солянка",
                        "Из групп компаний/сообществ в ВК",
                        "Из групп компаний/сообществ в Instagram"
                    ],
                    "hasOther": true,
                    "otherPlaceHolder": {
                        "ru": "Расскажите!"
                    },
                    "otherText": {
                        "ru": "Другое"
                    }
                },
                {
                    "type": "checkbox",
                    "name": "CompaniesCriteriaQuestion",
                    "title": {
                        "ru": "Выберите наиболее важные для вас критерии при выборе работы"
                    },
                    "description": {
                        "ru": "От 3 до 5 пунктов"
                    },
                    "isRequired": true,
                    "validators": [
                        {
                            "type": "answercount",
                            "minCount": 3,
                            "maxCount": 5
                        }
                    ],
                    "choices": [
                        "Гибкий график",
                        "Соцпакет, наличие ДМС и компенсации занятий спортом",
                        "Известность компании, репутация",
                        "Профессиональное обучение и участие в конференциях",
                        "Уровень оплаты",
                        "Белая зарплата и соблюдение ТК",
                        "Интерес руководства Компании к мнению сотрудников",
                        "Ценность работы в компании для резюме",
                        "Вклад Компании в развитие сообщества",
                        "Комфортный красивый офис и оснащение рабочего места",
                        "Качество продуктов и услуг",
                        "Интересные корпоративные мероприятия",
                        "Возможность поработать зарубежом",
                        "Стабильность Компании",
                        "Темпы роста компании",
                        "Международный статус Компании",
                        "Хорошие отношения в коллективе",
                        "Масштаб и амбициозность проектов Компании",
                        "Гарантии сохранения Work-life balance, отсутствие переработок",
                        "Выстроенная система управления проектами",
                        "Участие Компании в государственных проектах",
                        "Инновационность проектов компании",
                        "Современный стек технологий",
                        "Возможности для профессионального роста",
                        "Творческая, свободная и открытая атмосфера",
                        "Экологичное отношение руководителя к сотрудникам"
                    ],
                    "choicesOrder": "random"
                },
                {
                    "type": "text",
                    "name": "CompaniesLeadersQuestion",
                    "title": {
                        "ru": "Напишите три лучшие ИТ-компании в Ростовской области на ваш взгляд"
                    },
                    "description": {
                        "ru": "По памяти. Не парьтесь о транслитерации или правильности написания, наш natural intelligence Вадим потом всё распарсит своими нежными руками :)"
                    },
                    "isRequired": true,
                    "maxLength": 5000,
                    "placeHolder": {
                        "ru": "Раз, два, три :)"
                    }
                }
            ],
            "title": {
                "ru": "Отлично, спасибо."
            },
            "description": {
                "ru": "Теперь давайте о сообществе и ценностях."
            }
        },
        {
            "name": "Companies",
            "elements": [
                {
                    "type": "html",
                    "name": "CompaniesLegendPanel",
                    "html": {
                        "ru": "<div>\n   При ответе на этот вопрос может возникнуть неоднозначность в выборе вариантов. Вот небольшая подсказка:\n</div>\n<div>\n<ul>\n<li><b>Знаю компанию</b> — отвечайте \"Да\", если слышали о компании, видели вакансии/соц.сети, знаете или встречали сотрудников компании. Знать процессы, технологии или проекты необязательно, это вопрос о том, какие компании попадают в ваше информационное поле.</li>\n<li><b>Готов советовать как хорошего работодателя</b> — если к вам обратится знакомый, который собирается менять работу и спрашивает вашего совета, то будете ли вы рекомендовать эту компанию как хорошее место для работы.</li>\n<li><b>Хочу работать</b> — в случае поиска работы будете ли вы целенаправленно смотреть вакансии в этой компании? Интересно ли вам было поработать в этой компании?</li>\n</ul>\nНа мобильных устройствах может возникать горизонтальный скролл, лучше разверните телефон горизонтально :(</div>"
                    }
                },
                {
                    "type": "matrixdropdown",
                    "name": "CompaniesQuestion",
                    "title": {
                        "ru": "Какие IT-компании вы знаете? Какие готовы рекомендовать знакомым как хорошего работодателя? Какие будете рассматривать в первую очередь в случае поиска работы?"
                    },
                    "description": {
                        "ru": "Мы не можем добавить вообще все компании, поэтому выбрали 100 самых крупных, известных и часто упоминаемых в опросе 2019 года компаний. \nВсе компании в алфавитном порядке.\nНа мобильном возможен горизонтальный скролл :("
                    },
                    "isRequired": true,
                    "columns": [
                        {
                            "name": "Знаю / слышал",
                            "cellType": "boolean",
                            "isRequired": true
                        },
                        {
                            "name": "Готов рекомендовать",
                            "cellType": "checkbox"
                        },
                        {
                            "name": "Хочу работать",
                            "cellType": "checkbox"
                        }
                    ],
                    "choices": [
                        "Да"
                    ],
                    "rows": [
                        "2UP",
                        "42.works",
                        "A2SEVEN",
                        "Accenture",
                        "Afterlogic",
                        "AppForge Inc",
                        "Apsis",
                        "Arcadia",
                        "Auriga",
                        "Cboss",
                        "ChilliCode",
                        "CloudLinux",
                        "Comepay (Кампэй)",
                        "Convermax",
                        "CVisionLab",
                        "DATUM Group",
                        "DBI",
                        "DDoS Guard",
                        "Devexperts",
                        "Digital Skynet",
                        "Distillery",
                        "DonRiver",
                        "Donteco",
                        "Dunice",
                        "Elonsoft",
                        "eSignal",
                        "Exceed Team",
                        "FastReport",
                        "Finastra",
                        "Firecode",
                        "Fusion",
                        "Game Insight",
                        "GameNuts",
                        "Grapheme (Графема)",
                        "GraphGrail",
                        "GrowApp Solutions",
                        "Hotger",
                        "HttpLab",
                        "InCountry",
                        "INOSTUDIO",
                        "Intellectika (Интеллектика)",
                        "INVO Group",
                        "IT-Delta",
                        "IT Premium",
                        "KPMG",
                        "LetMeCode",
                        "Leviossa IT",
                        "M-13",
                        "MentalStack",
                        "Motorsport",
                        "MultiCharts",
                        "Newizze",
                        "Nindeco",
                        "NSSoft",
                        "Oggetto",
                        "Orange Code",
                        "Panda digital",
                        "Playrix",
                        "ProgForce",
                        "Quirco (Квирко)",
                        "Rnd soft (+Winvestor)",
                        "Reksoft",
                        "Roonyx",
                        "Sebbia",
                        "SimpleCode",
                        "SoftGrad Solutions",
                        "Solar Games",
                        "Statzilla",
                        "Storytelling Software",
                        "Tele2",
                        "TerraLink",
                        "TradingView",
                        "uKit",
                        "Umbrella IT",
                        "Uniquite",
                        "Usetech",
                        "VIAcode",
                        "WebAnt",
                        "WebSailors",
                        "WIS Software",
                        "Work Solutions",
                        "Zuzex",
                        "Вебпрактик",
                        "Веброст",
                        "Вебстрой",
                        "Везёт Всем",
                        "ВинтаСофт",
                        "ГЛОНАССсофт",
                        "Глория Джинс",
                        "Гэндальф",
                        "«Иммельман» — бюро интернет-проектов",
                        "Интернет-Фрегат",
                        "Киноплан",
                        "Контур",
                        "Лайт Мэп",
                        "Мегафон",
                        "Орбитсофт",
                        "Первый Бит",
                        "Программные технологии (СофТех)",
                        "ПрофИТ",
                        "РаДон",
                        "Сбер",
                        "Спецвуз-автоматика",
                        "Студия Олега Чулакова",
                        "Тинькофф",
                        "ЦентрИнвест",
                        "Югпром-автоматизация",
                        "Южная софтверная компания (ЮСК)"
                    ]
                }
            ],
            "title": {
                "ru": "Узнаваемость и привлекательность IT-компаний в городе"
            },
            "description": {
                "ru": "Это главный вопрос, ради которого мы здесь собрались :) Пожалуйста, уделите ему внимание."
            }
        },
        {
            "name": "EmailPage",
            "elements": [
                {
                    "type": "html",
                    "name": "EmailBlock",
                    "html": {
                        "ru": "<p>Всё важное закончилось. Мы уже говорили, что будем разыгрывать призы и пришлём новогодний подарок и ссылку с результатами опроса после его окончания.</p>\n<p>Если хотите поучаствовать, оставьте свой email. Мы сохраним его отдельно от результатов в другое хранилище чтобы нельзя было сопоставить ваши ответы и адрес почты.</p>"
                    }
                },
                {
                    "type": "text",
                    "name": "EmailQuestion",
                    "startWithNewLine": false,
                    "title": {
                        "ru": "Email"
                    },
                    "titleLocation": "hidden",
                    "autoComplete": "email",
                    "maxLength": 500,
                    "placeHolder": {
                        "ru": "example@mail.org"
                    }
                }
            ],
            "title": {
                "ru": "Это последняя страница опроса. Спасибо за участие!"
            },
            "description": {
                "ru": "Вы супер! Правда-правда."
            }
        }
    ],
    "cookieName": "rndtechsurvey2020",
    "showQuestionNumbers": "off",
    "showProgressBar": "bottom",
    "maxTextLength": 5000,
    "pagePrevText": {
        "ru": "Назад"
    },
    "pageNextText": {
        "ru": "Дальше"
    },
    "completeText": {
        "ru": "Завершить"
    },
    "firstPageIsStarted": true
};

function addCSSRule(sheet, selector, rules, index) {
    if("insertRule" in sheet) {
        sheet.insertRule(selector + "{" + rules + "}", index);
    }
    else if("addRule" in sheet) {
        sheet.addRule(selector, rules, index);
    }
}

// Use it!
addCSSRule(document.styleSheets[0], ".sv-root-modern .sv-checkbox--allowhover:hover .sv-checkbox__svg", "background-color: transparent !important; border: 3px solid rgba(64, 64, 64, 0.5); border-radius: 2px;");
addCSSRule(document.styleSheets[0], ".sv-table__cell", "vertical-align: middle;");

function sendDataToServer(survey) {
    $.ajax({
        type: "POST",
        url: "api/survey",
        data: { answer : JSON.stringify(survey.data) },
        dataType: "text"
    });
}

var survey = new Survey.Model(surveyJSON);
$("#surveyContainer").Survey({
    model: survey,
    onComplete: sendDataToServer
});