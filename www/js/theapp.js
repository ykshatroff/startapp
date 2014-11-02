/**
 * Created by yks on 21.10.14.
 *
 * Requires: jquery, flot, underscore
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
 * The control form must contain inputs: app_id, period, param_names
 *
 */
(function($, _) {
    function debug() {
        window.console.log(Array.prototype.join.call(arguments, ","));
    }

    var theapp = window.TheApp = {
        settings: {
            CANVAS_SELECTOR: "#chart",  // the jQuery selector of the canvas div
            CANVAS_SIZE: {  // the width and height of the canvas div
                width: "500px",
                height: "300px"
            },
            DATA_URL: '/jx/stat/',  // the base URL of JSON data source
            DEFAULT_SECTION: "appInfo",
            FORM_SELECTOR: "form[name=chart]",  // the jQuery selector of the control form div
            HEADER_DIV_SELECTOR: "#chartHeader",  // the jQuery selector of the header div
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
            appId: "",  // string
            period: null,  // e.g. theapp.settings.PERIODS['10 min']
            availableParams: [],  // list of available parameter names
            selectedParams: []  // list of selected parameter names
        },
        cache: {},  // the result cache
        // event name constants
        ON_DATA_REQUEST: "data-request",
        ON_DATA_READY: "data-ready",
        ON_AVAILABLE_PARAMS_CHANGE: "available-params-change",
        ON_SELECTED_PARAMS_CHANGE: "selected-params-change",

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

            // setup control elements
            theapp.setupControls();

            // setup event handlers
            var eventDispatcher = theapp.getEventDispatcher();
            eventDispatcher.on(theapp.ON_DATA_READY, theapp.displayResult);

            theapp.loadData();

            return theapp;
        },

        getEventDispatcher: function() {
            return $("body");
        },

        getControlDispatcher: function() {
            return $(theapp.settings.FORM_SELECTOR);
        },

        setupControls: function() {
            var controlDispatcher = theapp.getControlDispatcher();
            if (! controlDispatcher.length) {
                throw("No root control element (form) found");
            }

            // assert that period is an input type=radio
            var periodInputSelector = "[name=period]";
            var periodInputSelectorChecked = periodInputSelector + ":checked";
            if ( !$(periodInputSelectorChecked).length ) {
                $(periodInputSelector)[0].checked = true;
            }
            theapp.currentValues.period = $(periodInputSelectorChecked).val();
            $(periodInputSelector).on("change", function() {
                theapp.updateCurrentPeriod(this);
            });

            // assert that app_id is a select
            var appIdSelector = "[name=app_id]";
            theapp.currentValues.appId = $(appIdSelector).val();
            $(appIdSelector).on("change", function() {
                theapp.updateCurrentAppId(this);
            });

            // assert that param_names is a select
            var paramsSelector = "[name=param_names]";
            // append to the select all possible params as hidden options,
            // which will appear when available in chart data
            var $paramsSelector = $(paramsSelector);
            $paramsSelector.on("change", function() {
                theapp.selectParam(this.selectedOptions[0].text);
                return false;
            });

            controlDispatcher.find("#chart__selectedParams").on("click", "a", function() {
                theapp.deselectParam($(this.parentNode).find("span").text());
            });

            theapp.getEventDispatcher().on(theapp.ON_AVAILABLE_PARAMS_CHANGE, function() {
                theapp.updateSelectedParams($paramsSelector);
            });

            theapp.getEventDispatcher().on(theapp.ON_SELECTED_PARAMS_CHANGE, function() {
                theapp.updateSelectedParams($paramsSelector);
            });

            return theapp;
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

        /** Check cache for JSON data, or
         *  make an AJAX request for JSON data and store it into cache,
         *  Emit events
         *
         * @returns  object theapp
         */
        loadData: function() {
            var currentValues = theapp.currentValues;
            var appId = currentValues.appId;
            var period = currentValues.period || _.values(theapp.settings.PERIODS)[0];  // first value

            // check data in cache
            var data = theapp.getData(appId, period);
            if (data) {
                theapp.getEventDispatcher().trigger(theapp.ON_DATA_READY);
                return theapp;
            }

            var url = theapp.settings.DATA_URL;
            var query = {
                APP_ID: appId,
                PERIOD: period
            };
            theapp.getEventDispatcher().trigger(theapp.ON_DATA_REQUEST);
            $.getJSON(url, query)
                .done(function(data) {
                    theapp.storeData(data, appId, period);
                    theapp.getEventDispatcher().trigger(theapp.ON_DATA_READY);
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    alert("Ошибка: " + errorThrown)
                })
            ;
            return theapp;
        },

        getData: function(appId, period) {
            debug("getData " + appId + ", " + period);
            var cache = theapp.cache;
            if (appId in cache && period in cache[appId]) {
                return cache[appId][period];
            }
            return undefined;
        },

        storeData: function(data, appId, period) {
            debug("setData " + appId + ", " + period);
            var cache = theapp.cache;
            var cacheByApp = cache[appId] = cache[appId] || {};  // initialize cache by app ID
            var newData = theapp.transformData(data);
            cacheByApp[period] = newData;  // save data into cache by period
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
                function() {
                    var first = _.keys(data)[0];  // get first key
                    if (first) return [ first ];
                    throw "Empty data";  // raise an error
                }();


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

        /** Display chart using the stored currentValues and data
         * If chart data is loaded, draw chart immediately, otherwise load the data and display loader
         *
         */
        displayResult: function() {
            var currentValues = theapp.currentValues;
            var data = theapp.getData(currentValues.appId, currentValues.period);

            currentValues.availableParams = _.keys(data);
            if (! currentValues.selectedParams.length) {
                currentValues.selectedParams = [ currentValues.availableParams[0] ];  // first key
            } else {
                currentValues.selectedParams = _.intersection(currentValues.availableParams, currentValues.selectedParams);
            }
            theapp.getEventDispatcher().trigger(theapp.ON_AVAILABLE_PARAMS_CHANGE);
            return theapp.drawChart(data, currentValues.selectedParams);
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
            if (_.isEmpty(newData)) {
                throw "Empty data";
            }
            return newData;
        },

        /** Update the appId value in currentValues from a HTML value or data attribute
         *
         * @param htmlElement (selector, domElement ...)
         * @returns object theapp
         */
        updateCurrentAppId: function(htmlElement) {
            htmlElement = $(htmlElement);
            var appId = htmlElement.val() || htmlElement.data("app_id");
            if (appId != theapp.currentValues.appId) {
                theapp.currentValues.appId = appId;
                theapp.loadData();
            }
            return theapp;
        },

        /** Update the periodName value in currentValues from a HTML value or data attribute
         *
         * @param htmlElement (selector, domElement ...)
         * @returns object theapp
         */
        updateCurrentPeriod: function(htmlElement) {
            htmlElement = $(htmlElement);
            var period = htmlElement.val() || htmlElement.data("period");
            if (theapp.currentValues.period != period) {
                theapp.currentValues.period = period;
                theapp.loadData();
            }

            return theapp;
        },

        /** Update the selected params in currentValues
         *
         * @param htmlElement (a select?)
         * @returns object theapp
         */
        updateSelectedParams: function(htmlElement) {
            var controlDispatcher = theapp.getControlDispatcher();  // aka <form>
            var $select = $(htmlElement);   // aka <select>
            var availableParams = theapp.currentValues.availableParams;
            var selectedParams = theapp.currentValues.selectedParams;

            // fill the <select> with available params excluding selected
            $select.find("option:first").nextAll().remove();
            _.each(availableParams, function(label) {
                if (! _.contains(selectedParams, label)) {
                    $select.append($("<option>").text(label));
                }
            });

            // build the list of selected params using a HTML template
            var $target = controlDispatcher.find("#chart__selectedParams");
            var $template = $target.find("._template");
            $template.nextAll().remove();
            _.each(selectedParams, function(label) {
                var $node = $template.clone().removeClass("hidden _template");
                $node.find("span").text(label);
                $target.append($node);
            });

            return theapp;
        },

        selectParam: function(label) {
            var availableParams = theapp.currentValues.availableParams;
            var selectedParams = theapp.currentValues.selectedParams;
            if (_.contains(availableParams, label) && ! _.contains(selectedParams, label)) {
                selectedParams.push(label);
                theapp.getEventDispatcher().trigger(theapp.ON_SELECTED_PARAMS_CHANGE);
                theapp.loadData();
            }
            return theapp;
        },

        deselectParam: function(label) {
            var availableParams = theapp.currentValues.availableParams;
            var selectedParams = theapp.currentValues.selectedParams;
            var index = _.indexOf(selectedParams, label);
            if (index != -1) {
                delete selectedParams[index];
                theapp.getEventDispatcher().trigger(theapp.ON_SELECTED_PARAMS_CHANGE);
                theapp.loadData();
            }
            return theapp;
        }
    };

})(jQuery, _);
