/**
 * Created by yks on 21.10.14.
 */
(function($) {
    var theapp = window.TheApp = {
        settings: {
            DEFAULT_SECTION: "appInfo",
            DATA_URL: '/jx/stat/',  // the base URL of JSON data source
            HEADER_DIV_SELECTOR: "#chartHeader",  // the jQuery selector of the header div
            CHART_DIV_SELECTOR: "#chart",  // the jQuery selector of the canvas div
            CHART_DIV_SIZE: {  // the width and height of the canvas div
                width: "500px",
                height: "300px"
            },
            PERIODS: {
                '10 min': 600,
                '1 hour': 3600,
                '1 day': 86400
            },
            _dummy: null
        },
        cache: {},  // the result cache
        labels: {
            appInfo: [
                "Доступность приложения",
                "Кол-во регистраций",
                "Лимит регистраций"
            ],
            appSuggStat: [
                "Повторная регистрация",
                "Рекомендация не найдена",
                "Рекомендация самому себе",
                "Регистрация по рекомендации",
                "Самостоятельная регистрация",
                "Награда за рекомендацию",
                "Рекомендация",
                "Лимит рекомендация исчерпан",
                "Приложение не зарегистрировано",
                "Первый платеж по рекомендации",
                "Награда за повторный платеж по рекомендации",
                "Награда за повторный платеж по рекомендации == 0",
                "Повторный платеж по рекомендации",
                "Первый платеж без рекомендации",
                "Повторный платеж без рекомендации",
                "Обновление состояния",
            ],
            "accountInfo": [
                "Новый пользователь",
                "Повторная попытка создания",
                "Создание пользователя",
                "Пользователь авторизован",
                "Пользователь не авторизован (не верный пароль)",
                "Пользователь не найден",
            ],
            "suggAccountInfo":[
                "Новый пользователь",
                "Повторная попытка создания",
                "Создание пользователя",
                "Пользователь авторизован",
                "Пользователь не авторизован (не верный пароль)",
                "Пользователь не найден",
            ],
            "webAccountInfo": [
                "Новый пользователь",
                "Повторная попытка создания",
                "Создание пользователя",
                "Пользователь авторизован",
                "Пользователь не авторизован (не верный пароль)",
                "Пользователь не найден",
            ],
            "dbStatStat": [
                "Размер очереди в транзакциях",
                "Максимальная очередь в транзакциях",
                "Кол-во добавленных транзакций",
                "Кол-во выполненных транзакций",
                "Кол-во пустых транзакций",
                "Кол-во NULL транзакций",
                "Размер очереди в запросах",
                "Максимальная очередь в запросах",
                "Кол-во добавленных запросов",
                "Кол-во выполненных запросов",
            ],
            "dbSuggStat": [
                "Размер очереди в транзакциях",
                "Максимальная очередь в транзакциях",
                "Кол-во добавленных транзакций",
                "Кол-во выполненных транзакций",
                "Кол-во пустых транзакций",
                "Кол-во NULL транзакций",
                "Размер очереди в запросах",
                "Максимальная очередь в запросах",
                "Кол-во добавленных запросов",
                "Кол-во выполненных запросов",
            ],
            "dbSessStat": [
                "Размер очереди в транзакциях",
                "Максимальная очередь в транзакциях",
                "Кол-во добавленных транзакций",
                "Кол-во выполненных транзакций",
                "Кол-во пустых транзакций",
                "Кол-во NULL транзакций",
                "Размер очереди в запросах",
                "Максимальная очередь в запросах",
                "Кол-во добавленных запросов",
                "Кол-во выполненных запросов",
            ],

            "fcgiStat": [
                "Кол-во полученных сетевых запросов",
                "Кол-во не верных сетевых запросов",
                "Кол-во выполненных сетевых запросов",
            ],

            "fcgiProc": [
                "Кол-во полученных fcgi-запросов",
                "Кол-во SUGGEST fcgi-запросов",
                "Кол-во ADMIN fcgi-запросов",
                "Кол-во MONITOR fcgi-запросов",
                "Кол-во пропущеных fcgi-запросов",
                "Кол-во WOA fcgi-запросов",
                "Кол-во WEB fcgi-запросов",
            ],

            "accListInfo": [
                "Максимальный ID клиента",
                "Кол-во почтовых адресов",
                "Лимит почтовых адресов",
                "Кол-во зарегистрированных клиентов",
                "Лимит клиентов",
            ],

            "appListInfo":[
                "Кол-во приложений",
                "Лимит кол-ва приложений",
            ],

            "reqInfo": [
                "Кол-во запросов со старым протоколом",
                "Кол-во не верных запросов",
                "Кол-во запросов на смену пароля",
                "Кол-во запросов на смену ника",
            ],
        },

        /** Initialization of TheApp, best done on document ready
         *
         * @param options
         */
        init: function(options) {
            if (options) {
                $.extend(theapp.settings, options);
            }
            var canvas = theapp.getCanvas();
            if (! canvas.length) {
                throw("No canvas element found");
            }
            // setup header
            var headerDiv = $(theapp.settings.HEADER_DIV_SELECTOR);
            headerDiv.on("click", "a", function() {
                var section = $(this).attr("href").slice(1);
                alert (section);
                theapp.displayResult(section);
                return false;
            });
            theapp.displayHeader();
            // set canvas dimensions if not set in CSS
            return theapp;
        },

        getCanvas: function() {
            return $(theapp.settings.CHART_DIV_SELECTOR);
        },

        /** Make an AJAX request for JSON data and display results
         *
         * @param appId
         * @param periodName string
         */
        loadData: function(appId, periodName, section) {
            var url = theapp.settings.DATA_URL;
            var query = {
                APP_ID: appId,
                PERIOD: theapp.settings.PERIODS[periodName] || 600
            };
            $.getJSON(url, query)
                .done(function(data) {
                    theapp.storeData(data);
                    theapp.drawChart(data, section || theapp.settings.DEFAULT_SECTION);
                })
            ;
            return theapp;
        },

        getData: function(appId, periodName) {
            var cache = theapp.cache;
            if (appId in cache && periodName in cache[appId]) {
                return cache[appId][periodName];
            }
            return undefined;
        },

        storeData: function(data, appId, periodName) {
            var cache = theapp.cache;
            var cacheByApp = cache[appId] = cache[appId] || {};  // initialize cache by app ID
            cacheByApp[periodName] = data;  // save data into cache by period
            return theapp;
        },

        /** Draw chart based on JSON data
         *
         * The graph data has the following format:
         *      section: [ x1: [y1,y2,y3...], x2: [y1,y2,y3...], ...]
         * where xN is the time point index, yN are values
         *
         * @param data JSON
         * @param section
         * @returns chainable
         */
        drawChart: function(data, section) {
            var points = data.time;
            var period = data.period;
            var startTime = data.startTime;
            var graphLabels = theapp.labels[section];
            var graphData = data[section];
            var chartData = [];
            for (var sourceIdx=0, len=graphLabels.length; sourceIdx<len; sourceIdx++) {
                chartData.push(theapp.mapData(
                        startTime,
                        period,
                        points,
                        graphData,
                        sourceIdx,
                        graphLabels[sourceIdx]
                ));
            }

            console.log(chartData);
            $.plot(theapp.getCanvas(), chartData, {
                xaxes: [ { mode: "time" } ],
                yaxes: [ { min: 0 }, {
                } ],
                legend: { position: "sw" }
            });
            return theapp;
        },

        /** Display results for a section
         * If chart data is loaded, draw chart immediately, otherwise load the data and display loader
         *
         * @param section
         */
        displayResult: function(section) {
            var appId = 0;
            var periodName = '10 min';
            var data = theapp.getData(appId, periodName);
            if (! data) {
                return theapp.loadData(appId, periodName, section);
            }
            return theapp.drawChart(appId, section);
        },

        displayHeader: function() {
            var headerDiv = $(theapp.settings.HEADER_DIV_SELECTOR);
            headerDiv.html("");
            for (var section in theapp.labels) {
                headerDiv.append("<a href='#" + section + "'>" + section + "</a><br>");
            }

            return theapp;
        },

        /** Helper function for `drawChart`
         *
         * @param startTime
         * @param period
         * @param points
         * @param input
         * @param column
         * @param label
         * @returns {{label: *, data: [...]}}
         */
        mapData: function(startTime, period, points, input, column, label) {
            function adjustPoint(point) {
                // convert time points into JS timestamps
                return (startTime + point * period) * 1000;
            }

            var map = {
                label: label,
            };
            var data = [];

            for (var point=0, len=points.length-1; point<len; point++) {
                data.push([adjustPoint(points[point]), input[point][column]]);
            }
            map.data = data;
            return map;
        }

    };

})(jQuery);
