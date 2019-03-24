/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ESFilter } from 'elasticsearch';
import {
  PROCESSOR_EVENT,
  SERVICE_NAME,
  TRANSACTION_TYPE
} from 'x-pack/plugins/apm/common/elasticsearch_fieldnames';
import { Setup } from 'x-pack/plugins/apm/server/lib/helpers/setup_request';

import { PromiseReturnType } from 'x-pack/plugins/apm/typings/common';
import { rangeFilter } from '../../helpers/range_filter';
import { getTransactionGroups } from '../../transaction_groups';

export interface IOptions {
  setup: Setup;
  transactionType?: string;
  serviceName: string;
}

export type TransactionListAPIResponse = PromiseReturnType<
  typeof getTopTransactions
>;
export async function getTopTransactions({
  setup,
  transactionType,
  serviceName
}: IOptions) {
  const { start, end } = setup;
  const filter: ESFilter[] = [
    { term: { [SERVICE_NAME]: serviceName } },
    { term: { [PROCESSOR_EVENT]: 'transaction' } },
    { range: rangeFilter(start, end) }
  ];

  if (transactionType) {
    filter.push({
      term: { [TRANSACTION_TYPE]: transactionType }
    });
  }

  const bodyQuery = {
    bool: {
      filter
    }
  };

  return getTransactionGroups(setup, bodyQuery);
}
