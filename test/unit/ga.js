'use strict';
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const assert = require('assert');
const ga = require('../../');

describe('Params', () => {
  it('are retreived', done => {
    const params = ga.getRequestParams({
      user: {
        type: 'token',
        key: 'abc123',
        provider: 'DNT',
        app: 'UT.no',
        limit: 1000,
        remaining: 999,
        reset: 1487940909,
        penalty: 1,
      },
      path: '/turer',
      originalUrl: '/turer?limit=50',
    });

    assert.deepEqual(params, {
      dp: '/turer',
      cg1: 'turer',
      cd1: 'turer',
      cd2: 'limit=50',
      cm1: 99.9,
      uid: 'DNT',
      an: 'UT.no',
      aid: undefined,
      v: 1,
    });

    done();
  });
});