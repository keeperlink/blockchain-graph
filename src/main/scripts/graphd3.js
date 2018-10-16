/* global d3, document */
/* jshint latedef:nofunc */
'use strict';
var TransformView = require('./transformView');
var Utils = require('./utils');
var InfoPanel = require('./infoPanel');
var DrawGraphElements = require('./drawGraphElements');
var DataPorter = require('./dataPorter');

function GraphD3(_selector, _options) {
    var transformView = new TransformView();
    var utils = new Utils();
    var infoPanel = new InfoPanel();
    var drawGraphElements = new DrawGraphElements();
    var dataPorter = new DataPorter();

    var container, simulation, svg, svgg, svgNodes, svgLinks;
    var nodeClasses2colors = {}, linkClasses2colors = {}, numClasses = 0;
    var nodes = [], links = [];
    var zoom = d3.zoom();
    var options = {
        viewMode: "",
        arrowSize: 6,
        colors: colors(),
        nodeColors: {},
        linkColors: {},
        highlights: undefined,
        data: undefined,
        dataUrl: undefined,
        nodeRadius: 25,
        defaultLinkColor: '#a5abb6'
    };

//******************************************************************************
// Initialization

    function init(_options) {
        utils.merge(options, _options);
        createGraphContainer();
        infoPanel.init(entityColor);
        drawGraphElements.init(container, {
            highlights: options.highlights,
            nodeRadius: options.nodeRadius,
            entityColor: entityColor,
            handlers: {
                node: {
                    onClick: onNodeClick,
                    onDblClick: onNodeDblClick,
                    onMouseEnter: onNodeMouseEnter,
                    onMouseLeave: onNodeMouseLeave,
                    onDragStart: onNodeDragStart,
                    onDrag: onNodeDrag,
                    onDragEnd: onNodeDragEnd
                },
                link: {
                    onClick: infoPanel.updateInfo,
                    onDblClick: options.onLinkDoubleClick,
                    onMouseEnter: onLinkMouseEnter,
                    onMouseLeave: onLinkMouseLeave
                }
            }
        });
        transformView.init(container, drawGraphElements);
        simulation = d3.forceSimulation()
                .force("charge", d3.forceManyBody().strength(-30))
                .force("link", d3.forceLink(links).distance(100).id(function (d) {
                    return d.id;
                }))
                .force('collide', d3.forceCollide(options.nodeRadius * 2).strength(0.2))
                .on('tick', onSimulationTick)
                .on('end', onSimulationStop);
    }

    function createGraphContainer() {
        container = d3.select('.graphD3');
        if (container.empty()) {
            container = d3.select('body')
                    .append('div')
                    .attr('class', 'graphD3');
        }
        container.attr('class', 'graphd3').html('');

        svg = container.append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('class', 'graphd3-graph')
                .call(zoom.on('zoom', function () {
                    svgg.attr('transform', d3.event.transform.toString());
                    onSimulationTick();
                }))
                .call(d3.drag()
                        .on('start', onSimulationTick)
                        .on('drag', onSimulationTick)
                        .on('end', onSimulationTick))
                .on('dblclick.zoom', undefined)
                .on('click', onGraphClick);

        svgg = svg.append('g');

        svgLinks = svgg.append('g')
                .attr('class', 'links')
                .attr('id', 'links-svg');

        svgNodes = svgg.append('g')
                .attr('class', 'nodes');
    }


//******************************************************************************
// Event Handlers

    function onSimulationTick() {
//        var tm = new utils.Timer();
        transformView.transformNodes();
//        var nodesTime = tm.time();
        transformView.transformLinks(options.nodeRadius, options.arrowSize);
//        console.log("Tick time:", nodesTime, tm.time());
    }

    function onSimulationStop() {
        //simulation.alpha(1).restart();
    }

    function onGraphClick() {
//        console.log(d3.event.target, svg.node());
        if (d3.event.target === svg.node()) {
            simulation.alpha(1).restart();
        }
    }

    function onNodeClick(d) {
        if (!d.clickedRecently) {
            d.clickedRecently = true;
            delete d.dblClicked;
            setTimeout(function () {
                if (!d.dblClicked) {
                    unstickNode(d);
                }
                delete d.clickedRecently;
            }, 300);
        }
        infoPanel.updateInfo(d);
        utils.callIfDefined(options.onNodeClick, d);
    }

    function onNodeDblClick(d) {
        d.dblClicked = true;
        stickNode(d);

        utils.callIfDefined(options.onNodeDoubleClick, d);
    }

    function onNodeMouseEnter(d) {
        stickNode(d, true);
        utils.callIfDefined(options.onNodeMouseEnter, d);
    }

    function onNodeMouseLeave(d) {
        unstickNode(d, true);
        utils.callIfDefined(options.onNodeMouseLeave, d);
    }

    function onNodeDragStart(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0.3).restart();
        }
        stickNode(d);
    }

    function onNodeDrag(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function onNodeDragEnd(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0);
        }
    }

    function onLinkMouseEnter(d) {
        stickNode(d.source, true);
        stickNode(d.target, true);
    }

    function onLinkMouseLeave(d) {
        unstickNode(d.source, true);
        unstickNode(d.target, true);
    }

