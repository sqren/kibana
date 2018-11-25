/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// Everything in here should be moved to http://github.com/sqren/react-redux-request

declare module 'react-redux-request' {
  import React from 'react';

  export function reducer(state: any): any;

  export interface RRRRenderResponse<T> {
    status: 'SUCCESS' | 'LOADING' | 'FAILURE' | undefined;
    data: T;
    args: any[];
  }

  export type RRRRender<T> = (res: RRRRenderResponse<T>) => JSX.Element | null;
  export interface RRRState<Id extends string, FnReturnType> {
    reactReduxRequest: { [K in Id]?: RRRRenderResponse<FnReturnType> };
    [key: string]: any;
  }

  export function Request<
    Args extends any[],
    Id extends string,
    FnReturnType,
    SelectorReturnType
  >({
    id,
    args,
    fn,
    selector,
    render
  }: {
    id: Id;
    args: Args;
    fn: (...args: Args) => Promise<FnReturnType>;
    selector: (
      state: {
        reactReduxRequest: { [K in Id]?: RRRRenderResponse<FnReturnType> };
        [key: string]: any;
      }
    ) => RRRRenderResponse<SelectorReturnType> | { data: any };
    render: (res: RRRRenderResponse<SelectorReturnType>) => any;
  }): JSX.Element | null;
}
