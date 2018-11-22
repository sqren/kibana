/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { TimeSeriesAPIResponse } from 'x-pack/plugins/apm/server/lib/transactions/charts/get_timeseries_data';
import { getResponseTimeSeries, getTpmSeries } from '../chartSelectors';

describe('chartSelectors', () => {
  describe('getResponseTimeSeries', () => {
    const chartsData = {
      dates: [0, 1000, 2000, 3000, 4000, 5000],
      responseTimes: {
        avg: [100, 200, 150, 250, 100, 50],
        p95: [200, 300, 250, 350, 200, 150],
        p99: [300, 400, 350, 450, 100, 50]
      },
      overallAvgDuration: 200
    } as TimeSeriesAPIResponse;

    it('should match snapshot', () => {
      expect(getResponseTimeSeries(chartsData)).toMatchSnapshot();
    });

    it('should return 3 series', () => {
      expect(getResponseTimeSeries(chartsData).length).toBe(3);
    });
  });

  describe('getTpmSeries', () => {
    const chartsData = {
      dates: [0, 1000, 2000, 3000, 4000, 5000],
      tpmBuckets: [
        {
          key: 'HTTP 2xx',
          avg: 10,
          values: [5, 10, 3, 8, 4, 9]
        },
        {
          key: 'HTTP 4xx',
          avg: 2,
          values: [1, 2, 3, 2, 3, 1]
        },
        {
          key: 'HTTP 5xx',
          avg: 1,
          values: [0, 1, 2, 1, 0, 2]
        }
      ]
    } as TimeSeriesAPIResponse;

    const transactionType = 'MyTransactionType';

    it('should match snapshot', () => {
      expect(getTpmSeries(chartsData, transactionType)).toMatchSnapshot();
    });
  });
});
