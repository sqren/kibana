/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React from 'react';
import { idx } from 'x-pack/plugins/apm/common/idx';
import { IUrlParams } from 'x-pack/plugins/apm/public/store/urlParams';
import { ErrorGroupOverviewRequest } from '../../../../store/reactReduxRequest/errorGroupList';
import {
  Props as IStickyTransactionPropertiesProps,
  StickyTransactionProperties
} from './StickyTransactionProperties';

interface Props extends IStickyTransactionPropertiesProps {
  urlParams: IUrlParams;
}

export const StickyTransactionPropertiesErrorRequest: React.SFC<Props> = ({
  transaction,
  urlParams: { errorGroupId, start, end },
  ...restProps
}) => {
  return (
    <ErrorGroupOverviewRequest
      urlParams={{
        kuery: `transaction.id: "${transaction.transaction.id}"`,
        serviceName: idx(transaction, _ => _.service.name),
        start,
        end,
        errorGroupId
      }}
      render={({ data }) => (
        <StickyTransactionProperties
          {...restProps}
          errorCount={(data && data.length) || 0}
          transaction={transaction}
        />
      )}
    />
  );
};
