/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { RRRRenderResponse } from 'react-redux-request';
import { createSelector } from 'reselect';

export const createInitialDataSelector = <U>(initialData: U) => {
  return createSelector(
    (state?: RRRRenderResponse<U>) => state,
    state => {
      return {
        status: state && state.status,
        args: state && state.args ? state.args : [],
        data: state && state.data ? state.data : initialData
      };
    }
  );
};
