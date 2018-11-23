/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ApmTimeSeriesResponse } from 'x-pack/plugins/apm/server/lib/transactions/charts/get_timeseries_data/transform';
import { getResponseTimeSeries, getTpmSeries } from '../chartSelectors';

describe('chartSelectors', () => {
  describe('getResponseTimeSeries', () => {
    const apmTimeseries = {
      responseTimes: {
        avg: [
          { x: 0, y: 100 },
          { x: 1000, y: 200 },
          { x: 2000, y: 150 },
          { x: 3000, y: 250 },
          { x: 4000, y: 100 },
          { x: 5000, y: 50 }
        ],
        p95: [
          { x: 0, y: 200 },
          { x: 1000, y: 300 },
          { x: 2000, y: 250 },
          { x: 3000, y: 350 },
          { x: 4000, y: 200 },
          { x: 5000, y: 150 }
        ],
        p99: [
          { x: 0, y: 300 },
          { x: 1000, y: 400 },
          { x: 2000, y: 350 },
          { x: 3000, y: 450 },
          { x: 4000, y: 100 },
          { x: 5000, y: 50 }
        ]
      },
      overallAvgDuration: 200
    } as ApmTimeSeriesResponse;

    it('should match snapshot', () => {
      expect(getResponseTimeSeries(apmTimeseries)).toMatchSnapshot();
    });

    it('should return 3 series', () => {
      expect(getResponseTimeSeries(apmTimeseries).length).toBe(3);
    });
  });

  describe('getTpmSeries', () => {
    const apmTimeseries = ({
      dates: [0, 1000, 2000, 3000, 4000, 5000],
      tpmBuckets: [
        {
          key: 'HTTP 2xx',
          dataPoints: [
            { x: 0, y: 5 },
            { x: 1000, y: 10 },
            { x: 2000, y: 3 },
            { x: 3000, y: 8 },
            { x: 4000, y: 4 },
            { x: 5000, y: 9 }
          ]
        },
        {
          key: 'HTTP 4xx',
          dataPoints: [
            { x: 0, y: 1 },
            { x: 1000, y: 2 },
            { x: 2000, y: 3 },
            { x: 3000, y: 2 },
            { x: 4000, y: 3 },
            { x: 5000, y: 1 }
          ]
        },
        {
          key: 'HTTP 5xx',
          dataPoints: [
            { x: 0, y: 0 },
            { x: 1000, y: 1 },
            { x: 2000, y: 2 },
            { x: 3000, y: 1 },
            { x: 4000, y: 0 },
            { x: 5000, y: 2 }
          ]
        }
      ]
    } as any) as ApmTimeSeriesResponse;

    const transactionType = 'MyTransactionType';

    it('should match snapshot', () => {
      expect(getTpmSeries(apmTimeseries, transactionType)).toMatchSnapshot();
    });
  });
});
