/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import * as t from 'io-ts';
import { transactionMaxSpansRt } from '../transaction_max_spans_rt';
import { transactionSampleRateRt } from '../transaction_sample_rate_rt';

export const agentConfigurationRt = t.type({
  service: t.intersection([
    t.type({ name: t.string }),
    t.partial({ environment: t.string })
  ]),
  settings: t.type({
    transaction_sample_rate: t.union([transactionSampleRateRt, t.undefined]),
    capture_body: t.string,
    transaction_max_spans: t.union([transactionMaxSpansRt, t.undefined])
  })
});

export type AgentConfigurationPayload = t.TypeOf<typeof agentConfigurationRt>;
