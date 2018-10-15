/* global d3 */
/* jshint latedef:nofunc */
'use strict';

function DrawGraphElements() {
    var opt;

    function init(options) {
        opt = options;
    }

    function appendNodesToGraph(newNodes) {
        var nodeSvg = appendNode(newNodes);
        appendRingToNode(nodeSvg);
        appendOutlineToNode(nodeSvg);
        appendTextToNode(nodeSvg);
        return nodeSvg;
    }

    function appendLinksToGraph(newLinks) {
        var linkSvg = appendLink(newLinks);
        appendOutlineToLink(linkSvg);
        appendOverlayToLink(linkSvg);
        appendTextToLink(linkSvg);
    }

    function appendNode(node) {
        return node
                .append('g')
                .attr('class', function (d) {
                    var i, classes = 'node';
                    if (opt.highlights) {
                        for (i = 0; i < opt.highlights.length; i++) {
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
                .style('stroke', function (d) {
                    return d3.rgb(opt.entityColor(d)).darker(1);
                })
                .append('title')
                .text(toTitleString);
    }

    function appendTextToNode(node) {
        return node.append('text')
                .attr('class', function (d) {
                    return 'text';
                })
                .attr('fill', 'black')
                .attr('font-size', '10px')
                .attr('pointer-events', 'none')
                .attr('text-anchor', 'middle')
                .attr('y', '4px')
                .html(function (d) {
                    return (d.prop.hasOwnProperty('amount')) ? d.prop.amount.toString().substring(0, 8) : (d.prop.block) ? d.prop.block : d.id;
                });
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
                .text(function (d) {
                    return d.type;
                });
    }

    return {
        init: init,
        appendNodesToGraph: appendNodesToGraph,
        appendLinksToGraph: appendLinksToGraph

    };
}

module.exports = DrawGraphElements;
