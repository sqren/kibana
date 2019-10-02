/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import {
  EuiFormRow,
  EuiFieldText,
  EuiTitle,
  EuiSpacer,
  EuiFieldNumber
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { AgentConfigurationPayload } from '../../../../../../common/runtime_types/agent_configuration_rt';
import { SelectWithPlaceholder } from '../../../../shared/SelectWithPlaceholder';
const t = (id: string, defaultMessage: string) =>
  i18n.translate(`xpack.apm.settings.agentConf.flyOut.settingsSection.${id}`, {
    defaultMessage
  });

interface Props {
  values: AgentConfigurationPayload['settings'];
  valid: Record<keyof AgentConfigurationPayload['settings'], boolean>;
  onChange: (settings: AgentConfigurationPayload['settings']) => void;
}

export function SettingsSection({ values, valid, onChange }: Props) {
  return (
    <>
      <EuiTitle size="xs">
        <h3>{t('title', 'Settings')}</h3>
      </EuiTitle>

      <EuiSpacer size="m" />

      <EuiFormRow
        label={t(
          'sampleRateConfigurationInputLabel',
          'Transaction sample rate'
        )}
        helpText={t(
          'sampleRateConfigurationInputHelpText',
          'Choose a rate between 0.000 and 1.0. Default is 1.0 (100% of traces).'
        )}
        error={t(
          'sampleRateConfigurationInputErrorText',
          'Sample rate must be between 0.000 and 1'
        )}
        isInvalid={!valid.transaction_sample_rate}
      >
        <EuiFieldText
          placeholder={t(
            'sampleRateConfigurationInputPlaceholderText',
            'Set sample rate'
          )}
          value={values.transaction_sample_rate}
          onChange={e => {
            e.preventDefault();
            onChange({
              ...values,
              transaction_sample_rate: parseFloat(e.target.value)
            });
          }}
        />
      </EuiFormRow>

      <EuiSpacer size="m" />

      <EuiFormRow
        label={t('captureBodyInputLabel', 'Capture body')}
        helpText={t(
          'captureBodyInputHelpText',
          'For transactions that are HTTP requests, the agent can optionally capture the request body (e.g. POST variables). Default is "Off".'
        )}
      >
        <SelectWithPlaceholder
          placeholder={t('captureBodyInputPlaceholderText', 'Select option')}
          options={[
            {
              value: 'off',
              text: t('captureBodyConfigOptionOff', 'Off')
            },
            {
              value: 'errors',
              text: t('captureBodyConfigOptionErrors', 'Errors')
            },
            {
              value: 'transactions',
              text: t('captureBodyConfigOptionTransactions', 'Transactions')
            },
            {
              value: 'all',
              text: t('captureBodyConfigOptionAll', 'All')
            }
          ]}
          value={values.capture_body}
          onChange={e => {
            e.preventDefault();
            onChange({
              ...values,
              capture_body: e.target.value
            });
          }}
        />
      </EuiFormRow>

      <EuiFormRow
        label={t(
          'transactionMaxSpansConfigInputLabel',
          'Transaction max spans'
        )}
        helpText={t(
          'transactionMaxSpansConfigInputHelpText',
          'Limits the amount of spans that are recorded per transaction. Default is 500.'
        )}
        error={t(
          'transactionMaxSpansConfigInputErrorText',
          'Must be between 0 and 32000'
        )}
        isInvalid={!valid.transaction_max_spans}
      >
        <EuiFieldNumber
          placeholder={t(
            'transactionMaxSpansConfigInputPlaceholderText',
            'Set transaction max spans'
          )}
          value={values.transaction_max_spans}
          min={0}
          max={32000}
          onChange={e => {
            e.preventDefault();
            onChange({
              ...values,
              transaction_max_spans: Number(e.target.value)
            });
          }}
        />
      </EuiFormRow>
    </>
  );
}
