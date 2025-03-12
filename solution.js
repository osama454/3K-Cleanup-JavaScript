function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      reject(new TypeError("Input should be an array of promises"));
      return;
    }

    const results = [];
    let resolvedCount = 0;

    if (promises.length === 0) {
      resolve(results);
      return;
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
        .catch((error) => {
          reject(error);
        });
    });
  });
}

module.exports = { myPromiseAll };

// Sample execution when running this file directly
if (require.main === module) {
  console.log("Running sample execution of myPromiseAll...");

  const samplePromises = [
    Promise.resolve(1),
    Promise.resolve("hello"),
    Promise.resolve({ key: "value" }),
  ];

  myPromiseAll(samplePromises)
    .then((result) => {
      console.log("Sample execution result:", result);
    })
    .catch((error) => {
      console.error("Sample execution error:", error);
    });
}
