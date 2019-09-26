/* *
 *
 *  (c) 2010-2019 Sebastian Bochan, Rafal Sebestjanski
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

import H from '../parts/Globals.js';

/**
 * Internal types
 * @private
 */
declare global {
    namespace Highcharts {
        interface DumbbellPointOptions extends AreaRangePointOptions {
            connectorColor?: ColorType;
            connectorWidth?: number;
            dashStyle?: string;
            startColor?: ColorType;
        }
        interface DumbbellSeriesOptions extends AreaRangeSeriesOptions {
            states?: SeriesStatesOptionsObject<DumbbellSeries>;
            connectorColor?: ColorString;
            connectorWidth?: number;
            groupPadding?: number;
            pointPadding?: number;
            startColor?: ColorType;
        }
        interface SeriesStatesHoverOptionsObject {
            connectorWidthPlus?: number;
        }
        interface SeriesTypesDictionary {
            dumbbell: typeof AreaRangeSeries;
        }
        class DumbbellPoint extends AreaRangePoint {
            public series: DumbbellSeries;
            public options: DumbbellPointOptions;
            public connector: SVGElement;
            public pointWidth: number;
            public pointSetState: AreaRangePoint['setState'];
        }
        class DumbbellSeries extends AreaRangeSeries {
            public startColor?: ColorType;
            public data: Array<DumbbellPoint>;
            public options: DumbbellSeriesOptions;
            public pointClass: typeof DumbbellPoint;
            public points: Array<DumbbellPoint>;
            public trackerGroups: Array<string>;
            public crispCol: ColumnSeries['crispCol'];
            public translatePoint: AreaRangeSeries['translate'];
            public setShapeArgs: ColumnRangeSeries['translate'];
            public seriesDrawPoints: AreaRangeSeries['drawPoints'];
            public drawTracker: TrackerMixin['drawTrackerPoint'];
            public drawGraph: any;
            public crispConnector(points: SVGPathArray): SVGPathArray;
            public getConnectorAttribs(point: DumbbellPoint): SVGAttributes;
            public drawConnector(point: DumbbellPoint): void;
            public getColumnMetrics(): ColumnMetricsObject;
            public translate(): void;
            public drawPoints(): void;
            public markerAttribs(): SVGAttributes;
            public pointAttribs(
                point: DumbbellPoint,
                state: string
            ): SVGAttributes;
        }
    }
}

var pick = H.pick,
    seriesType = H.seriesType,
    seriesTypes = H.seriesTypes,
    seriesProto = H.Series.prototype,
    areaRangeProto = seriesTypes.arearange.prototype,
    columnRangeProto = seriesTypes.columnrange.prototype,
    colProto = seriesTypes.column.prototype,
    areaRangePointProto = areaRangeProto.pointClass.prototype;
/**
 * The dumbbell series is a carteseian series with higher and lower values for
 * each point along an X axis, connected with a line between the values.
 * Requires `highcharts-more.js` and `modules/dumbbell.js`.
 *
 * @sample {highcharts} highcharts/demo/dumbbell/
 *         Dumbbell chart
 * @sample {highcharts} highcharts/series-dumbbell/styled-mode-dumbbell/
 *         Styled mode
 *
 * @extends      plotOptions.arearange
 * @product      highcharts highstock
 * @excluding    fillColor, fillOpacity, lineWidth, stack, stacking,
 *               stickyTracking, trackByArea
 * @since        7.2.0
 * @optionparent plotOptions.dumbbell
 */
