/* global $, d3, FileReader, window, document */
/* j s h int latedef:nofunc */
'use strict';

var GraphD3 = require('./graphd3');
var Utils = require('./utils');
var Alerts = require('./alerts');
var Ipfs = require('./ipfs');

function initGraph() {
    var utils = new Utils();
    var alerts = new Alerts();
    var ipfs = new Ipfs(['https://ipfs.btcgraph.org:5001', 'https://ipfs.infura.io:5001']);
    var upfsUrl = "<a href='https://ipfs.io' target='_blank'>IPFS</a>";

    var baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8090/api/' : '/api/';

    var graphD3 = new GraphD3({
        viewMode: "TxOut",
        nodeRadius: 25,
        nodeColors: {
            "block": "#405f9e",
            "transaction": "#f2baf6",
            "output": "#fcea7e"
        },
        linkColors: {
            "input": "#6dce9e",
            "output": "#ff928c"
        },
        onNodeDoubleClick: function (node) {
            graphD3.updateFromUrl(baseUrl + 'node/expand', {"entityId": node.id, "level": 1, "limit": 50}, {x: node.x, y: node.y});
            utils.gevent('graph', 'expand');
        }
    });

    function initMenu() {
        $("#addButton").click(function () {
            var param = $("#addInput").val();
            graphD3.updateFromUrl(baseUrl + 'node/expand', {"entity": param, "level": 1, "limit": 50});
            utils.eventMenu('add', 'param', param);
            return false;
        });
        $("#saveBtn").click(function () {
            $("#fileMenu").collapse('hide');
            utils.downloadObjectAsJson(graphD3.data(), "blockchain.graph", function (fileName) {
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
            ipfs.add(JSON.stringify(graphD3.data()), function (hash) {
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
            param = '587430e52af2cec98b3fd543083469ffa7a5f5dd2bd569898a7897a64e2eb031';
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
                    alerts.success("Graph loaded from the " + upfsUrl, 3000);
                    utils.gtime('api', 'ipfs.load', tm.time());
                    utils.gevent('graph', 'ipfs.load', 'success');
                } else {
                    alerts.error("Unable to load data from the " + upfsUrl + ". Check that hash provided in the URL is correct: <a href='https://ipfs.io/ipfs/" + hash + "' target='_blank'>" + hash + "</a>");
                    utils.gevent('graph', 'ipfs.load', 'error');
                }
            });
        } else {
            var msg2 = alerts.info("Loading data ...", 30000);
            graphD3.updateFromUrl(baseUrl + 'node/expand', {"entity": param, "level": 1, "limit": 50}, null, function (err) {
                msg2.remove();
                if (err) {
                    alerts.error("Unable to load data", 5000);
                } else {
                    alerts.success("Data loaded", 1000);
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