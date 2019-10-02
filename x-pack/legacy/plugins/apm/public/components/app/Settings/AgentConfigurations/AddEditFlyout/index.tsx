/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiForm,
  EuiPortal,
  EuiTitle,
  EuiText,
  EuiSpacer
} from '@elastic/eui';
import { idx } from '@kbn/elastic-idx';
import React, { useState } from 'react';
import { toastNotifications } from 'ui/notify';
import { i18n } from '@kbn/i18n';
import { isRight, fold } from 'fp-ts/lib/Either';
import * as iots from 'io-ts';
import { DeepPartial } from 'utility-types';
import { merge } from 'lodash';
import { pipe } from 'fp-ts/lib/pipeable';
import { identity } from 'fp-ts/lib/function';
import {
  agentConfigurationRt,
  AgentConfigurationPayload
} from '../../../../../../common/runtime_types/agent_configuration_rt';
import { ENVIRONMENT_NOT_DEFINED } from '../../../../../../common/environment_filter_values';
import { callApmApi } from '../../../../../services/rest/callApmApi';
import { trackEvent } from '../../../../../../../infra/public/hooks/use_track_metric';
import { Config } from '../index';
import { SettingsSection } from './SettingsSection';
import { ServiceSection } from './ServiceSection';
import { DeleteSection } from './DeleteSection';

const t = (id: string, defaultMessage: string, values?: Record<string, any>) =>
  i18n.translate(`xpack.apm.settings.agentConf.${id}`, {
    defaultMessage,
    values
  });

interface Props {
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
  selectedConfig: Config | null;
}

export function AddEditFlyout({
  onClose,
  onSaved,
  onDeleted,
  selectedConfig
}: Props) {
  const [isSaving, setIsSaving] = useState(false);

  const [agentConfiguration, setAgentConfiguration] = useState<
    DeepPartial<AgentConfigurationPayload>
  >({});

  const defaults = {
    service: {
      name: selectedConfig ? selectedConfig.service.name : '',
      environment:
        (selectedConfig && selectedConfig.service.environment) ||
        ENVIRONMENT_NOT_DEFINED
    },
    settings: {
      transaction_sample_rate: idx(
        selectedConfig,
        _ => _.settings.transaction_sample_rate
      ),
      capture_body: idx(selectedConfig, _ => _.settings.capture_body) || '',
      transaction_max_spans: idx(
        selectedConfig,
        _ => _.settings.transaction_max_spans
      )
    }
  };

  const displayedAgentConfiguration = merge(defaults, agentConfiguration);

  function set<TValue>(
    cb: (value: TValue) => DeepPartial<AgentConfigurationPayload>
  ) {
    return (value: TValue) => {
      return setAgentConfiguration(state => merge({}, state, cb(value)));
    };
  }

  const formValidation = agentConfigurationRt.decode(
    displayedAgentConfiguration
  );

  const isFormValid = isRight(formValidation);

  const isValid = pipe(
    formValidation,
    fold(
      errors => {
        const byContext = errors.reduce(
          (acc, error) => {
            return {
              ...acc,
              [error.context
                .slice(1)
                .map(context => context.key)
                .join('.')]: error
            };
          },
          {} as Record<string, iots.ValidationError | undefined>
        );
        return {
          service: {
            name: !byContext['service.name.0'],
            environment: !byContext['service.environment.0']
          },
          settings: {
            transaction_sample_rate: !byContext[
              'settings.transaction_sample_rate.0'
            ],
            transaction_max_spans: !byContext[
              'settings.transaction_max_spans.0'
            ],
            capture_body: !byContext['settings.capture_body.0']
          }
        };
      },
      () => null
    )
  );

  const handleSubmitEvent = async (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setIsSaving(true);

    const configuration = pipe(
      formValidation,
      fold(() => {
        throw new Error('Agent configuration is not valid');
      }, identity)
    );
    await saveConfig({
      configuration,
      configurationId: selectedConfig ? selectedConfig.id : undefined
    });
    setIsSaving(false);
    onSaved();
  };

  return (
    <EuiPortal>
      <EuiFlyout size="s" onClose={onClose} ownFocus={true}>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle>
            <h2>
              {selectedConfig
                ? t('editConfigTitle', 'Edit configuration')
                : t('createConfigTitle', 'Create configuration')}
            </h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiText size="s">
            This allows you to fine-tune your agent configuration directly in
            Kibana. Best of all, changes are automatically propagated to your
            APM agents so there’s no need to redeploy.
          </EuiText>

          <EuiSpacer size="m" />

          <EuiForm>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <form
              onKeyPress={e => {
                const didClickEnter = e.which === 13;
                if (didClickEnter) {
                  handleSubmitEvent(e);
                }
              }}
            >
              <ServiceSection
                selectedConfig={selectedConfig}
                values={{
                  environment: displayedAgentConfiguration.service.environment,
                  name: displayedAgentConfiguration.service.name
                }}
                onChange={set(({ environment, name }) => ({
                  service: {
                    environment,
                    name
                  }
                }))}
              />

              <EuiSpacer />

              <SettingsSection
                values={displayedAgentConfiguration.settings}
                onChange={set(settings => ({ settings }))}
                valid={{
                  transaction_max_spans: true,
                  transaction_sample_rate: true,
                  capture_body: true,
                  ...(isValid ? isValid.settings : {})
                }}
              />

              {selectedConfig ? (
                <DeleteSection
                  selectedConfig={selectedConfig}
                  onDeleted={onDeleted}
                />
              ) : null}
            </form>
          </EuiForm>
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={onClose}>
                {t('cancelButtonLabel', 'Cancel')}
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                type="submit"
                fill
                isLoading={isSaving}
                iconSide="right"
                isDisabled={!isFormValid}
                onClick={handleSubmitEvent}
              >
                {t('saveConfigurationButtonLabel', 'Save configuration')}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    </EuiPortal>
  );
}

async function saveConfig({
  configuration,
  configurationId
}: {
  configuration: AgentConfigurationPayload;
  configurationId?: string;
}) {
  trackEvent({ app: 'apm', name: 'save_agent_configuration' });

  try {
    if (configurationId) {
      await callApmApi({
        pathname: '/api/apm/settings/agent-configuration/{configurationId}',
        method: 'PUT',
        params: {
          path: { configurationId },
          body: configuration
        }
      });
    } else {
      await callApmApi({
        pathname: '/api/apm/settings/agent-configuration/new',
        method: 'POST',
        params: {
          body: configuration
        }
      });
    }

    toastNotifications.addSuccess({
      title: t('saveConfig.succeeded.title', 'Configuration saved'),
      text: t(
        'saveConfig.succeeded.text',
        'The configuration for {serviceName} was saved. It will take some time to propagate to the agents.',
        { serviceName: `"${configuration.service.name}"` }
      )
    });
  } catch (error) {
    toastNotifications.addDanger({
      title: t('saveConfig.failed.title', 'Configuration could not be saved'),
      text: t(
        'saveConfig.failed.text',
        'Something went wrong when saving the configuration for {serviceName}. Error: {errorMessage}',
        {
          serviceName: `"${configuration.service.name}"`,
          errorMessage: `"${error.message}"`
        }
      )
    });
  }
}
