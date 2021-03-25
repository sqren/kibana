/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { format } from 'url';
import supertest from 'supertest';
import { parseEndpoint } from '../../../plugins/apm/common/apm_api/parse_endpoint';
import { APMAPI } from '../../../plugins/apm/server/routes/create_apm_api';
import type {
  APIReturnType,
  APMClientOptions,
} from '../../../plugins/apm/public/services/rest/createCallApmApi';

export function createApmApiSupertest(st: supertest.SuperTest<supertest.Test>) {
  return async <TPath extends keyof APMAPI['_S']>(
    endpoint: TPath,
    params: APMClientOptions['params'] = {}
  ): Promise<{
    status: number;
    body: APIReturnType<TPath>;
  }> => {
    const { method, pathname } = parseEndpoint(endpoint, params?.path);
    const url = format({ pathname, query: params?.query });

    const res = params.body
      ? await st[method](url).send(params.body).set('kbn-xsrf', 'foo')
      : await st[method](url);

    if (res.status > 399) {
      const e = new Error(`Unhandled ApmApiSupertest error ${res.status}`);
      // @ts-expect-error
      e.res = res;
      throw e;
    }

    return res;
  };
}
