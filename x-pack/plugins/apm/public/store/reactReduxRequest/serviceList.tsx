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
import {
  IServiceListItem,
  ServiceListAPIResponse
} from 'x-pack/plugins/apm/server/lib/services/get_services';
import { loadServiceList } from '../../services/rest/apm';
import { IUrlParams } from '../urlParams';
import { createInitialDataSelector } from './helpers';

const INITIAL_DATA: IServiceListItem[] = [];
const withInitialData = createInitialDataSelector(INITIAL_DATA);

export function getServiceList(
  state: RRRState<'serviceList', ServiceListAPIResponse>
): RRRRenderResponse<IServiceListItem[]> {
  return withInitialData(state.reactReduxRequest.serviceList);
}

export function ServiceListRequest({
  urlParams,
  render
}: {
  urlParams: IUrlParams;
  render: RRRRender<IServiceListItem[]>;
}) {
  const { start, end, kuery } = urlParams;

  if (!(start && end)) {
    return null;
  }

  return (
    <Request
      id="serviceList"
      fn={loadServiceList}
      args={[{ start, end, kuery }]}
      selector={getServiceList}
      render={render}
    />
  );
}
