/* jshint latedef:nofunc */
'use strict';

var Utils = require('./utils');

function DataPorter() {

    var dataVersion = "0.2.0";

    var utils = new Utils();

    function exportData(internalData) {
        var newNodes = internalData.nodes.map(function (r) {
            return {
                id: r.id,
                type: r.type,
                prop: r.prop,
                x: Math.round(r.x),
                y: Math.round(r.y),
                fx: utils.isNumber(r.fx) ? Math.round(r.fx) : undefined,
                fy: utils.isNumber(r.fy) ? Math.round(r.fy) : undefined
            };
        });
        var newLinks = internalData.links.map(function (r) {
            return {
                id: r.id,
                type: r.type,
                source: r.source.id,
                target: r.target.id,
                prop: r.prop
            };
        });
        return {
            version: dataVersion,
            nodes: newNodes,
            links: newLinks,
            transform: utils.parseTransform(internalData.transform)
        };
    }

    function importData(externalData) {
        if (externalData.version === dataVersion) {
            var internalData = Object.create(externalData);
            return internalData;
        }
        return importDataFromVer_0_1_0(externalData);
    }

    function importDataFromVer_0_1_0(externalData) {
        var internalData = Object.create(externalData);
        internalData.nodes = externalData.nodes.map(function (r) {
            var s = r;
            s.type = Array.isArray(r.labels) ? r.labels[0] : "";
            s.prop = r.properties;
            s.properties = undefined;
            return s;
        });
        internalData.links = externalData.links.map(function (r) {
            var s = r;
            s.prop = r.properties;
            s.properties = undefined;
            return s;
        });
        internalData.transform = utils.parseTransform(externalData.transform);
        internalData.version = dataVersion;
        return internalData;
    }
    return {
        exportData: exportData,
        importData: importData
    };
}

module.exports = DataPorter;
