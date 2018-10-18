/* global d3 */
/* jshint latedef:nofunc */
'use strict';

function DrawGraphElements() {
    var container, opt;

    function init(_container, options) {
        container = _container;
        opt = options;
    }

    function appendNodesToGraph(newNodes) {
        var nodeG = appendNode(newNodes);
        appendRingToNode(nodeG);
        appendOutlineToNode(nodeG);
        appendTextToNode(nodeG);
        return nodeG;
    }

    function appendLinksToGraph(newLinks) {
        var linkSvg = appendLink(newLinks);
        appendOutlineToLink(linkSvg);
        appendOverlayToLink(linkSvg);
//        appendTextToLink(linkSvg);
    }

    function appendNode(node) {
        return node
                .append('g')
                .attr('class', function (d) {
                    var classes = 'node';
                    if (opt.highlights) {
                        for (var i = 0; i < opt.highlights.length; i++) {
                            var h = opt.highlights[i];
                            if (d.type === h.class && d.prop[h.property] === h.value) {
                                classes += ' node-highlighted';
                                break;
                            }
                        }
                    }
                    return classes;
                })
                .on('click', opt.handlers.node.onClick)
                .on('dblclick', opt.handlers.node.onDblClick)
                .on('mouseenter', opt.handlers.node.onMouseEnter)
                .on('mouseleave', opt.handlers.node.onMouseLeave)
                .call(d3.drag()
                        .on('start', opt.handlers.node.onDragStart)
                        .on('drag', opt.handlers.node.onDrag)
                        .on('end', opt.handlers.node.onDragEnd));
    }

    function appendRingToNode(node) {
        return node.append('circle')
                .attr('class', 'ring')
                .attr('r', opt.nodeRadius * 1.16)
                .append('title').text(toTitleString);
    }

    function toTitleString(d) {
        return d.type + ' ' + JSON.stringify(d.prop).replace(/\"([^(\")"]+)\":/g, " $1: ");
    }

    function appendOutlineToNode(node) {
        return node.append('circle')
                .attr('class', 'outline')
                .attr('r', opt.nodeRadius)
                .style('fill', opt.entityColor)
                .style('stroke', nodeStrokeColor)
                .append('title')
                .text(toTitleString);
    }

    function appendTextToNode(node) {
        return node.filter(nodeHasText)
                .append('text')
                .attr('class', 'text')
                .attr('fill', 'black')
                .attr('font-size', '10px')
                .attr('pointer-events', 'none')
                .attr('text-anchor', 'middle')
                .attr('y', '4px')
                .html(getNodeText);
    }

    function appendLink(newLinks) {
        return newLinks
                .append('g')
                .attr('class', 'link')
                .on('click', opt.handlers.link.onClick)
                .on('dblclick', opt.handlers.link.onDblClick)
                .on('mouseenter', opt.handlers.link.onMouseEnter)
                .on('mouseleave', opt.handlers.link.onMouseLeave);
    }

    function appendOutlineToLink(r) {
        return r.append('path')
                .attr('class', 'outline')
                .attr('fill', opt.entityColor)
                .attr('stroke', opt.entityColor);
    }

    function appendOverlayToLink(r) {
        return r.append('path')
                .attr('class', 'overlay');
    }

    function appendTextToLink(r) {
        return r.append('text')
                .attr('class', 'text')
                .attr('fill', opt.entityColor)
                .attr('font-size', '8px')
                .attr('pointer-events', 'none')
                .attr('text-anchor', 'middle')
                .text(getLinkText);
    }

    function updateColors() {
        var links = d3.selectAll(".link");
        links.selectAll('.outline').style('fill', opt.entityColor).style('stroke', opt.entityColor);
        links.selectAll('.text').style('fill', opt.entityColor);
        var nodes = d3.selectAll(".node");
        nodes.selectAll('.outline').style('fill', opt.entityColor).style('stroke', nodeStrokeColor);
    }

    function nodeStrokeColor(d) {
        return d3.rgb(opt.entityColor(d)).darker(1);
    }
    function nodeHasText(d) {
        return getNodeText(d) !== undefined;
    }

    function getNodeText(d) {
        return (d.prop.hasOwnProperty('amount')) ? d.prop.amount.toString().substr(0, 8) : (d.prop.block) ? d.prop.block : (d.prop.address) ? d.prop.address.substr(0, 3) + '..' + d.prop.address.substr(d.prop.address.length - 3) : d.id;
    }

    function linkHasText(d) {
        return getLinkText(d) !== undefined;
    }

    function getLinkText(d) {
        return d.type !== 'address' ? d.type : undefined;
    }

    function clear() {
        container.selectAll(".node").remove();
        container.selectAll(".link").remove();
    }

    return {
        init: init,
        appendNodesToGraph: appendNodesToGraph,
        appendLinksToGraph: appendLinksToGraph,
        appendTextToLink: appendTextToLink,
        updateColors: updateColors,
        nodeHasText: nodeHasText,
        getNodeText: getNodeText,
        linkHasText: linkHasText,
        getLinkText: getLinkText,
        clear: clear
    };
}

module.exports = DrawGraphElements;
