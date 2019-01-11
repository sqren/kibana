/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { KibanaLink } from '../../../utils/url/KibanaLink';
import { QueryParamsDecoded } from '../../../utils/url/url_helpers';
import { QueryWithIndexPattern } from './QueryWithIndexPattern';

interface Props {
  query: QueryParamsDecoded;
  children: React.ReactNode;
}

export function DiscoverButton({ query, ...rest }: Props) {
  return (
    <QueryWithIndexPattern query={query}>
      {queryWithIndexPattern => (
        <KibanaLink
          pathname={'/app/kibana'}
          hash={'/discover'}
          query={queryWithIndexPattern}
          {...rest}
        />
      )}
    </QueryWithIndexPattern>
  );
}