//******************************************************************************
// Various Actions

    function clear() {
        nodes = [];
        links = [];
        drawGraphElements.clear();
        infoPanel.clear();
        updateSimulation();
    }

    function stickNode(d, temp) {
        if (!temp || !d.fx) {
            d.fx = d.x;
            d.fy = d.y;
            d.tmpStick = temp;
        }
    }

    function unstickNode(d, temp) {
        if (!temp || d.tmpStick) {
            delete d.fx;
            delete d.fy;
        }
    }

    function unstickAll() {
        nodes.forEach(function (d) {
            unstickNode(d);
        });
        restartSimulation();
    }

//******************************************************************************
// Coloring

    function updateSimulation(restart){
        simulation.nodes(nodes);
        simulation.force('link').links(links);
        if (restart){
            restartSimulation();
        }
    }

    function restartSimulation() {
        simulation.alpha(1).restart();
    }

    function nodeColor(cls) {
        var color = nodeClasses2colors[cls];
        if (!color) {
            color = options.nodeColors[cls];
            if (!color) {
                color = options.colors[numClasses % options.colors.length];
            }
            nodeClasses2colors[cls] = color;
            numClasses++;
        }
        return color;
    }

    function nodeColorEntity(d) {
        return nodeColor(d.type);
    }

    function linkColor(cls) {
        var color = linkClasses2colors[cls];
        if (!color) {
            color = options.linkColors[cls];
            if (!color) {
                color = defaultColor();
            }
            linkClasses2colors[cls] = color;
        }
        return color;
    }

    function linkColorEntity(d) {
        return linkColor(d.type);
    }

    function entityColor(d) {
        return d.source ? linkColorEntity(d) : nodeColorEntity(d);
    }

    function colors() {
        // d3.schemeCategory10,
        // d3.schemeCategory20,
        return [
            '#68bdf6', // light blue
            '#6dce9e', // green #1
            '#faafc2', // light pink
            '#f2baf6', // purple
            '#ff928c', // light red
            '#fcea7e', // light yellow
            '#ffc766', // light orange
            '#405f9e', // navy blue
            '#a5abb6', // dark gray
            '#78cecb', // green #2,
            '#b88cbb', // dark purple
            '#ced2d9', // light gray
            '#e84646', // dark red
            '#fa5f86', // dark pink
            '#ffab1a', // dark orange
            '#fcda19', // dark yellow
            '#797b80', // black
            '#c9d96f', // pistacchio
            '#47991f', // green #3
            '#70edee', // turquoise
            '#ff75ea'  // pink
        ];
    }

    function defaultColor() {
        return options.defaultLinkColor;
    }

//******************************************************************************
// Data updaters

    function updateFromUrl(url, body, pos, callback) {
        var tm = new utils.Timer();
        body.viewMode = options.viewMode;
        body.existing = nodes.map(function (d) {
            return d.id;
        }).concat(links.map(function (d) {
            return d.id;
        }));
        if (!pos) {
            var cli = svg.node().parentElement;
            pos = transformView.containerToSVG(cli.clientWidth / 2, cli.clientHeight / 2);
        }
        d3.json(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then(function (data) {
            updateWithData(data, pos);
            utils.gtime('api', 'expand', tm.time());
            if (callback) {
                if (data) {
                    callback(null, data);
                } else {
                    callback("Unable to load data", data);
                }
            }
        }).catch(function (err) {
            console.log("updateFromUrl: err:", err);
            if (callback) {
                callback("Unable to load data. Server error");
            }
        });
    }

    function updateWithData(externalData, pos, clearOldData) {
        var data = dataPorter.importData(externalData);
        if (clearOldData) {
            clear();
        }
        if (pos) {
//            console.log("updateWithData() pos:", pos);
            data.nodes.forEach(function (n) {
                n.x = pos.x;
                n.y = pos.y;
            });
        }
        if (data.transform) {
            var t = data.transform;
            svg.call(zoom.transform, d3.zoomIdentity.translate(t.x, t.y).scale(t.k));
        }
        updateLinks(data.links);
        updateNodes(data.nodes);
        simulation.nodes(nodes);
        simulation.force('link').links(links);
        simulation.alpha(1).restart();
    }

    function getExportData() {
        return dataPorter.exportData({
            nodes: nodes,
            links: links,
            transform: svgg.attr('transform')
        });
    }

    function updateNodes(newNodesData) {
        var ids = nodes.map(function (d) {
            return d.id;
        });
        Array.prototype.push.apply(nodes, newNodesData.filter(function (a) {
            return ids.indexOf(a.id) === -1;
        }));
        var newNodes = container.select('.nodes').selectAll('.node')
                .data(nodes, function (d) {
                    return d.id;
                }).enter();
        drawGraphElements.appendNodesToGraph(newNodes);
    }

    function updateLinks(newLinksData) {
        var ids = links.map(function (d) {
            return d.id;
        });
        Array.prototype.push.apply(links, newLinksData.filter(function (a) {
            return ids.indexOf(a.id) === -1;
        }));

        var newLinks = container.select('.links').selectAll('.link')
                .data(links, function (d) {
                    return d.id;
                }).enter();
        drawGraphElements.appendLinksToGraph(newLinks);
    }

//******************************************************************************

    init(_selector, _options);

    return {
        viewMode: function (v) {
            if (v) {
                options.viewMode = v;
            }
            return options.viewMode;
        },
        size: function () {
            return {
                nodes: nodes.length,
                links: links.length
            };
        },
        updateWithData: updateWithData,
        updateFromUrl: updateFromUrl,
        clear: clear,
        clearInfo: infoPanel.clear,
        unstickAll: unstickAll,
        getExportData: getExportData,
        version: function () {
            return '0.1.0';
        }
    };
}

module.exports = GraphD3;
