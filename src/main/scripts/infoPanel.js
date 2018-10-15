/* global d3 */
/* jshint latedef:nofunc */
'use strict';

function InfoPanel() {

    var info, colorFunc;

    function init(container, colorFunction) {
        info = container.append('div').attr('class', 'graphd3-info');
        colorFunc = colorFunction;
    }

    function clear() {
        info.html('');
    }


    function appendInfoElement(cls, d, property, value) {
        var elem = info;
        if (property === 'address' || property === 'hash' || property === 'block') {
            elem = elem.append('a').attr('target', '_blank').attr('href', 'https://btc.com/' + value);
        } else {
            elem = elem.append('span');
        }

        elem.attr('class', cls)
                .html('<strong>' + property + '</strong>' + (typeof value === "undefined" ? '' : (': ' + value)));

        if (typeof value === "undefined") {
            elem.style('background-color', function () {
                return colorFunc(d);
            }).style('border-color', function () {
                return d3.rgb(colorFunc(d)).darker(1);
            }).style('color', function () {
                return '#fff';
            });
        }
    }

    function updateInfo(d) {
        clear();
        if (d.labels) {
            appendInfoElement('class', d, d.labels[0]);
        } else {
            appendInfoElement('class', d, d.type);
        }
        Object.keys(d.properties).forEach(function (property) {
            appendInfoElement('property', d, property, d.properties[property]);
        });
    }

    return {
        init: init,
        clear: clear,
        updateInfo: updateInfo
    };
}

module.exports = InfoPanel;
