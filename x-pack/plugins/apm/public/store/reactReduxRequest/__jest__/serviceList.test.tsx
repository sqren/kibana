/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import * as rest from '../../../services/rest/apm';
// @ts-ignore
import { mountWithStore } from '../../../utils/testHelpers';
import { getServiceList, ServiceListRequest } from '../serviceList';

describe('serviceList', () => {
  describe('getServiceList', () => {
    it('should return default value when empty', () => {
      const state = { reactReduxRequest: {}, sorting: { service: {} } } as any;
      expect(getServiceList(state)).toEqual({ args: [], data: [] });
    });

    it('should return serviceList when not empty', () => {
      const state = {
        reactReduxRequest: { serviceList: { data: [{ foo: 'bar' }] } },
        sorting: { service: {} }
      } as any;
      expect(getServiceList(state)).toEqual({
        args: [],
        data: [{ foo: 'bar' }]
      });
    });
  });

  describe('ServiceListRequest', () => {
    let loadSpy: jest.Mock;
    let renderSpy: jest.Mock;
    let wrapper: any;

    beforeEach(() => {
      const state = {
        reactReduxRequest: {
          serviceList: { status: 'my-status', data: [{ foo: 'bar' }] }
        },
        sorting: { service: {} }
      };

      loadSpy = jest.spyOn(rest, 'loadServiceList').mockReturnValue(undefined);
      renderSpy = jest.fn().mockReturnValue(<div>rendered</div>);

      wrapper = mountWithStore(
        <ServiceListRequest
          urlParams={{ start: 10, end: 1337 }}
          render={renderSpy}
        />,
        state
      );
    });

    it('should call render method', () => {
      expect(renderSpy).toHaveBeenCalledWith({
        args: [],
        data: [{ foo: 'bar' }],
        status: 'my-status'
      });
    });

    it('should call "loadServiceList"', () => {
      expect(loadSpy).toHaveBeenCalledWith({
        start: 10,
        end: 1337
      });
    });

    it('should render component', () => {
      expect(wrapper.html()).toEqual('<div>rendered</div>');
    });
  });
});
