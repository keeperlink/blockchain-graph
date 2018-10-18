/* global bootbox, gtag, document */
/* jshint latedef:nofunc */
'use strict';

function Utils() {

    function isFunction(a) {
        return (typeof a === 'function');
    }

    function isObject(a) {
        return (typeof a === 'object');
    }

    function isString(a) {
        return (typeof a === 'string');
    }

    function isNumber(a) {
        return (typeof a === 'number');
    }

    /**
     * Call function if defined with one parameter.
     *
     * @param {type} func function
     * @param {type} param parameter
     * @returns function response
     */
    function callIfDefined(func, param) {
        if (isFunction(func)) {
            return func(param);
        }
    }

    function merge(target, source) {
        Object.keys(source).forEach(function (property) {
            target[property] = source[property];
        });
    }

    function Timer() {
        var start = new Date().getTime();

        function time() {
            return new Date().getTime() - start;
        }
        return {
            start: start,
            time: time
        };
    }

    function gevent(category, item, name, value) {
        gtag('event', item, {
            'event_category': category,
            'event_label': name,
            'value': value
        });
    }

    function gtime(category, name, value) {
        gtag('event', 'timing_complete', {
            'name': name,
            'value': value,
            'event_category': category
        });
    }

    function eventMenu(item, name, value) {
        gevent('menu', item, name, value);
    }

    function downloadObjectAsJson(exportObj, defaultFileName, callback) {
        bootbox.prompt({title: "File name: ", value: defaultFileName, callback: function (exportName) {
                if (exportName) {
                    eventMenu('save', 'exportName', exportName);
                    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
                    var tmpAnchor = document.createElement('a');
                    tmpAnchor.setAttribute("href", dataStr);
                    tmpAnchor.setAttribute("download", exportName + ".json");
                    document.body.appendChild(tmpAnchor); // required for firefox
                    tmpAnchor.click();
                    tmpAnchor.remove();
                }
                if (callback) {
                    callback(exportName);
                }
            }});
    }

    function parseTransform(transform) {
        if (isString(transform)) {
            var matrix = {x: 0, y: 0, r: 0, k: 1};
            var match = transform.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?\s?)+\))+/g);
            for (var i = 0; i < match.length; i++) {
                var s = match[i].match(/[\w\.\-]+/g), op = s[0];
                if ('translate' === op) {
                    matrix.x = parseFloat(s[1]);
                    matrix.y = parseFloat(s[2]);
                } else if ('rotate' === op) {
                    matrix.r = s[1];
                } else if ('scale' === op) {
                    matrix.k = parseFloat(s[1]);
                }
            }
            return matrix;
        }
    }

    function toTransform(m) {
        var transform = "";
        if (isObject(m)) {
            if (isNumber(m.x) && isNumber(m.y)) {
                transform = "translate(" + m.x + "," + m.y + ")";
            }
            if (isNumber(m.k)) {
                transform += " scale(" + m.k + ")";
            }
        }
        return transform;
    }

    return {
        isFunction: isFunction,
        isNumber: isNumber,
        callIfDefined: callIfDefined,
        merge: merge,
        Timer: Timer,
        gevent: gevent,
        gtime: gtime,
        eventMenu: eventMenu,
        downloadObjectAsJson: downloadObjectAsJson,
        parseTransform: parseTransform,
        toTransform: toTransform
    };
}

module.exports = Utils;
