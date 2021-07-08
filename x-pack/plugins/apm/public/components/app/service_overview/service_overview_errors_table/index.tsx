/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  EuiBasicTable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { orderBy } from 'lodash';
import React, { useState } from 'react';
import uuid from 'uuid';
import { useApmServiceContext } from '../../../../context/apm_service/use_apm_service_context';
import { useUrlParams } from '../../../../context/url_params_context/use_url_params';
import { FETCH_STATUS, useFetcher } from '../../../../hooks/use_fetcher';
import { APIReturnType } from '../../../../services/rest/createCallApmApi';
import { ErrorOverviewLink } from '../../../shared/Links/apm/ErrorOverviewLink';
import { TableFetchWrapper } from '../../../shared/table_fetch_wrapper';
import { getTimeRangeComparison } from '../../../shared/time_comparison/get_time_range_comparison';
import { ServiceOverviewTableContainer } from '../service_overview_table_container';
import { getColumns } from './get_column';

interface Props {
  serviceName: string;
}
type ErrorGroupMainStatistics = APIReturnType<'GET /api/apm/services/{serviceName}/error_groups/main_statistics'>;
type ErrorGroupDetailedStatistics = APIReturnType<'GET /api/apm/services/{serviceName}/error_groups/detailed_statistics'>;

type SortDirection = 'asc' | 'desc';
type SortField = 'name' | 'last_seen' | 'occurrences';

const PAGE_SIZE = 5;
const DEFAULT_SORT = {
  direction: 'desc' as const,
  field: 'occurrences' as const,
};

const INITIAL_STATE_MAIN_STATISTICS: {
  items: ErrorGroupMainStatistics['error_groups'];
  totalItems: number;
  requestId?: string;
} = {
  items: [],
  totalItems: 0,
  requestId: undefined,
};

const INITIAL_STATE_DETAILED_STATISTICS: ErrorGroupDetailedStatistics = {
  currentPeriod: {},
  previousPeriod: {},
};

export function ServiceOverviewErrorsTable({ serviceName }: Props) {
  const {
    urlParams: {
      environment,
      kuery,
      start,
      end,
      comparisonType,
      comparisonEnabled,
    },
  } = useUrlParams();
  const { transactionType } = useApmServiceContext();
  const [tableOptions, setTableOptions] = useState<{
    pageIndex: number;
    sort: {
      direction: SortDirection;
      field: SortField;
    };
  }>({
    pageIndex: 0,
    sort: DEFAULT_SORT,
  });

  const { comparisonStart, comparisonEnd } = getTimeRangeComparison({
    start,
    end,
    comparisonType,
    comparisonEnabled,
  });

  const { pageIndex, sort } = tableOptions;
  const { direction, field } = sort;

  const { data = INITIAL_STATE_MAIN_STATISTICS, status } = useFetcher(
    (callApmApi) => {
      if (!start || !end || !transactionType) {
        return;
      }
      return callApmApi({
        endpoint:
          'GET /api/apm/services/{serviceName}/error_groups/main_statistics',
        params: {
          path: { serviceName },
          query: {
            environment,
            kuery,
            start,
            end,
            transactionType,
          },
        },
      }).then((response) => {
        const currentPageErrorGroups = orderBy(
          response.error_groups,
          field,
          direction
        ).slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);

        return {
          // Everytime the main statistics is refetched, updates the requestId making the comparison API to be refetched.
          requestId: uuid(),
          items: currentPageErrorGroups,
          totalItems: response.error_groups.length,
        };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      environment,
      kuery,
      start,
      end,
      serviceName,
      transactionType,
      pageIndex,
      direction,
      field,
      // not used, but needed to trigger an update when comparisonType is changed either manually by user or when time range is changed
      comparisonType,
      // not used, but needed to trigger an update when comparison feature is disabled/enabled by user
      comparisonEnabled,
    ]
  );

  const { requestId, items, totalItems } = data;

  const {
    data: errorGroupDetailedStatistics = INITIAL_STATE_DETAILED_STATISTICS,
    status: errorGroupDetailedStatisticsStatus,
  } = useFetcher(
    (callApmApi) => {
      if (requestId && items.length && start && end && transactionType) {
        return callApmApi({
          endpoint:
            'GET /api/apm/services/{serviceName}/error_groups/detailed_statistics',
          params: {
            path: { serviceName },
            query: {
              environment,
              kuery,
              start,
              end,
              transactionType,
              groupIds: JSON.stringify(
                items.map(({ group_id: groupId }) => groupId).sort()
              ),
              comparisonStart,
              comparisonEnd,
            },
          },
        });
      }
    },
    // only fetches agg results when requestId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requestId],
    { preservePreviousData: false }
  );

  const columns = getColumns({
    serviceName,
    errorGroupDetailedStatistics,
    comparisonEnabled,
  });

  return (
    <EuiFlexGroup direction="column" gutterSize="s">
      <EuiFlexItem>
        <EuiFlexGroup responsive={false} justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiTitle size="xs">
              <h2>
                {i18n.translate('xpack.apm.serviceOverview.errorsTableTitle', {
                  defaultMessage: 'Errors',
                })}
              </h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <ErrorOverviewLink serviceName={serviceName}>
              {i18n.translate('xpack.apm.serviceOverview.errorsTableLinkText', {
                defaultMessage: 'View errors',
              })}
            </ErrorOverviewLink>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        <TableFetchWrapper status={status}>
          <ServiceOverviewTableContainer
            isEmptyAndLoading={
              totalItems === 0 && status === FETCH_STATUS.LOADING
            }
          >
            <EuiBasicTable
              columns={columns}
              items={items}
              pagination={{
                pageIndex,
                pageSize: PAGE_SIZE,
                totalItemCount: totalItems,
                pageSizeOptions: [PAGE_SIZE],
                hidePerPageOptions: true,
              }}
              loading={
                status === FETCH_STATUS.LOADING ||
                errorGroupDetailedStatisticsStatus === FETCH_STATUS.LOADING
              }
              onChange={(newTableOptions: {
                page?: {
                  index: number;
                };
                sort?: { field: string; direction: SortDirection };
              }) => {
                setTableOptions({
                  pageIndex: newTableOptions.page?.index ?? 0,
                  sort: newTableOptions.sort
                    ? {
                        field: newTableOptions.sort.field as SortField,
                        direction: newTableOptions.sort.direction,
                      }
                    : DEFAULT_SORT,
                });
              }}
              sorting={{
                enableAllColumns: true,
                sort,
              }}
            />
          </ServiceOverviewTableContainer>
        </TableFetchWrapper>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
