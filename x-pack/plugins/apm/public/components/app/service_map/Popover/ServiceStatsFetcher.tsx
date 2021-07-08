/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import {
  EuiLoadingSpinner,
  EuiFlexGroup,
  EuiHorizontalRule,
  EuiText,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { isNumber } from 'lodash';
import { ServiceNodeStats } from '../../../../../common/service_map';
import { ServiceStatsList } from './ServiceStatsList';
import { useFetcher, FETCH_STATUS } from '../../../../hooks/use_fetcher';
import { useUrlParams } from '../../../../context/url_params_context/use_url_params';
import { AnomalyDetection } from './anomaly_detection';
import { ServiceAnomalyStats } from '../../../../../common/anomaly_detection';

interface ServiceStatsFetcherProps {
  environment?: string;
  serviceName: string;
  serviceAnomalyStats: ServiceAnomalyStats | undefined;
}

function getHasServiceData(data?: ServiceNodeStats) {
  const { avgCpuUsage, avgErrorRate, avgMemoryUsage } = data ?? {};
  const { avgTransactionDuration } = data?.transactionStats ?? {};
  const avgThroughput = data?.transactionStats.avgThroughput.value;

  return [
    avgCpuUsage,
    avgErrorRate,
    avgMemoryUsage,
    avgThroughput,
    avgTransactionDuration,
  ].some((stat) => isNumber(stat));
}

export function ServiceStatsFetcher({
  serviceName,
  serviceAnomalyStats,
}: ServiceStatsFetcherProps) {
  const {
    urlParams: { environment, start, end },
  } = useUrlParams();

  const { data, status } = useFetcher(
    (callApmApi) => {
      if (serviceName && start && end) {
        return callApmApi({
          endpoint: 'GET /api/apm/service-map/service/{serviceName}',
          params: {
            path: { serviceName },
            query: { environment, start, end },
          },
        });
      }
    },
    [environment, serviceName, start, end],
    {
      preservePreviousData: false,
    }
  );

  const isLoading = status === FETCH_STATUS.LOADING;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const hasServiceData = getHasServiceData(data);
  if (!data || !hasServiceData) {
    return (
      <EuiText color="subdued">
        {i18n.translate('xpack.apm.serviceMap.popoverMetrics.noDataText', {
          defaultMessage: `No data for selected environment. Try switching to another environment.`,
        })}
      </EuiText>
    );
  }

  return (
    <>
      {serviceAnomalyStats && (
        <>
          <AnomalyDetection
            serviceName={serviceName}
            serviceAnomalyStats={serviceAnomalyStats}
          />
          <EuiHorizontalRule margin="xs" />
        </>
      )}
      <ServiceStatsList {...data} />
    </>
  );
}

function LoadingSpinner() {
  return (
    <EuiFlexGroup
      alignItems="center"
      justifyContent="spaceAround"
      style={{ height: 170 }}
    >
      <EuiLoadingSpinner size="xl" />
    </EuiFlexGroup>
  );
}
