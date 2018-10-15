/* global d3, document */
/* jshint latedef:nofunc */
'use strict';

var Utils = require('./utils');

function transformView() {
    var utils = new Utils();
    var container, svgNode, lniksNode, svgVisibleRect, minDistToRedraw;

    function init(_container) {
        container = _container;
        svgNode = document.getElementById("graph-svg");
        lniksNode = d3.select('.links').node();
    }
    function transformNodes(node) {
        if (node) {
            node.attr('transform', function (d) {
                return 'translate(' + d.x + ', ' + d.y + ')';
            });
        }
    }

    function transformLinks(svgLinks, nodeRadius, arrowSize) {
        if (svgLinks) {
            var containerRect = container.node().getBoundingClientRect();
            var p = containerToSVG(-nodeRadius, -nodeRadius);
            var r = containerToSVG(containerRect.width + nodeRadius, containerRect.height + nodeRadius);
            svgVisibleRect = {left: p.x, top: p.y, right: r.x, bottom: r.y};
            minDistToRedraw = (svgVisibleRect.right - svgVisibleRect.left) / (containerRect.width + nodeRadius * 2);
            var link = svgLinks.selectAll('.link').filter(needRedraw);
//            console.log("total:", svgLinks.selectAll('.link').size(), ',needRedraw:', link.size(), ', minDistToRedraw:', minDistToRedraw);
            transformLinksLines(link);
            transformLinksTexts(link.selectAll('.text'));
            transformLinksOutlines(link, nodeRadius, arrowSize);
            transformLinksOverlays(link.selectAll('.overlay'));
            link.each(function (n) {
                n.sx = n.source.x;
                n.sy = n.source.y;
                n.tx = n.target.x;
                n.ty = n.target.y;
            });
        }
    }

    function needRedraw(link) {
        if (!nodeMoved(link.source.x, link.source.y, link.sx, link.sy) &&
                !nodeMoved(link.target.x, link.target.y, link.tx, link.ty)) {
            return false;
        }
        return isVisible(link.source) || isVisible(link.target);
    }

    function nodeMoved(curX, curY, lastX, lastY) {
        return !(utils.isNumber(lastX) && Math.abs(curX - lastX) <= minDistToRedraw && Math.abs(curY - lastY) <= minDistToRedraw);
    }

    function isVisible(n) {
        return n.x > svgVisibleRect.left && n.x < svgVisibleRect.right &&
                n.y > svgVisibleRect.top && n.y < svgVisibleRect.bottom;
    }

    function containerToSVG(containerX, containerY) {
        var svgPount = svgNode.createSVGPoint();
        svgPount.x = containerX;
        svgPount.y = containerY;
        return svgPount.matrixTransform(document.getElementById("links-svg").getScreenCTM().inverse());
    }

    function transformLinksLines(link) {
        //console.log('transformLinksLines: ',link);
        link.attr('transform', function (d) {
            var angle = rotation(d.source, d.target);
            return 'translate(' + d.source.x + ', ' + d.source.y + ') rotate(' + angle + ')';
        });

    }

    function transformLinksOutlines(link, nodeRadius, arrowSize) {
        link.each(function () {
            var rel = d3.select(this),
                    outline = rel.select('.outline'),
                    text = rel.select('.text');
//                    bbox = text.node().getBBox(),
//                    padding = 3;

            outline.attr('d', function (d) {
                var center = {x: 0, y: 0},
                        angle = rotation(d.source, d.target),
                        textBoundingBox = text.node().getBBox(),
                        textPadding = 4;
                var u = unitaryVector(d.source, d.target);
                if (isNaN(u.x) || isNaN(u.y)) {
                    return '';
                }
                var textMargin = {x: (d.target.x - d.source.x - (textBoundingBox.width + textPadding) * u.x) * 0.5, y: (d.target.y - d.source.y - (textBoundingBox.width + textPadding) * u.y) * 0.5};
                var n = unitaryNormalVector(d.source, d.target);
                if (isNaN(n.x) || isNaN(n.y)) {
                    return '';
                }
                var rotatedPointA1 = rotatePoint(center, {x: 0 + (nodeRadius + 1) * u.x - n.x, y: 0 + (nodeRadius + 1) * u.y - n.y}, angle),
                        rotatedPointB1 = rotatePoint(center, {x: textMargin.x - n.x, y: textMargin.y - n.y}, angle),
                        rotatedPointC1 = rotatePoint(center, {x: textMargin.x, y: textMargin.y}, angle),
                        rotatedPointD1 = rotatePoint(center, {x: 0 + (nodeRadius + 1) * u.x, y: 0 + (nodeRadius + 1) * u.y}, angle),
                        rotatedPointA2 = rotatePoint(center, {x: d.target.x - d.source.x - textMargin.x - n.x, y: d.target.y - d.source.y - textMargin.y - n.y}, angle),
                        rotatedPointB2 = rotatePoint(center, {x: d.target.x - d.source.x - (nodeRadius + 2) * u.x - n.x - u.x * arrowSize, y: d.target.y - d.source.y - (nodeRadius + 2) * u.y - n.y - u.y * arrowSize}, angle),
                        rotatedPointC2 = rotatePoint(center, {x: d.target.x - d.source.x - (nodeRadius + 2) * u.x - n.x + (n.x - u.x) * arrowSize, y: d.target.y - d.source.y - (nodeRadius + 2) * u.y - n.y + (n.y - u.y) * arrowSize}, angle),
                        rotatedPointD2 = rotatePoint(center, {x: d.target.x - d.source.x - (nodeRadius + 2) * u.x, y: d.target.y - d.source.y - (nodeRadius + 2) * u.y}, angle),
                        rotatedPointE2 = rotatePoint(center, {x: d.target.x - d.source.x - (nodeRadius + 2) * u.x + (-n.x - u.x) * arrowSize, y: d.target.y - d.source.y - (nodeRadius + 2) * u.y + (-n.y - u.y) * arrowSize}, angle),
                        rotatedPointF2 = rotatePoint(center, {x: d.target.x - d.source.x - (nodeRadius + 2) * u.x - u.x * arrowSize, y: d.target.y - d.source.y - (nodeRadius + 2) * u.y - u.y * arrowSize}, angle),
                        rotatedPointG2 = rotatePoint(center, {x: d.target.x - d.source.x - textMargin.x, y: d.target.y - d.source.y - textMargin.y}, angle);

                return 'M ' + rotatedPointA1.x + ' ' + rotatedPointA1.y +
                        ' L ' + rotatedPointB1.x + ' ' + rotatedPointB1.y +
                        ' L ' + rotatedPointC1.x + ' ' + rotatedPointC1.y +
                        ' L ' + rotatedPointD1.x + ' ' + rotatedPointD1.y +
                        ' Z M ' + rotatedPointA2.x + ' ' + rotatedPointA2.y +
                        ' L ' + rotatedPointB2.x + ' ' + rotatedPointB2.y +
                        ' L ' + rotatedPointC2.x + ' ' + rotatedPointC2.y +
                        ' L ' + rotatedPointD2.x + ' ' + rotatedPointD2.y +
                        ' L ' + rotatedPointE2.x + ' ' + rotatedPointE2.y +
                        ' L ' + rotatedPointF2.x + ' ' + rotatedPointF2.y +
                        ' L ' + rotatedPointG2.x + ' ' + rotatedPointG2.y +
                        ' Z';
            });
        });
    }

    function transformLinksOverlays(linkOverlay) {
        linkOverlay.attr('d', function (d) {
            var center = {x: 0, y: 0},
                    angle = rotation(d.source, d.target),
                    n1 = unitaryNormalVector(d.source, d.target),
                    n = unitaryNormalVector(d.source, d.target, 50);
            if (isNaN(n.x) || isNaN(n.y)) {
                return '';
            }
            var rotatedPointA = rotatePoint(center, {x: 0 - n.x, y: 0 - n.y}, angle),
                    rotatedPointB = rotatePoint(center, {x: d.target.x - d.source.x - n.x, y: d.target.y - d.source.y - n.y}, angle),
                    rotatedPointC = rotatePoint(center, {x: d.target.x - d.source.x + n.x - n1.x, y: d.target.y - d.source.y + n.y - n1.y}, angle),
                    rotatedPointD = rotatePoint(center, {x: 0 + n.x - n1.x, y: 0 + n.y - n1.y}, angle);

            return 'M ' + rotatedPointA.x + ' ' + rotatedPointA.y +
                    ' L ' + rotatedPointB.x + ' ' + rotatedPointB.y +
                    ' L ' + rotatedPointC.x + ' ' + rotatedPointC.y +
                    ' L ' + rotatedPointD.x + ' ' + rotatedPointD.y +
                    ' Z';
        });
    }

    function transformLinksTexts(linkText) {
        linkText.attr('transform', function (d) {
            var angle = (rotation(d.source, d.target) + 360) % 360,
                    mirror = angle > 90 && angle < 270,
                    center = {x: 0, y: 0},
                    n = unitaryNormalVector(d.source, d.target);
            if (isNaN(n.x) || isNaN(n.y)) {
                return '';
            }
            var nWeight = mirror ? 2 : -3,
                    point = {x: (d.target.x - d.source.x) * 0.5 + n.x * nWeight, y: (d.target.y - d.source.y) * 0.5 + n.y * nWeight},
                    rotatedPoint = rotatePoint(center, point, angle);
            if (isNaN(rotatedPoint.x)) {
                console.log('tra', rotatedPoint, center, point, angle, d.source.x, d.target.x, n);
            }
            return 'translate(' + rotatedPoint.x + ', ' + rotatedPoint.y + ') rotate(' + (mirror ? 180 : 0) + ')';
        });
    }

    function unitaryNormalVector(source, target, newLength) {
        var center = {x: 0, y: 0},
                vector = unitaryVector(source, target, newLength);

        return rotatePoint(center, vector, 90);
    }

    function unitaryVector(source, target, newLength) {
        var length = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)) / Math.sqrt(newLength || 1);

        return {
            x: (target.x - source.x) / length,
            y: (target.y - source.y) / length
        };
    }

    function rotatePoint(c, p, angle) {
        var radians = (Math.PI / 180) * angle,
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                nx = (cos * (p.x - c.x)) + (sin * (p.y - c.y)) + c.x,
                ny = (cos * (p.y - c.y)) - (sin * (p.x - c.x)) + c.y;
        return {x: nx, y: ny};
    }

    function rotation(source, target) {
        return Math.atan2(target.y - source.y, target.x - source.x) * 180 / Math.PI;
    }

    return {
        init: init,
        transformNodes: transformNodes,
        transformLinks: transformLinks
    };
}

module.exports = transformView;