import t from 'tcomb';

const Methods = t.list(t.Function);
const Settings = t.interface({
  perSecond: t.Integer,
  maxOngoingMethods: t.Integer
}, { strict: true });

export default (_methods, _settings) => {
  const methods = Methods(_methods);
  const { maxOngoingMethods, perSecond } = Settings(_settings);

  return new Promise((resolve) => {
    const minTimeBetweenMethods = 1000 / perSecond;

    let done = [];
    let ongoing = [];
    let stack = [];
    let lastRun = null;

    const runMethod = method => {
      lastRun = Date.now();
      const id = `${Math.random()}`;
      const onDone = res => {
        // move to "done"
        ongoing = ongoing.filter(x => x.id !== id);
        done = done.concat(res);

        if (stack.length > 0) {
          // run next method
          const timeoutMillis = Math.max(minTimeBetweenMethods - (Date.now() - lastRun), 0);

          const run = () => {
            runMethod(stack[0]);
            // update stack
            stack = stack.slice(1, stack.length);
          };

          timeoutMillis > 0 && setTimeout(run, timeoutMillis);
          timeoutMillis <= 0 && run();
        } else {
          resolve(done);
        }
      };

      ongoing = ongoing.concat({ id, promise: method().then(onDone).catch(onDone) });
    };

    stack = stack.concat(methods.slice(maxOngoingMethods, stack.length - 1));
    ongoing = ongoing.concat(methods.slice(0, maxOngoingMethods).map((m, i) => setTimeout(() => runMethod(m), minTimeBetweenMethods * i)));
  });
};
