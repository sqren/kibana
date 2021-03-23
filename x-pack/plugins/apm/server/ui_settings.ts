/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import { i18n } from '@kbn/i18n';
import { enableInspectEsQueries } from '../../observability/common/ui_settings_keys';
import { UiSettingsParams } from '../../../../src/core/types';
import { enableServiceOverview } from '../common/ui_settings_keys';

/**
 * uiSettings definitions for APM.
 */
export const uiSettings: Record<string, UiSettingsParams<boolean>> = {
  [enableServiceOverview]: {
    category: ['observability'],
    name: i18n.translate('xpack.apm.enableServiceOverviewExperimentName', {
      defaultMessage: 'APM Service overview',
    }),
    value: true,
    description: i18n.translate(
      'xpack.apm.enableServiceOverviewExperimentDescription',
      {
        defaultMessage: 'Enable the Overview tab for services in APM.',
      }
    ),
    schema: schema.boolean(),
  },
  [enableInspectEsQueries]: {
    category: ['observability'],
    name: i18n.translate('xpack.apm.enableDebugQueriesExperimentName', {
      defaultMessage: 'inspect ES queries',
    }),
    value: false,
    description: i18n.translate(
      'xpack.apm.enableDebugQueriesExperimentDescription',
      {
        defaultMessage: 'Inspect Elasticsearch queries in API responses.',
      }
    ),
    schema: schema.boolean(),
  },
};
