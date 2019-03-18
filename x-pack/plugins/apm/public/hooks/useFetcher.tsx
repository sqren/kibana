/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { flatten, isObject } from 'lodash';
import { useEffect, useState } from 'react';

export enum FETCH_STATUS {
  LOADING = 'loading',
  SUCCESS = 'success',
  FAILURE = 'failure'
}

export function useFetcher<Args extends any[], Response>(
  fn: (...args: Args) => Promise<Response>,
  fnArgs: Args
) {
  const [status, setStatus] = useState<FETCH_STATUS | null>(null);
  const [data, setData] = useState<Response | null>(null);
  const [error, setError] = useState<Error | null>(null);
  let didCancel: boolean;

  async function fetchData() {
    setStatus(FETCH_STATUS.LOADING);
    setError(null);
    try {
      const fnData = await fn(...fnArgs);
      if (!didCancel) {
        setData(fnData);
        setStatus(FETCH_STATUS.SUCCESS);
      }
    } catch (e) {
      setError(e);
      setStatus(FETCH_STATUS.FAILURE);
    }
  }

  // support objects as arguments. Convert object to flat array and pass the key/values as a flat array
  const flatFnArgs = flatten(
    fnArgs.map(arg =>
      isObject(arg) ? [...Object.keys(arg), ...Object.values(arg)] : arg
    )
  );

  useEffect(() => {
    didCancel = false;
    fetchData();
    return () => {
      didCancel = true;
    };
  }, flatFnArgs);

  return {
    data,
    status,
    error
  };
}
