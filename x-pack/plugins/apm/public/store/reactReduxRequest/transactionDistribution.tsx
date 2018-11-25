/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import {
  Request,
  RRRRender,
  RRRRenderResponse,
  RRRState
} from 'react-redux-request';
import { ITransactionDistributionAPIResponse } from 'x-pack/plugins/apm/server/lib/transactions/distribution';
import { loadTransactionDistribution } from '../../services/rest/apm';
import { IUrlParams } from '../urlParams';
import { createInitialDataSelector } from './helpers';

type IState = RRRState<
  'transactionDistribution',
  ITransactionDistributionAPIResponse
>;

const INITIAL_DATA: ITransactionDistributionAPIResponse = {
  buckets: [],
  bucketSize: 0,
  totalHits: 0
};

const withInitialData = createInitialDataSelector(INITIAL_DATA);
export function getTransactionDistribution(
  state: IState
): RRRRenderResponse<ITransactionDistributionAPIResponse> {
  return withInitialData(state.reactReduxRequest.transactionDistribution);
}

export function getDefaultDistributionSample(state: IState) {
  const distribution = getTransactionDistribution(state);
  if (distribution.data.defaultSample !== undefined) {
    const { traceId, transactionId } = distribution.data.defaultSample;
    return { traceId, transactionId };
  }

  return {};
}

export function TransactionDistributionRequest({
  urlParams,
  render
}: {
  urlParams: IUrlParams;
  render: RRRRender<ITransactionDistributionAPIResponse>;
}) {
  const { serviceName, start, end, transactionName, kuery } = urlParams;

  if (!(serviceName && start && end && transactionName)) {
    return null;
  }

  return (
    <Request
      id="transactionDistribution"
      fn={loadTransactionDistribution}
      args={[{ serviceName, start, end, transactionName, kuery }]}
      selector={getTransactionDistribution}
      render={render}
    />
  );
}