seriesType<Highcharts.DumbbellSeries>('dumbbell', 'arearange', {
    /** @ignore-option */
    trackByArea: false,
    /** @ignore-option */
    fillColor: 'none',
    /** @ignore-option */
    lineWidth: 0,
    pointRange: 1,
    /**
     * Pixel width of the line that connects dumbbell point's values.
     *
     * @since     7.2.0
     * @product   highcharts highstock
     */
    connectorWidth: 1,
    /** @ignore-option */
    stickyTracking: false,
    groupPadding: 0.2,
    pointPadding: 0.1,
    /**
     * Color of the start markers in dumbbell graph.
     *
     * @type      {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
     * @since     7.2.0
     * @product   highcharts highstock
     */
    startColor: '${palette.neutralColor80}',
    /**
     * Color of the line that connects dumbbell point's values.
     * By default it is a series' color.
     *
     * @type      {string}
     * @product   highcharts highstock
     * @since     7.2.0
     * @apioption plotOptions.dumbbell.connectorColor
     */
    states: {
        hover: {
            /** @ignore-option */
            lineWidthPlus: 0,
            /**
             * The additional connector line width for a hovered point.
             *
             * @since 7.2.0
             * @product   highcharts highstock
             */
            connectorWidthPlus: 1,
            /** @ignore-option */
            halo: false
        }
    }
}, {
    trackerGroups: ['group', 'markerGroup', 'dataLabelsGroup'],
    drawTracker: H.TrackerMixin.drawTrackerPoint,
    drawGraph: H.noop,
    /**
     * Correct line position by Math.floor instead of round.
     * As a result the line is aligned in the same way as marker
     *
     * @private
     *
     * @function Highcharts.seriesTypes.dumbbell#crispConnector
     *
     * @param {Highcharts.SVGRenderer} this
     *        Highcharts Renderer.
     * @param {Highcharts.SVGPathArray} points
     *        The original points on the format `['M', 0, 0, 'L', 100, 0]`.
     *
     * @return {Highcharts.SVGPathArray}
     *         The original points array, but modified to render crisply.
     *
     *
     */
    crispConnector: function (
        this: Highcharts.SVGRenderer,
        points: Highcharts.SVGPathArray
    ): Highcharts.SVGPathArray {
        if (points[1] === points[4]) {
            // Substract due to #1129. Now bottom and left axis gridlines behave
            // the same.
            points[1] = points[4] = Math.floor(points[1] as any) - 0.5;
        }
        if (points[2] === points[5]) {
            points[2] = points[5] = Math.floor(points[2] as any) + 0.5;
        }
        return points;
    },
    crispCol: colProto.crispCol,
    /**
     * Get connector line path and styles that connects dumbbell point's low and
     * high values.
     * @private
     *
     * @param {Highcharts.Series} this The series of points.
     * @param {Highcharts.Point} point The point to inspect.
     *
     * @return {Highcharts.SVGAttributes} attribs The path and styles.
     */
    getConnectorAttribs: function (
        this: Highcharts.DumbbellSeries,
        point: Highcharts.DumbbellPoint
    ): Highcharts.SVGAttributes {
        var series = this,
            chart = series.chart,
            pointOptions = point.options,
            seriesOptions = series.options,
            xAxis = series.xAxis,
            yAxis = series.yAxis,
            connectorWidth = pick<number|undefined, number>(
                pointOptions.connectorWidth,
                seriesOptions.connectorWidth as any
            ),
            connectorColor = pick<
            Highcharts.ColorType|undefined,
            Highcharts.ColorString|undefined,
            Highcharts.ColorType|undefined,
            Highcharts.ColorType|undefined,
            Highcharts.ColorType
            >(
                pointOptions.connectorColor,
                seriesOptions.connectorColor,
                pointOptions.color,
                point.zone ? point.zone.color : undefined,
                point.color as any
            ),
            connectorWidthPlus = pick(
                seriesOptions.states &&
                seriesOptions.states.hover &&
                seriesOptions.states.hover.connectorWidthPlus,
                1
            ),
            dashStyle = pick(pointOptions.dashStyle, seriesOptions.dashStyle),
            pointTop = pick(point.plotLow, point.plotY),
            pxThreshold = yAxis.toPixels(seriesOptions.threshold || 0, true),
            pointHeight = chart.inverted ?
                yAxis.len - pxThreshold : pxThreshold,
            pointBottom = pick(point.plotHigh, pointHeight),
            attribs: Highcharts.SVGAttributes,
            origProps;

        if (point.state) {
            connectorWidth = connectorWidth + connectorWidthPlus;
        }

        if ((pointTop as any) < 0) {
            pointTop = 0;
        } else if ((pointTop as any) >= yAxis.len) {
            pointTop = yAxis.len;
        }

        if (pointBottom < 0) {
            pointBottom = 0;
        } else if (pointBottom >= yAxis.len) {
            pointBottom = yAxis.len;
        }

        if (point.plotX < 0 || point.plotX > xAxis.len) {
            connectorWidth = 0;
        }

        // Connector should reflect upper marker's zone color
        if (point.upperGraphic) {
            origProps = {
                y: point.y,
                zone: point.zone
            };
            point.y = point.high;
            point.zone = point.zone ? point.getZone() : undefined;
            connectorColor = pick<
            Highcharts.ColorType|undefined,
            Highcharts.ColorString|undefined,
            Highcharts.ColorType|undefined,
            Highcharts.ColorType|undefined,
            Highcharts.ColorType
            >(
                pointOptions.connectorColor,
                seriesOptions.connectorColor,
                pointOptions.color,
                point.zone ? point.zone.color : undefined,
                point.color as any
            );
            H.extend(point, origProps);
        }

        attribs = {
            d: series.crispConnector([
                'M',
                point.plotX,
                pointTop,
                'L',
                point.plotX,
                pointBottom
            ])
        };

        if (!chart.styledMode) {
            attribs.stroke = connectorColor;
            attribs['stroke-width'] = connectorWidth;
            if (dashStyle) {
                attribs.dashstyle = dashStyle;
            }
        }

        return attribs;
    },
    /**
     * Draw connector line that connects dumbbell point's low and high values.
     * @private
     *
     * @param {Highcharts.Series} this The series of points.
     * @param {Highcharts.Point} point The point to inspect.
     *
     * @return {void}
     */
    drawConnector: function (
        this: Highcharts.DumbbellSeries,
        point: Highcharts.DumbbellPoint
    ): void {
        var series = this,
            animationLimit = pick(series.options.animationLimit, 250),
            verb = series.chart.pointCount < animationLimit ?
                'animate' : 'attr';

        if (!point.connector) {
            point.connector = series.chart.renderer.path()
                .addClass('highcharts-lollipop-stem')
                .attr({
                    zIndex: -1
                })
                .add(series.markerGroup);
        }

        point.connector[verb](this.getConnectorAttribs(point));
    },
    /**
     * Return the width and x offset of the dumbbell adjusted for grouping,
     * groupPadding, pointPadding, pointWidth etc.
     *
     * @private
     *
     * @function Highcharts.seriesTypes.column#getColumnMetrics
     *
     * @param {Highcharts.Series} this The series of points.
     *
     * @return {Highcharts.ColumnMetricsObject} metrics shapeArgs
     *
     */
    getColumnMetrics: function (
        this: Highcharts.DumbbellSeries
    ): Highcharts.ColumnMetricsObject {
        var metrics = colProto.getColumnMetrics.apply(this, arguments as any);

        metrics.offset = metrics.offset + metrics.width / 2;

        return metrics;
    },
    translatePoint: areaRangeProto.translate,
    setShapeArgs: columnRangeProto.translate,
    /**
     * Translate each point to the plot area coordinate system and find
     * shape positions
     *
     * @private
     *
     * @function Highcharts.seriesTypes.dumbbell#translate
     *
     * @param {Highcharts.Series} this The series of points.
     *
     * @return {void}
     */
    translate: function (
        this: Highcharts.DumbbellSeries
    ): void {
        // Calculate shapeargs
        this.setShapeArgs.apply(this);

        // Calculate point low / high values
        this.translatePoint.apply(this, arguments as any);

        // Correct x position
        this.points.forEach(function (point): void {
            var shapeArgs = point.shapeArgs,
                pointWidth = point.pointWidth;

            point.plotX = (shapeArgs as any).x;
            (shapeArgs as any).x = point.plotX - pointWidth / 2;
            (point.tooltipPos as any) = null;
        });
    },
    seriesDrawPoints: areaRangeProto.drawPoints,
    /**
     * Extend the arearange series' drawPoints method by applying a connector
     * and coloring markers.
     * @private
     *
     * @function Highcharts.Series#drawPoints
     *
     * @param {Highcharts.Series} this The series of points.
     *
     * @return {void}
     */
    drawPoints: function (
        this: Highcharts.DumbbellSeries
    ): void {
        var series = this,
            chart = series.chart,
            pointLength = series.points.length,
            seriesStartColor = series.startColor = series.options.startColor,
            i = 0,
            lowerGraphicColor,
            point,
            zoneColor;

        this.seriesDrawPoints.apply(series, arguments as any);

        // Draw connectors and color upper markers
        while (i < pointLength) {
            point = series.points[i];

            series.drawConnector(point);

            if (point.upperGraphic) {
                (point.upperGraphic.element as any).point = point;
                point.upperGraphic.addClass('highcharts-lollipop-high');
            }
            (point.connector.element as any).point = point;

            if (point.lowerGraphic) {
                zoneColor = point.zone && point.zone.color;
                lowerGraphicColor = pick(
                    point.options.startColor,
                    seriesStartColor,
                    point.options.color,
                    zoneColor,
                    point.color,
                    series.color
                );
                if (!chart.styledMode) {
                    point.lowerGraphic.attr({
                        fill: lowerGraphicColor
                    });
                }
                point.lowerGraphic.addClass('highcharts-lollipop-low');
            }
            i++;
        }
    },
    /**
     * Get non-presentational attributes for a point. Used internally for
     * both styled mode and classic. Set correct position in link with connector
     * line.
     *
     * @see Series#pointAttribs
     *
     * @function Highcharts.Series#markerAttribs
     *
     * @param {Highcharts.Series} this The series of points.
     *
     * @return {Highcharts.SVGAttributes}
     *         A hash containing those attributes that are not settable from
     *         CSS.
     */
    markerAttribs: function (
        this: Highcharts.DumbbellSeries
    ): Highcharts.SVGAttributes {
        var ret = areaRangeProto.markerAttribs.apply(this, arguments as any);

        ret.x = Math.floor(ret.x);
        ret.y = Math.floor(ret.y);

        return ret;
    },
    /**
     * Get presentational attributes
     *
     * @private
     * @function Highcharts.seriesTypes.column#pointAttribs
     *
     * @param {Highcharts.Series} this The series of points.
     * @param {Highcharts.Point} point The point to inspect.
     * @param {string} state current state of point (normal, hover, select)
     *
     * @return {Highcharts.SVGAttributes} pointAttribs SVGAttributes
     */
    pointAttribs: function (
        this: Highcharts.DumbbellSeries,
        point: Highcharts.DumbbellPoint,
        state: string
    ): Highcharts.SVGAttributes {
        var pointAttribs;

        pointAttribs = seriesProto.pointAttribs.apply(this, arguments as any);
        if (state === 'hover') {
            delete pointAttribs.fill;
        }

        return pointAttribs;
    }
}, {
    // seriesTypes doesn't inherit from arearange point proto so put below
    // methods rigidly.
    destroyElements: areaRangePointProto.destroyElements,
    isValid: areaRangePointProto.isValid,
    pointSetState: areaRangePointProto.setState,
    /**
     * Set the point's state extended by have influence on the connector
     * (between low and high value).
     *
     * @private
     * @param {Highcharts.Point} this The point to inspect.
     *
     * @return {void}
     */
    setState: function (
        this: Highcharts.DumbbellPoint
    ): void {
        var point = this,
            series = point.series,
            chart = series.chart,
            seriesStartColor = series.options.startColor,
            pointOptions = point.options,
            pointStartColor = pointOptions.startColor,
            zoneColor = point.zone && point.zone.color,
            lowerGraphicColor = pick(
                pointStartColor,
                seriesStartColor,
                pointOptions.color,
                zoneColor,
                point.color,
                series.color
            ),
            verb = 'attr',
            upperGraphicColor,
            origProps;

        this.pointSetState.apply(this, arguments);

        if (!this.state) {
            verb = 'animate';
            if (point.lowerGraphic && !chart.styledMode) {
                point.lowerGraphic.attr({
                    fill: lowerGraphicColor
                });
                if (point.upperGraphic) {
                    origProps = {
                        y: point.y,
                        zone: point.zone
                    };
                    point.y = point.high;
                    point.zone = point.zone ? point.getZone() : undefined;
                    upperGraphicColor = pick(
                        point.marker ? point.marker.fillColor : undefined,
                        pointOptions.color,
                        point.zone ? point.zone.color : undefined,
                        point.color
                    );
                    point.upperGraphic.attr({
                        fill: upperGraphicColor
                    });
                    H.extend(point, origProps);
                }
            }
        }

        point.connector[verb](series.getConnectorAttribs(point));
    }
});
