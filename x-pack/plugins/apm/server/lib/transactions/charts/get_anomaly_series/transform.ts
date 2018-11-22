/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { first, last } from 'lodash';
import { rgba } from 'polished';
import { oc } from 'ts-optchain';
import { colors } from 'x-pack/plugins/apm/common/variables';
import { ESResponse } from './fetcher';

interface IBucket {
  x: number;
  anomalyScore: number | null;
  lower: number | null;
  upper: number | null;
}

// TODO: remove duplication between this and chartSelector
interface Coordinate {
  x: number;
  y?: number | null;
}

// TODO: remove duplication between this and chartSelector
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

export interface AnomalyTimeSeriesResponse {
  anomalyScoreSeries: TimeSerie;
  anomalyBoundariesSeries: TimeSerie;
}

export function anomalySeriesTransform(
  response: ESResponse | undefined,
  mlBucketSize: number,
  bucketSize: number,
  timeSeriesDates: number[]
): AnomalyTimeSeriesResponse | undefined {
  if (!response) {
    return;
  }

  const buckets = oc(response)
    .aggregations.ml_avg_response_times.buckets([])
    .map(bucket => {
      return {
        x: bucket.key,
        anomalyScore: bucket.anomaly_score.value,
        lower: bucket.lower.value,
        upper: bucket.upper.value
      };
    });

  const bucketSizeInMillis = Math.max(bucketSize, mlBucketSize) * 1000;

  return {
    anomalyScoreSeries: {
      title: 'Anomaly score',
      hideLegend: true,
      hideTooltipValue: true,
      data: getAnomalyScoreDataPoints(
        buckets,
        timeSeriesDates,
        bucketSizeInMillis
      ),
      type: 'areaMaxHeight',
      color: 'none',
      areaColor: rgba(colors.apmRed, 0.1)
      // areaColor: 'rgba(60, 100, 50, 0.5)'
    },
    anomalyBoundariesSeries: {
      title: 'Anomaly Boundaries',
      hideLegend: true,
      hideTooltipValue: true,
      data: getAnomalyBoundaryDataPoints(buckets, timeSeriesDates),
      type: 'area',
      color: 'none',
      // areaColor: 'rgba(30, 100, 30, 0.5)'
      areaColor: rgba(colors.apmBlue, 0.1)
    }
  };
}

export function getAnomalyScoreDataPoints(
  buckets: IBucket[],
  timeSeriesDates: number[],
  bucketSizeInMillis: number
): Coordinate[] {
  const ANOMALY_THRESHOLD = 75;
  const firstDate = first(timeSeriesDates);
  const lastDate = last(timeSeriesDates);

  return buckets
    .filter(
      bucket =>
        bucket.anomalyScore !== null && bucket.anomalyScore > ANOMALY_THRESHOLD
    )
    .filter(isInDateRange(firstDate, lastDate))
    .map(bucket => {
      return {
        x0: bucket.x,
        x: bucket.x + bucketSizeInMillis
      };
    });
}

export function getAnomalyBoundaryDataPoints(
  buckets: IBucket[],
  timeSeriesDates: number[]
): Coordinate[] {
  return replaceFirstAndLastBucket(buckets, timeSeriesDates)
    .filter(bucket => bucket.lower !== null)
    .map(bucket => {
      return {
        x: bucket.x,
        y0: bucket.lower,
        y: bucket.upper
      };
    });
}

export function replaceFirstAndLastBucket(
  buckets: IBucket[],
  timeSeriesDates: number[]
) {
  const firstDate = first(timeSeriesDates);
  const lastDate = last(timeSeriesDates);

  const preBucketWithValue = buckets
    .filter(p => p.x <= firstDate)
    .reverse()
    .find(p => p.lower !== null);

  const bucketsInRange = buckets.filter(isInDateRange(firstDate, lastDate));

  // replace first bucket if it is null
  const firstBucket = first(bucketsInRange);
  if (preBucketWithValue && firstBucket && firstBucket.lower === null) {
    firstBucket.lower = preBucketWithValue.lower;
    firstBucket.upper = preBucketWithValue.upper;
  }

  const lastBucketWithValue = [...buckets]
    .reverse()
    .find(p => p.lower !== null);

  // replace last bucket if it is null
  const lastBucket = last(bucketsInRange);
  if (lastBucketWithValue && lastBucket && lastBucket.lower === null) {
    lastBucket.lower = lastBucketWithValue.lower;
    lastBucket.upper = lastBucketWithValue.upper;
  }

  return bucketsInRange;
}

// anomaly time series contain one or more buckets extra in the beginning
// these extra buckets should be removed
function isInDateRange(firstDate: number, lastDate: number) {
  return (p: IBucket) => p.x >= firstDate && p.x <= lastDate;
}
