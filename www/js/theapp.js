/**
 * Created by yks on 21.10.14.
 *
 * The expected JSON data format is:
 * { ...
 *   time: Array(...),
 *   section1: Array( [param1_value, param2_value, ...], [...], ... )
 *   section2: Array( [param1_value, param2_value, ...], [...], ... )
 * }
 * where the indices of the `section*` arrays correspond to those of the `time` array,
 * and the value indices of the `section*` arrays correspond to parameter names defined in `labels` sections below
 *
 */
(function($) {
    function debug() {
        window.console.log(Array.prototype.join.call(arguments, ","));
    }

    /** get first key-value pair from data object
     *
     * @param obj
     * @returns []
     */
    function first(obj) {
        for (var x in obj) return [ x, obj[x] ];
        throw "Empty object";
    }

    var theapp = window.TheApp = {
        settings: {
            DEFAULT_SECTION: "appInfo",
            DATA_URL: '/jx/stat/',  // the base URL of JSON data source
            HEADER_DIV_SELECTOR: "#chartHeader",  // the jQuery selector of the header div
            CANVAS_SELECTOR: "#chart",  // the jQuery selector of the canvas div
            CANVAS_SIZE: {  // the width and height of the canvas div
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

        // private data
        canvas: null,
        headerDiv: null,
        currentValues: {
            appId: 0,
            periodName: '10 min',
            selectedParams: []  // list of selected parameter names
        },
        cache: {},  // the result cache
        // event name constants
        ON_DATA_REQUEST: "data-request",
        ON_DATA_READY: "data-ready",

        /** Initialization of TheApp, best done on document ready
         *
         * @param options
         */
        init: function(options) {
            if (options) {
                $.extend(theapp.settings, options);
            }

            // check that canvas is available
            // TODO: set canvas dimensions if not set in CSS
            var canvas = theapp.getCanvas();

            // setup header
            theapp.displayHeader();

            // setup event handlers
            var eventDispatcher = theapp.getEventDispatcher();
            eventDispatcher.on(theapp.ON_DATA_READY, theapp.displayResult);

            return theapp;
        },

        getEventDispatcher: function() {
            return $("body");
        },

        getCanvas: function() {
            if (! theapp.canvas) {
                var canvas = $(theapp.settings.CANVAS_SELECTOR);
                if (! canvas.length) {
                    throw("No canvas element found");
                }
                theapp.canvas = canvas;
            }
            return theapp.canvas;
        },

        getHeaderDiv: function() {
            if (! theapp.headerDiv) {
                var headerDiv = $(theapp.settings.HEADER_DIV_SELECTOR);
                if (! headerDiv.length) {
                    throw("No header element found");
                }
                theapp.headerDiv = headerDiv;
            }
            return theapp.headerDiv;
        },

        /** Check cache for JSON data, or
         *  make an AJAX request for JSON data and store it into cache,
         *  Emit events
         *
         */
        loadData: function() {
            var currentValues = theapp.currentValues;
            var appId = currentValues.appId;
            var periodName = currentValues.periodName;

            // check data in cache
            var data = theapp.getData(appId, periodName);
            if (data) {
                theapp.getEventDispatcher().trigger(theapp.ON_DATA_READY);
                return theapp;
            }

            var url = theapp.settings.DATA_URL;
            var query = {
                APP_ID: appId,
                PERIOD: theapp.settings.PERIODS[periodName]
            };
            theapp.getEventDispatcher().trigger(theapp.ON_DATA_REQUEST);
            $.getJSON(url, query)
                .done(function(data) {
                    theapp.storeData(data, appId, periodName);
                    theapp.getEventDispatcher().trigger(theapp.ON_DATA_READY);
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    alert("Ошибка: " + errorThrown)
                })
            ;
            return theapp;
        },

        getData: function(appId, periodName) {
            debug("getData " + appId + ", " + periodName);
            var cache = theapp.cache;
            if (appId in cache && periodName in cache[appId]) {
                return cache[appId][periodName];
            }
            return undefined;
        },

        storeData: function(data, appId, periodName) {
            debug("setData " + appId + ", " + periodName);
            var cache = theapp.cache;
            var cacheByApp = cache[appId] = cache[appId] || {};  // initialize cache by app ID
            var newData = theapp.transformData(data);
            cacheByApp[periodName] = newData;  // save data into cache by period
            return theapp;
        },

        /**
         *
         * @param data object : {paramName1: [ [x1,y1], [x2, y2], ... ], paramNameN: ... }
         * @param selectedParams array : list of names of selected params
         * @returns object : theapp
         */
        drawChart: function(data, selectedParams) {
            // WTF JS :
            // [] == false, BUT
            // [] || 1 == []
            selectedParams = selectedParams instanceof Array && selectedParams.length > 0 ?
                selectedParams :
                [ first(data)[0] ];  // first key

            var chartData = [];
            for (var paramIndex=0, len=selectedParams.length; paramIndex<len; paramIndex++) {
                var paramName = selectedParams[paramIndex];
                var seriesData = {
                    label: paramName,
                    data: data[paramName]
                };
                chartData.push(seriesData);
            }

            // TODO yaxes based on selectedParams
            $.plot(theapp.getCanvas(), chartData, {
                xaxes: [ { mode: "time" } ],
                yaxes: [ { min: 0 }, {
                } ],
                legend: { position: "sw" }
            });
            return theapp;
        },

        /** Draw chart based on JSON data
         *
         * The graph data has the following format:
         *      section: [ x1: [y1,y2,y3...], x2: [y1,y2,y3...], ...]
         * where xN is the time point index, yN are values
         *
         * @param data = JSON
         * @param section = key for the array of the names of labels
         * @returns object : theapp
         */
        drawChartX: function(data, section) {
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

            debug(chartData);
            $.plot(theapp.getCanvas(), chartData, {
                xaxes: [ { mode: "time" } ],
                yaxes: [ { min: 0 }, {
                } ],
                legend: { position: "sw" }
            });
            return theapp;
        },

        /** Display chart using the stored currentValues and data
         * If chart data is loaded, draw chart immediately, otherwise load the data and display loader
         *
         */
        displayResult: function() {
            var currentValues = theapp.currentValues;
            var data = theapp.getData(currentValues.appId, currentValues.periodName);
            return theapp.drawChart(data, currentValues.selectedParams);
        },

        displayHeader: function() {
            var headerDiv = theapp.getHeaderDiv();
            headerDiv.html("");

            var periodChoiceDiv = $("<div/>");
            for (var periodName in theapp.settings.PERIODS) {
                var html = $("<a href='#'>" + periodName + "</a><br>")
                    .data("period_name", periodName);
                periodChoiceDiv.append( html );
            }
            periodChoiceDiv.on("click", "a", function() {
                theapp.updateCurrentPeriod(this);
            });
            headerDiv.append(periodChoiceDiv);

            var sectionDiv = $("<div/>");
            for (var section in theapp.labels) {
                var html = $("<a href='#'>" + section + "</a><br>")
                    .data("section", section);
                sectionDiv.append( html );
            }
            sectionDiv.on("click", "a", function() {
                theapp.updateCurrentSection(this);
            });
            headerDiv.append(sectionDiv);

            return theapp;
        },

        /** Helper function for `drawChart`
         *
         * @param startTime = UNIX timestamp of the start of measurement
         * @param period = scale of measurement in seconds (X coord)
         * @param points = measurement point numbers
         * @param input = measurement values (2-dim Array)
         * @param column = index of the measurement value corresponding to the `label`, in the `input`
         * @param label = text description of the measurement
         * @returns {{label: *, data: [...]}}
         */
        mapData: function(startTime, period, points, input, column, label) {
            function adjustPoint(point) {
                // convert time points into JS timestamps
                return (startTime + point * period) * 1000;
            }

            var map = {
                label: label,
                data: null
            };
            var data = [];

            for (var point=0, len=points.length-1; point<len; point++) {
                data.push([adjustPoint(points[point]), input[point][column]]);
            }
            map.data = data;
            return map;
        },

        /** Transform server data from the server-defined format (see @head)
         *  into an Object {paramName: Array(values)} where paramName is one of params
         *  defined in `labels` sections, and values are the pairs (arrays) of an x-point and
         *  the corresponding server-supplied y-value for this param.
         *
         * @param data JSON
         * @returns Object data {paramName: Array([x1, y1], [x2, y2]...)}
         * @throws error if invalid data
         */
        transformData: function(data) {
            var startTime = data.startTime;
            var period = data.period;
            var points = data.time;
            function adjustPoint(point) {
                // convert time points into JS timestamps
                return (startTime + point * period) * 1000;
            }
            var pointsNum = points.length;

            var newData = {};
            for (var section in theapp.labels) {
                if (section in data) {
                    var paramNames = theapp.labels[section];
                    var dataSection = data[section];  // array (by time point index) of arrays (by param index)
                    if (dataSection.length != pointsNum) {
                        debug("invalid data for section '" + section + "'");
                        throw("invalid data for section '" + section + "'");
                    }

                    // group data by parameter
                    for (var paramIndex=0,paramNum=paramNames.length; paramIndex<paramNum; paramIndex++) {
                        var values = [];
                        var paramName = paramNames[paramIndex];
                        // extract values corresponding to parameter index
                        for (var pointIndex=0; pointIndex<pointsNum; pointIndex++) {
                            var pair = [
                                adjustPoint(points[pointIndex]),  // x
                                dataSection[pointIndex][paramIndex]  // y
                            ];
                            values.push(pair);
                        }
                        newData[paramName] = values;
                    }
                }
            }
            return newData;
        },

        /** Update the appId value in currentValues from a HTML anchor data attribute (when clicked)
         *
         * @param htmlElement
         * @returns = chainable
         */
        updateCurrentAppId: function(htmlElement) {
            var appId = $(htmlElement).data("app_id");
            if (0 + appId != 0 + theapp.currentValues.appId) {
                theapp.currentValues.appId = appId;
                theapp.loadData();
            }
            return theapp;
        },

        /** Update the periodName value in currentValues from a HTML anchor data attribute (when clicked)
         *
         * @param htmlElement
         * @returns = chainable
         */
        updateCurrentPeriod: function(htmlElement) {
            var periodName = $(htmlElement).data("period_name");
            if (theapp.currentValues.periodName != periodName) {
                theapp.currentValues.periodName = periodName;
                theapp.loadData();
            }

            return theapp;
        },

        /** Update the section value in currentValues from a HTML anchor data attribute (when clicked)
         *
         * @param htmlElement
         * @returns = chainable
         */
        updateCurrentSection: function(htmlElement) {
            var section = $(htmlElement).data("section");
            if (theapp.currentValues.section != section) {
                theapp.currentValues.section = section;
                theapp.loadData();
            }
            return theapp;
        }
    };

})(jQuery);
