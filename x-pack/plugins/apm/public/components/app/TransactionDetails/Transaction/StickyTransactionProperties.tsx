/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';
import { get } from 'lodash';
import React from 'react';
import { idx } from 'x-pack/plugins/apm/common/idx';
import {
  REQUEST_URL_FULL,
  TRANSACTION_DURATION,
  TRANSACTION_RESULT,
  USER_ID
} from '../../../../../common/constants';
import { Transaction } from '../../../../../typings/es_schemas/Transaction';
import { NOT_AVAILABLE_LABEL } from '../../../../constants';
import { asPercent, asTime } from '../../../../utils/formatters';
import { KibanaLink } from '../../../shared/Links/KibanaLink';

import {
  IStickyProperty,
  StickyProperties
} from '../../../shared/StickyProperties';

export interface Props {
  errorCount?: number | null;
  transaction: Transaction;
  totalDuration?: number;
}

export function StickyTransactionProperties({
  errorCount,
  transaction,
  totalDuration
}: Props) {
  const timestamp = transaction['@timestamp'];
  const url =
    idx(transaction, _ => _.context.page.url) ||
    idx(transaction, _ => _.url.full) ||
    NOT_AVAILABLE_LABEL;
  const duration = transaction.transaction.duration.us;
  const stickyProperties: IStickyProperty[] = [
    {
      label: i18n.translate('xpack.apm.transactionDetails.timestampLabel', {
        defaultMessage: 'Timestamp'
      }),
      fieldName: '@timestamp',
      val: timestamp,
      truncated: true,
      width: '50%'
    },
    {
      fieldName: REQUEST_URL_FULL,
      label: 'URL',
      val: url,
      truncated: true,
      width: '50%'
    },
    {
      label: i18n.translate('xpack.apm.transactionDetails.durationLabel', {
        defaultMessage: 'Duration'
      }),
      fieldName: TRANSACTION_DURATION,
      val: asTime(duration),
      width: '25%'
    },
    {
      label: i18n.translate(
        'xpack.apm.transactionDetails.percentOfTraceLabel',
        {
          defaultMessage: '% of trace'
        }
      ),
      val: asPercent(duration, totalDuration, NOT_AVAILABLE_LABEL),
      width: '25%'
    },
    {
      label: i18n.translate('xpack.apm.transactionDetails.resultLabel', {
        defaultMessage: 'Result'
      }),
      fieldName: TRANSACTION_RESULT,
      val: get(transaction, TRANSACTION_RESULT, NOT_AVAILABLE_LABEL),
      width: '25%'
    },
    {
      label: i18n.translate('xpack.apm.transactionDetails.userIdLabel', {
        defaultMessage: 'User ID'
      }),
      fieldName: USER_ID,
      val: get(transaction, USER_ID, NOT_AVAILABLE_LABEL),
      truncated: true,
      width: '25%'
    }
  ];

  if (errorCount) {
    stickyProperties.push({
      label: i18n.translate('xpack.apm.transactionDetails.errorsLabel', {
        defaultMessage: 'Errors'
      }),
      val: (
        <KibanaLink
          pathname={'/app/apm'}
          hash={`/${idx(transaction, _ => _.service.name)}/errors`}
          query={{
            kuery: `transaction.id~3A~22${transaction.transaction.id}~22`
          }}
        >
          {i18n.translate('xpack.apm.transactionDetails.viewErrors', {
            defaultMessage:
              errorCount === 1 ? `View 1 Error` : `View ${errorCount} Errors`
          })}
        </KibanaLink>
      ),
      width: '25%'
    });
  }

  return <StickyProperties stickyProperties={stickyProperties} />;
}
