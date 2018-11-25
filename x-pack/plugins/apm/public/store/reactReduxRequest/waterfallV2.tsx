/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { get } from 'lodash';
import React from 'react';
import { Request, RRRRender, RRRState } from 'react-redux-request';
import { TRACE_ID } from 'x-pack/plugins/apm/common/constants';
import { TraceAPIResponse } from 'x-pack/plugins/apm/server/lib/traces/get_trace';
import { Transaction } from 'x-pack/plugins/apm/typings/Transaction';
import {
  getWaterfall,
  IWaterfall
} from '../../components/app/TransactionDetails/Transaction/WaterfallContainer/Waterfall/waterfall_helpers/waterfall_helpers';
import { loadTrace } from '../../services/rest/apm';
import { IUrlParams } from '../urlParams';

interface Props {
  urlParams: IUrlParams;
  transaction: Transaction;
  render: RRRRender<IWaterfall>;
}

const defaultResponse = { data: undefined };

export function WaterfallV2Request({ urlParams, transaction, render }: Props) {
  const { start, end } = urlParams;
  const traceId: string = get(transaction, TRACE_ID);

  if (!(traceId && start && end)) {
    return null;
  }

  return (
    <Request
      id="waterfallV2"
      fn={loadTrace}
      selector={(state: RRRState<'waterfallV2', TraceAPIResponse>) =>
        state.reactReduxRequest.waterfallV2 || defaultResponse
      }
      args={[{ traceId, start, end }]}
      render={({ args, data = [], status }) => {
        const waterfall = getWaterfall(data, transaction);
        return render({ args, data: waterfall, status });
      }}
    />
  );
}
