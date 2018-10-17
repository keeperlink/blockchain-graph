/* global $, d3, bootbox, FileReader, window, document */
/* j s h int latedef:nofunc */
'use strict';

var GraphD3 = require('./graphd3');
var Utils = require('./utils');
var Alerts = require('./alerts');
var Ipfs = require('./ipfs');

function initGraph() {
    var utils = new Utils();
    var alerts = new Alerts();
    var ipfs = new Ipfs(
            ['https://dev2.btcgraph.org', 'https://cloudflare-ipfs.com'],
            ['https://dev2.btcgraph.org:5001']);
    var upfsUrl = "<a href='https://ipfs.io' target='_blank'>IPFS</a>";

    var baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8090/api/' : '/api/';
    var expandUrl = baseUrl + 'node/expand';
    var connectUrl = baseUrl + 'node/connections';
    var connectLevel = "1";

    var graphD3 = new GraphD3({
        viewMode: "TxOut",
        nodeRadius: 25,
        nodeColors: {
            "address": "#a5abb6",
            "transaction": "#f2baf6",
            "output": "#fcea7e"
        },
        linkColors: {
            "input": "#6dce9e",
            "output": "#ff928c"
        },
        onNodeDoubleClick: function (node) {
            var msg = alerts.info("Loading data ...", 30000);
            graphD3.updateFromUrl(expandUrl, {"entityId": node.id, "level": 1, "limit": 50}, {x: node.x, y: node.y}, function (err, data) {
                msg.remove();
                if (err) {
                    alerts.error(err, 5000);
                }
            });
            utils.gevent('graph', 'expand');
        }
    });

    function initMenu() {
        $("#addButton").click(function () {
            var param = $("#addInput").val();
            var msg = alerts.info("Loading data ...", 30000);
            graphD3.updateFromUrl(expandUrl, {"entity": param, "level": 1, "limit": 50}, null, function (err, data) {
                msg.remove();
                if (err) {
                    alerts.error("Unable to load data", 5000);
                } else if (data && data.nodes.length === 0 && data.links && data.links.length === 0) {
                    alerts.warning("No new data found", 2000);
                }
            });
            utils.eventMenu('add', 'param', param);
            return false;
        });
        $("#saveBtn").click(function () {
            $("#fileMenu").collapse('hide');
            utils.downloadObjectAsJson(graphD3.getExportData(), "blockchain.graph", function (fileName) {
                if (fileName) {
                    alerts.success("Graph saved on your device in file \"" + fileName + "\"", 5000);
                }
            });
            return false;
        });
        $("#saveIpfsBtn").click(function () {
            $("#fileMenu").collapse('hide');
            var tm = new utils.Timer();
            var msg = alerts.info("Saving data to the " + upfsUrl + " ...", 30000);
            ipfs.add(JSON.stringify(graphD3.getExportData()), function (hash) {
                console.log('hash:', hash);
                msg.remove();
                if (hash) {
                    window.location.hash = 'ipfs-' + hash;
                    alerts.success("You graph data saved to the " + upfsUrl + ". You can access it by <a href='#ipfs-" + hash + "' target='_blank'>URL</a>.");
                    utils.gtime('api', 'ipfs.save', tm.time());
                    utils.gevent('graph', 'ipfs.save', 'success');
                } else {
                    alerts.error("Unable to save data to the " + upfsUrl + ".");
                    utils.gevent('graph', 'ipfs.save', 'error');
                }
            });
            return false;
        });
        $("#loadBtn").click(function () {
            $("#fileMenu").collapse('hide');
            var inp = d3.select("#selectFile2").empty() ? d3.select("body").append("input").attr("type", "file").attr("accept", ".json, text/json").attr("id", "selectFile2") : d3.select("#selectFile2");
            inp.on("change", function () {
                var files = this.files;
                if (files.length <= 0) {
                    return;
                }
                utils.eventMenu('load', 'file', 'name');
                var fr = new FileReader();
                fr.onload = function (e) {
                    var data = JSON.parse(e.target.result);
                    graphD3.updateWithData(data, null, true);
                    $("#viewDropdown").html("View:" + $("#view" + graphD3.viewMode()).text());
                    inp.remove();
                    alerts.success("File loaded", 2000);
                };
                var f = files;
                fr.readAsText(f.item(0));
            });
            $("#selectFile2").click();
            return false;
        });
        $("#releaseBtn").click(function () {
            graphD3.unstickAll();
            utils.eventMenu('release');
            alerts.success("All sticky nodes have been released", 2000);
            return false;
        });
        $("#connectBtn").click(function () {
            bootbox.prompt({title: "How deep to search (1=search for direct connections between existing nodes only) [1-6]: ", value: connectLevel, callback: function (level) {
                    if (level) {
                        utils.eventMenu('connect', 'level', level);
                        connectLevel = level;
                        var msg = alerts.info("Searching for connections...", 300000);
                        graphD3.updateFromUrl(connectUrl, {"level": level, "limit": 100}, null, function (err, data) {
                            msg.remove();
                            if (err) {
                                alerts.error(err, 5000);
                            } else if (data.links && data.links.length > 0) {
                                alerts.success("Found " + data.links.length + " new connections" + (data.message ? ". (" + data.message + ")" : ""), 20000);
                            } else {
                                alerts.warning("No new connections found", 2000);
                            }
                        });
                    }
                }});

            return false;
        });
        $("#clearBtn").click(function () {
            $("#fileMenu").collapse('hide');
            graphD3.clear();
            utils.eventMenu('clear');
            alerts.success("Graph cleaned", 2000);
            return false;
        });
        $(".viewLink").click(function (e) {
            $("#viewDropdown").html("View:" + e.target.text);
            $("#viewMenu").collapse('hide');
            graphD3.viewMode(this.id.substring(4));
            utils.eventMenu('view', 'mode', this.id);
            alerts.success("Graph mode changed to " + e.target.text, 2000);
            return false;
        });
    }

    function loadData() {
        var param = window.location.hash ? window.location.hash.substr(1) : null;
        if (!param) {
            param = 'ipfs-QmUGqiif3ug3Xsk9WQwkjMkkPh6sY7jptKaJ1Xavtxwjo7';
        }
        if (param.startsWith('ipfs-')) {
            var hash = param.substr(5);
            var tm = new utils.Timer();
            var msg = alerts.info("Loading data from the " + upfsUrl + " ...", 30000);
            ipfs.get(hash, function (data) {
//                console.log('data:', data);
                msg.remove();
                if (data) {
                    graphD3.updateWithData(data, null, true);
                    alerts.success("Graph with " + data.nodes.length + " nodes and " + data.links.length + " relations loaded from the " + upfsUrl, 5000);
                    console.log('graphD3.viewMode():', graphD3.viewMode(), $("#view" + graphD3.viewMode()).text());
                    $("#viewDropdown").html("View:" + $("#view" + graphD3.viewMode()).text());
                    utils.gtime('api', 'ipfs.load', tm.time());
                    utils.gevent('graph', 'ipfs.load', 'success');
                } else {
                    alerts.error("Unable to load data from the " + upfsUrl + ". Check that hash provided in the URL is correct: <a href='https://ipfs.io/ipfs/" + hash + "' target='_blank'>" + hash + "</a>");
                    utils.gevent('graph', 'ipfs.load', 'error');
                }
            });
        } else {
            var msg2 = alerts.info("Loading data ...", 30000);
            graphD3.updateFromUrl(expandUrl, {"entity": param, "level": 1, "limit": 50}, null, function (err) {
                msg2.remove();
                if (err) {
                    alerts.error("Unable to load data", 5000);
                } else {
                    alerts.success("Data loaded", 1000);
                    $("#viewDropdown").html("View:" + $("#view" + graphD3.viewMode()).text());
                }
            });
        }
    }


    initMenu();
    loadData();


    return {
        graphD3: graphD3
    };
}

module.exports = initGraph;