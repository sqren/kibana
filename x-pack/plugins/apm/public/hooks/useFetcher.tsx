/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { useEffect, useState } from 'react';

export enum FETCH_STATUS {
  LOADING = 'loading',
  SUCCESS = 'success',
  FAILURE = 'failure'
}

export function useFetcher<Opts, Response>(
  fn: (options: Opts) => Promise<Response>,
  options: Opts
) {
  const [status, setStatus] = useState<FETCH_STATUS | undefined>(undefined);
  const [data, setData] = useState<Response | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  let didCancel = false;

  async function fetchData() {
    setStatus(FETCH_STATUS.LOADING);
    setError(undefined);
    try {
      const fnData = await fn(options);
      if (!didCancel) {
        setData(fnData);
        setStatus(FETCH_STATUS.SUCCESS);
      }
    } catch (e) {
      setError(e);
      setStatus(FETCH_STATUS.FAILURE);
    }
  }

  useEffect(
    () => {
      didCancel = false;
      fetchData();
      return () => {
        didCancel = true;
      };
    },
    [...Object.keys(options), ...Object.values(options)]
  );

  return {
    data,
    status,
    error
  };
}
