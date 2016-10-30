import stagger from '../src';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // eslint-disable-line no-undef

describe('staggerjs', () => {

  const marginOfErrorTimeout = 10;
  const marginOfErrorParallel = 5;

  it('perSecond', async () => {
    const perSecond = 2;

    const fakeMethod = async () => Date.now();
    const methods = [...Array(10).keys()].map(() => fakeMethod);

    const res = await stagger(methods, { perSecond, maxOngoingMethods: 1 });
    const diff = res.slice(1, res.length).map((x, i) => x - res[i]);

    const failed = diff.filter(d => Math.abs((1000 / perSecond) - d) > marginOfErrorTimeout);
    if (failed.length > 0) {
      throw new Error(`FAILED diff ${failed.length} times`);
    }

    return true;
  });

  it('maxOngoingMethods', async () => {
    const timeout = 1000;
    const maxOngoingMethods = 3;

    const fakeMethod = () => new Promise(resolve => setTimeout(() => resolve(Date.now()), timeout));
    const methods = [...Array(maxOngoingMethods * 2).keys()].map(() => fakeMethod);

    const res = await stagger(methods, { maxOngoingMethods, perSecond: Infinity });

    const diff1 = res.slice(0, maxOngoingMethods).map((x, i) => i > 0 ? x - res[i - 1] : 0);
    const diff2 = res.slice(maxOngoingMethods, res.length).map((x, i) => i > 0 ? x - res[maxOngoingMethods + i - 1] : 0);

    const failed = diff1.concat(diff2).filter(d => d > marginOfErrorParallel);
    if (failed.length > 0) {
      throw new Error(`FAILED diff ${failed.length} times`);
    } else if (Math.abs(timeout - (res[res.length - 1] - res[maxOngoingMethods - 1])) > marginOfErrorTimeout) {
      throw new Error('FAILED diff between chunks');
    }

    return true;
  });

  it('default settings', async () => {
    const timeout = 1000;
    const maxOngoingMethods = 5;
    const perSecond = 20;

    const fakeMethod = () => new Promise(resolve => setTimeout(() => resolve(Date.now()), timeout));
    const methods = [...Array(maxOngoingMethods * 2).keys()].map(() => fakeMethod);

    const res = await stagger(methods);

    const diff1 = res.slice(0, maxOngoingMethods).map((x, i) => i > 0 ? x - res[i - 1] : 0);
    const diff2 = res.slice(maxOngoingMethods, res.length).map((x, i) => i > 0 ? x - res[maxOngoingMethods + i - 1] : 0);

    const failed = diff1.concat(diff2).filter(d => d > 1000 / perSecond + marginOfErrorTimeout);
    if (failed.length > 0) {
      throw new Error(`FAILED diff ${failed.length} times`);
    } else if (Math.abs(timeout - (res[res.length - 1] - res[maxOngoingMethods - 1]) > 1000 / perSecond + marginOfErrorTimeout)) {
      throw new Error('FAILED diff between chunks');
    }

    return true;
  });

});
