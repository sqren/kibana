/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Request, RRRRender, RRRState } from 'react-redux-request';
import { createSelector } from 'reselect';
import { TimeSeriesAPIResponse } from 'x-pack/plugins/apm/server/lib/transactions/charts';
import { loadCharts } from '../../services/rest/apm';
import { getCharts, ICharts } from '../selectors/chartSelectors';
import { getUrlParams, IUrlParams } from '../urlParams';

export const getTransactionDetailsCharts = createSelector(
  getUrlParams as any,
  (state: RRRState<'transactionDetailsCharts', TimeSeriesAPIResponse>) =>
    state.reactReduxRequest.transactionDetailsCharts,
  (urlParams: IUrlParams, detailCharts = {} as any) => {
    return {
      ...detailCharts,
      data: getCharts(urlParams, detailCharts.data)
    };
  }
);

interface Props {
  urlParams: IUrlParams;
  render: RRRRender<ICharts>;
}

export function TransactionDetailsChartsRequest({ urlParams, render }: Props) {
  const {
    serviceName,
    start,
    end,
    transactionType,
    transactionName,
    kuery
  } = urlParams;

  if (!(serviceName && start && end && transactionType && transactionName)) {
    return null;
  }

  return (
    <Request
      id="transactionDetailsCharts"
      fn={loadCharts}
      args={[
        { serviceName, start, end, transactionType, transactionName, kuery }
      ]}
      selector={getTransactionDetailsCharts}
      render={render}
    />
  );
}
