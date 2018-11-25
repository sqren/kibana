/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { Request, RRRRender, RRRState } from 'react-redux-request';
import { TransactionAPIResponse } from 'x-pack/plugins/apm/server/lib/transactions/get_transaction';
import { loadTransaction } from '../../services/rest/apm';
import { IUrlParams } from '../urlParams';

const defaultResponse = { data: undefined };
export function TransactionDetailsRequest({
  urlParams,
  render
}: {
  urlParams: IUrlParams;
  render: RRRRender<TransactionAPIResponse | undefined>;
}) {
  const { serviceName, start, end, transactionId, traceId, kuery } = urlParams;

  if (!(serviceName && start && end && transactionId)) {
    return null;
  }

  return (
    <Request
      id="transactionDetails"
      fn={loadTransaction}
      selector={(
        state: RRRState<'transactionDetails', TransactionAPIResponse>
      ) => state.reactReduxRequest.transactionDetails || defaultResponse}
      args={[{ serviceName, start, end, transactionId, traceId, kuery }]}
      render={render}
    />
  );
}
