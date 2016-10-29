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

  fit('maxOngoingMethods', async () => {
    const timeout = 1000;
    const fakeMethod = () => new Promise(resolve => setTimeout(() => resolve(Date.now()), timeout));
    const methods = [...Array(10).keys()].map(() => fakeMethod);
    const maxOngoingMethods = 5;

    const res = await stagger(methods, { maxOngoingMethods, perSecond: Infinity });

    const diff1 = res.slice(0, maxOngoingMethods).map((x, i) => i > 0 ? x - res[i - 1] : 0);
    const diff2 = res.slice(maxOngoingMethods, res.length).map((x, i) => i > 0 ? x - res[maxOngoingMethods + i - 1] : 0);

    const failed = diff1.concat(diff2).filter(d => d > 5);
    if (failed.length > 0) {
      throw new Error(`FAILED ${failed.length} times`);
    }

    return true;
  });

});
