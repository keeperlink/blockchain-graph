/* global d3, $ */
/* jshint latedef:nofunc */
'use strict';

var Alerts = require('./alerts');

function InfoPanel() {
    var alerts = new Alerts();

    var info, settings, entity;

    function init(_settings) {
        settings = _settings;
        info = d3.select('MAIN').append('div').attr('class', 'graphd3-info');
        $('#entityColorInput').on('change', function () {
            console.log('entityColorInput: color: ', this.value);
            $('#entityColorPicker').val(this.value);
            if (settings.handlers.onColorChange) {
                settings.handlers.onColorChange(entity, this.value, entityColorScope());
            }
            info.select('.type').style('background-color', settings.entityColor(entity));
        });
        $('#entityColorPicker').on('change', function () {
            console.log('entityColorPicker: color: ', this.value);
            $('#entityColorInput').val(this.value);
            if (settings.handlers.onColorChange) {
                settings.handlers.onColorChange(entity, this.value, entityColorScope());
            }
            info.select('.type').style('background-color', settings.entityColor(entity));
        });
        $('#entityColorReset').on('click', function () {
            console.log('color reset');
            if (settings.handlers.onColorReset) {
                settings.handlers.onColorReset(entity, entityColorScope());
            }
            var ec = settings.entityColor(entity);
            info.select('.type').style('background-color', ec);
            $('#entityColorInput').val(ec);
            $('#entityColorPicker').val(ec);
        });
        $("input[name=entityColorScope]").change(function () {
            console.log('entityColor.scope:', this.value);
            var ec;
            if (this.value === 'class') {
                ec = settings.entityColor({type: entity.type, source: entity.source});
            } else {
                ec = settings.entityColor(entity);
            }
            $('#entityColorInput').val(ec);
            $('#entityColorPicker').val(ec);
        });
    }

    function clear() {
        info.html('');
    }

    function entityColorScope() {
        return $("input[name=entityColorScope]:checked").val();
    }
    function appendInfoElement(cls, d, property, value) {
        var elem = info.append('span');

        elem.attr('class', cls).append('strong').text(property);
        if (typeof value !== "undefined") {
            var val = elem;
            val.append('span').text(': ');
            if (property === 'address' || property === 'hash' || property === 'block') {
                val = val.append('a').attr('target', '_blank').attr('href', 'https://btc.com/' + value);
            } else {
                val = val.append('span');
            }
            val.text(value);
        }

        if (cls === "type") {
            elem.style('background-color', function () {
                return settings.entityColor(d);
            });
        }
    }

    function addSettingsMenu(d) {
        var settIcon = info.append('span').attr('class', 'dropdown');
        settIcon.append('a').attr('href', '#').attr('class', 'nav-link fa fa-cog fa-lg').attr('role', 'button').attr('data-toggle', 'dropdown').attr('title', 'Settings');
        var menu = settIcon.append('ul').attr('class', 'dropdown-menu').attr('id', 'settMenu');
        menuItem('menuColor', menu).text('Change Color').attr('data-toggle', 'modal').attr('data-target', '#colorDialog');
        if (!d.source) {
            menuItem('menuSize', menu).text('Change Size').on('click', nope);
            menuItem('menuSize', menu).text('Change properties').on('click', nope);
        }
        var ec = entityColorScope() === 'class' ? settings.entityColor({source: d.source, type: d.type}) : settings.entityColor(d);
        $('#entityColorInput').val(ec);
        $('#entityColorPicker').val(ec);

        function menuItem(id, menu) {
            return menu.append('li').attr('class', 'nav-item nav-link settings-menu-item').attr('data-toggle', 'collapse')
                    .attr('id', id).on('click', function () {
            });
        }
    }

    function nope() {
                alerts.warning("Not implemented yet", 3000);
    }

    function updateInfo(d) {
        entity = d;
        clear();
        addSettingsMenu(d);
        appendInfoElement('type', d, d.type);
        if (d.prop) {
            Object.keys(d.prop).forEach(function (property) {
                appendInfoElement('property', d, property, d.prop[property]);
            });
        }
        info.append("span").attr("class", "close").attr('title', 'close').html("&times;").on('click', clear);
    }

    return {
        init: init,
        clear: clear,
        updateInfo: updateInfo
    };
}

module.exports = InfoPanel;
