# Архитектура
## -src
### --components &mdash; глобальные компоненты
- common &mdash; часто используемые компоненты, например: Link, BreadCrumbs (используется на каждой странице)
- complex &mdash; компоненты, которые используются единожды в layout'е. Соответственно, задействуются на каждой странице приложения
- containers &mdash; используются в layout'е для разные ролей пользователей. Несмотря на название, не являются оберткой контента приложения. Вместо этого содержат обработчики событий для конкретной роли пользователя. Сейчас содержат обработку socket-сообщений с бэкенда
- layouts &mdash; на данный момент хранит только Main.layout


### --config
- env.ts &mdash; глобальные константы. Значения констант, как правило, берутся из .env. Пример: API_SERVER_URL


### --data
- files.data.ts &mdash; массивы расширений файлов для разных типов файлов. Применение: для input[type=file] как значение для параметра accept (IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(','))
- paths.data.ts
    - APP_PATHS &mdash; объект с роутами для навигации в приложений. Для ссылок в параметр href передаем значения только из этого объекта
    - API_ENDPOINTS &mdash; эндпоинты для запросов к API-серверу. URL для API-запросов передаем только из этого объекта
- strings.data.ts &mdash; объект STRINGS содержит названия socket-сообщений с API-сервера и прочие строки, задействованные в логике приложения. STRING_NAMES и STRING_ERRORS будут удалены, так как все надписи и тексты, отображаемые в UI хранятся в локалях (описаны ниже)
- time.data.ts &mdash; содержит массив MONTH_LIST с локализациями названий месяцев на разные языки и в разных формах


### --extensions &mdash; расширения для стандартных типов данных; TypeScript прототипы
Перед добавлением новых расширений к типам данных, требуется сначала обозначить их в /next-env.d.ts.
Все расширения типов данных импортируются в /src/extensions/index.ts. Сам index.ts импортируется в /src/pages/_app.tsx.
Таким образом, новое свойство типа данных можно использовать во всем проекте.


### --hooks &mdash; ReactJS хуки.
Пример: formValidation.hooks.ts - функции для валидации различных элементов Ant Design формы <Form></Form>


### --interfaces &mdash; глобальные TypeScript интерфейсы


### --locales &mdash; локали для UI

### --pages &mdash; файлы в этой директории выполняют функцию роутинга.
Контент страниц находится в /src/sections/<section_name>/pages/<page_name>/Content.tsx


### --sections &mdash; разделы проекта
Каждый раздел может содержать директории: components, data, pages, utils, interfaces, services &mdash; другими словами, каждый раздел может содержать те же логические единицы, что хранятся в проекте глобально, которые относятся именно к этому разделу.
Пример: раздел Organizations содержит components, pages, data.ts, utils.ts, interfaces.ts.

Также, контент какой-либо страницы может храниться в разных вариантах.
Пример: контент страницы "Личный кабинет" &mdash; /src/sections/PersonalArea/pages/PersonalArea.<user_role>.page/Content.tsx. Каждый вариантов страницы отрисовывается в /src/pages/personal-area/Content.tsx в зависимости от роли авторизованного пользователя пользователя.


### --services &mdash; глобальные сервисы
Пример: socket.ts &mdash; используется для обмена данными с API-сервером с помощью socket.io.


### --store &mdash; redux store
Глобальный state приложения
- index.ts &mdash; инициализация стейта
- helpers.ts &mdash; typedAction требуется для типизации экшнов в редюсерах
- modules &mdash; здесь хранятся все state-модули


### --styles &mdash; scss и css стили приложения
custom-antd.css - стандартные стили Ant Design с измененным primary-цветом. Этот файл не трогаем.
Если требуется стилизовать новый компонент, добавляем .scss файл в /src/styles/components, затем подключаем в /src/styles/main.scss. Если страницу &mdash; /src/styles/pages, далее так же подключаем в /src/styles/main.scss.


### --utils &mdash; глобальные утилиты
Пример: isClideSide() в /src/utils/common.utils.tsx возвращает true если код обрабатывается на клиентской части приложения, false - если на стороне NextJS-сервера.


### .env.local
В NextJS требуется создавать env-файл именно в таком формате вместо привычного .env.
Все переменные из **/.env.local** должны быть продублированы в **/next.config.js** (пример там есть). Иначе работать не будут.


### .env.example
Пример для заполнения .env.local


### ecosystem.config.js
Конфиг для запуска приложения на продакш-сервере с помощью npm-утилиты [**pm2**](https://www.npmjs.com/package/pm2)


### next-env.d.ts
Как описывалось ранее, в описании директории /src/extensions, перед добавлением новых расширений к типам данных, требуется сначала обозначить их в /next-env.d.ts.


### next.config.js
Конфиг для NextJS.
В данном случае конфиг добавляет возможность подключения файлов стилей в любой .tsx-файл.


# Запуск локально
```bash
yarn dev
```
Открыть http://localhost:<your_port>

[Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.


# Роутинг
Роутинг в NextJS описывается [здесь](https://nextjs.org/docs/routing/introduction).
После создания файла роута, необходимо обозначить права доступа к странице. Для этого необходимо в файл роута добавить функцию **getServerSideProps**. Ниже скрин с примером ее использования. Пояснение под скрином.
![](https://trello-attachments.s3.amazonaws.com/607c87bea78e89429c08e3d5/6097eb681cb1763723ba83d3/f997704f9e10c21ce70b9d2cef3e8014/image.png)
### Пояснение
В getCustomServerSideProps передается 1 параметр - объект с параметрами:
- authIsRequired (обязателен). 3 варианта значения:
    - 1 - доступ только авторизованным пользователям
    - 0 - доступ всем пользователям
    - -1 - доступ только неавторизованным пользователям
- requiredUserRole (необязателен). Как значение передаем роль пользователя из объекта USER_ROLES или массив ролей пользователя. Если значение не передано - доступ для всех ролей пользователей.
- cb - callback. Параметры:
    - ctx - контекст. Из него можно получить, например, query-параметры из адресной строки браузера. Также можно редиректить пользователя на другой роут, если необходимо (на скрине редирект не описан).
    - cookies - Cookies полученные с помощью библиотеки ["cookies"](https://www.npmjs.com/package/cookies). "cookies" используеьтся для получения Cookies при обработке на серверной части приложения, на клиентской части используем ["js-cookie"](https://www.npmjs.com/package/js-cookie).
    - params - объект. Содержит на данный момент только auth (state).
Из коллбэка возвращаем {props: <props_those_will_be_taken_by_route_component>}

Route component:
![](https://trello-attachments.s3.amazonaws.com/6097fee9c2a6f30f732b09ae/1061x817/626724f235b7745139c381b5dc101b05/image.png)


# Обращение к API-серверу
Для обращений к API-серверу есть функция APIRequest в /src/utils/api.utils.ts.
Параметры:
- method
- url - все эндпоинты хранятся в **/src/data/paths.data.ts, объекте API_ENDPOINTS**
- params - query параметры
- requireAuth - значение true, если для запроса требуется авторизация
- serverCookies - Cookies полученные из **getCustomServerSideProps** коллбэк контекста. Необходимо передавать при авторизованном API-запросе если запрос выполняется из **getCustomServerSideProps** коллбэка. Если запрос выполняется на клиентской части, передавать параметр не требуется.


# Правила
- именуем TS интерфейсы и типы по шаблону IEntity. EntityType - старый вариант. Пример: в **src/sections/Users/interfaces.ts** интерфейс "IUser" - правильный вариант.
