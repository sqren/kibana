/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { get } from 'lodash';
import React from 'react';
import { Request, RRRRender, RRRState } from 'react-redux-request';
import { createSelector } from 'reselect';
import { TimeSeriesAPIResponse } from 'x-pack/plugins/apm/server/lib/transactions/charts';
import { loadCharts } from '../../services/rest/apm';
import { IReduxState } from '../rootReducer';
import { getCharts, ICharts } from '../selectors/chartSelectors';
import { getUrlParams, IUrlParams } from '../urlParams';

const INITIAL_DATA: TimeSeriesAPIResponse = {
  apmTimeseries: {
    totalHits: 0,
    responseTimes: {
      avg: [],
      p95: [],
      p99: []
    },
    tpmBuckets: [],
    overallAvgDuration: undefined
  },
  anomalyTimeseries: undefined
};

// getUrlParams as any,

export const getTransactionOverviewCharts = createSelector(
  getUrlParams as any,
  (state: RRRState<'transactionOverviewCharts', TimeSeriesAPIResponse>) =>
    state.reactReduxRequest.transactionOverviewCharts,
  (urlParams, overviewCharts = {} as any) => {
    return {
      ...overviewCharts,
      data: getCharts(urlParams, overviewCharts.data || INITIAL_DATA)
    };
  }
);

export function hasDynamicBaseline(state: IReduxState) {
  return (
    get(
      state.reactReduxRequest.transactionOverviewCharts,
      `data.anomalyTimeseries`
    ) !== undefined
  );
}

interface Props {
  urlParams: IUrlParams;
  render: RRRRender<ICharts>;
}

export function TransactionOverviewChartsRequest({ urlParams, render }: Props) {
  const { serviceName, start, end, transactionType, kuery } = urlParams;

  if (!(serviceName && start && end && transactionType)) {
    return null;
  }

  return (
    <Request
      id="transactionOverviewCharts"
      fn={loadCharts}
      args={[{ serviceName, start, end, transactionType, kuery }]}
      selector={getTransactionOverviewCharts}
      render={render}
    />
  );
}
