/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import d3 from 'd3';
import { difference, memoize, zipObject } from 'lodash';
import { TimeSeriesAPIResponse } from 'x-pack/plugins/apm/server/lib/transactions/charts/get_timeseries_data';
import { StringMap } from 'x-pack/plugins/apm/typings/common';
import { colors } from '../../style/variables';
import { asDecimal, asMillis, tpmUnit } from '../../utils/formatters';
import { IUrlParams } from '../urlParams';

interface Coordinate {
  x: number;
  y?: number | null;
}

export const getEmptySerie = memoize(
  (start = Date.now() - 3600000, end = Date.now()) => {
    const dates = d3.time
      .scale()
      .domain([new Date(start), new Date(end)])
      .ticks();

    return [
      {
        data: dates.map(x => ({
          x: x.getTime(),
          y: 1
        }))
      }
    ];
  },
  (start: number, end: number) => [start, end].join('_')
);

export function getCharts(
  urlParams: IUrlParams,
  charts: TimeSeriesAPIResponse
) {
  const { start, end, transactionType } = urlParams;
  const noHits = charts.totalHits === 0;
  const tpmSeries = noHits
    ? getEmptySerie(start, end)
    : getTpmSeries(charts, transactionType);

  const responseTimeSeries = noHits
    ? getEmptySerie(start, end)
    : getResponseTimeSeries(charts);

  return {
    noHits,
    tpmSeries,
    responseTimeSeries
  };
}

interface TimeSerie {
  title: string;
  titleShort?: string;
  hideLegend?: boolean;
  hideTooltipValue?: boolean;
  data: Coordinate[];
  legendValue?: string;
  type: string;
  color: string;
  areaColor?: string;
}

export function getResponseTimeSeries(chartsData: TimeSeriesAPIResponse) {
  const { dates, overallAvgDuration, anomalyTimeSeries } = chartsData;
  const { avg, p95, p99 } = chartsData.responseTimes;

  const series: TimeSerie[] = [
    {
      title: 'Avg.',
      data: getChartValues(dates, avg),
      legendValue: asMillis(overallAvgDuration),
      type: 'line',
      color: colors.apmBlue
    },
    {
      title: '95th percentile',
      titleShort: '95th',
      data: getChartValues(dates, p95),
      type: 'line',
      color: colors.apmYellow
    },
    {
      title: '99th percentile',
      titleShort: '99th',
      data: getChartValues(dates, p99),
      type: 'line',
      color: colors.apmOrange
    }
  ];

  if (anomalyTimeSeries) {
    // insert after Avg. series
    series.splice(1, 0, anomalyTimeSeries.anomalyBoundariesSeries);
    series.splice(1, 0, anomalyTimeSeries.anomalyScoreSeries);
  }

  return series;
}

export function getTpmSeries(
  chartsData: TimeSeriesAPIResponse,
  transactionType?: string
) {
  const { dates, tpmBuckets } = chartsData;
  const bucketKeys = tpmBuckets.map(({ key }) => key);
  const getColor = getColorByKey(bucketKeys);
  const getTpmLegendTitle = (bucketKey: string) => {
    // hide legend text for transactions without "result"
    if (bucketKey === 'transaction_result_missing') {
      return '';
    }

    return bucketKey;
  };

  return tpmBuckets.map(bucket => {
    return {
      title: getTpmLegendTitle(bucket.key),
      data: getChartValues(dates, bucket.values),
      legendValue: `${asDecimal(bucket.avg)} ${tpmUnit(transactionType || '')}`,
      type: 'line',
      color: getColor(bucket.key)
    };
  });
}

function getColorByKey(keys: string[]) {
  const assignedColors: StringMap<string> = {
    'HTTP 2xx': colors.apmGreen,
    'HTTP 3xx': colors.apmYellow,
    'HTTP 4xx': colors.apmOrange,
    'HTTP 5xx': colors.apmRed2
  };

  const unknownKeys = difference(keys, Object.keys(assignedColors));
  const unassignedColors: StringMap<string> = zipObject(unknownKeys, [
    colors.apmBlue,
    colors.apmPurple,
    colors.apmPink,
    colors.apmTan,
    colors.apmRed,
    colors.apmBrown
  ]);

  return (key: string) => assignedColors[key] || unassignedColors[key];
}

function getChartValues(
  dates: number[] = [],
  buckets: Array<number | null> = []
) {
  return dates.map((x, i) => ({
    x,
    y: buckets[i]
  }));
}
