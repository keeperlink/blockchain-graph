/* global d3, document */
/* jshint latedef:nofunc */
'use strict';

function Alerts() {

    function getPanel() {
        var panel = d3.select('.page-alerts');
        if (panel.empty()) {
            panel = d3.select('body').append('div').attr('class', 'page-alerts');
        }
        return panel;
    }

    function showMessage(classes, bodyHtml, timeout) {
        var msgBox = getPanel().append("div").attr("class", "alert alert-dismissible " + classes);
        msgBox.append("a").attr("href", "#").attr("class", "close").attr("data-dismiss", "alert").attr("aria-label", "close").html("&times;");
        msgBox.append("span").html(bodyHtml);
        if (timeout) {
            setTimeout(function () {
                msgBox.remove();
            }, timeout);
        }
        return msgBox;
    }

    function showSuccess(text, timeout) {
        return showMessage('alert-success', '<strong>Success!</strong> ' + text, timeout);
    }

    function showInfo(text, timeout) {
        return showMessage('alert-info', text, timeout);
    }

    function showWarning(text, timeout) {
        return showMessage('alert-warning', text, timeout);
    }

    function showError(text, timeout) {
        return showMessage('alert-danger', '<strong>Error!</strong> ' + text, timeout);
    }

    return {
        showMessage: showMessage,
        success: showSuccess,
        info: showInfo,
        warning: showWarning,
        error: showError
    };
}

module.exports = Alerts;
