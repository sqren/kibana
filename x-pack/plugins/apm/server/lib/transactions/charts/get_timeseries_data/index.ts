/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { getBucketSize } from '../../../helpers/get_bucket_size';
import { Setup } from '../../../helpers/setup_request';
import { getAnomalySeries } from '../get_anomaly_series';
import { AnomalyTimeSeriesResponse } from '../get_anomaly_series/transform';
import { timeseriesFetcher } from './fetcher';
import { ApmTimeSeriesResponse, timeseriesTransformer } from './transform';

export interface TimeSeriesAPIResponse extends ApmTimeSeriesResponse {
  anomalyTimeSeries?: AnomalyTimeSeriesResponse;
}

export async function getTimeseriesData(options: {
  serviceName: string;
  transactionType: string;
  transactionName?: string;
  setup: Setup;
}): Promise<TimeSeriesAPIResponse> {
  const { start, end } = options.setup;
  const { bucketSize } = getBucketSize(start, end, 'auto');

  const timeseriesResponse = await timeseriesFetcher(options);
  const transformedTimeSeries = timeseriesTransformer({
    timeseriesResponse,
    bucketSize
  });

  const anomalyTimeSeries = await getAnomalySeries({
    ...options,
    timeSeriesDates: transformedTimeSeries.dates
  });

  return {
    ...transformedTimeSeries,
    anomalyTimeSeries
  };
}
