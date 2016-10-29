import stagger from '../src';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // eslint-disable-line no-undef

describe('staggerjs', () => {

  it('perSecond', async () => {
    const fakeMethod = async () => Date.now();
    const methods = [...Array(10).keys()].map(() => fakeMethod);
    const perSecond = 2;

    const res = await stagger(methods, { perSecond, maxOngoingMethods: 1 });
    const diff = res.slice(1, res.length).map((x, i) => x - res[i]);

    const failed = diff.filter(d => Math.abs((1000 / perSecond) - d) > 10);
    if (failed.length > 0) {
      throw new Error(`FAILED ${failed.length} times`);
    }

    return true;
  });

});
