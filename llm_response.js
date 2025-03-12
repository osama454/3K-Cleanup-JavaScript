function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError("Input should be an array of promises"));
    }

    const results = [];
    let resolvedCount = 0;

    if (promises.length === 0) {
      return resolve([]);
    }

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then((value) => {
          results[index] = value;
          resolvedCount++;
          if (resolvedCount === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
}

module.exports = { myPromiseAll };
