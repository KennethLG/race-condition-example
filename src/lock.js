const { redis } = require("./redis");

const acquireLock = async (key, ttl) => {
  while (true) {
    // Attempt to set a lock with NX (only if it doesn't exist)
    const lockAcquired = await redis.set(key, "locked", "NX", "PX", ttl);
    if (lockAcquired) {
      console.log(`Lock acquired for ${key}`);
      return key; // Return the lock key
    }
    console.log(`Lock not acquired for ${key}, retrying...`);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
  }
};

const releaseLock = async (key) => {
  const currentValue = await redis.get(key);
  if (currentValue === "locked") {
    await redis.del(key);
    console.log(`Lock released for ${key}`);
  } else {
    console.log(`Lock for ${key} already released or expired.`);
  }
};

const increment = async (process) => {
  const counterKey = "counter";
  const lockKey = "lock:increment"; // Shared lock key
  const lockTimeout = 5000; // 5 seconds

  console.log(`Process ${process} trying to acquire lock`);

  let lock;
  try {
    lock = await acquireLock(lockKey, lockTimeout); // Acquire the shared lock

    const value = parseInt(await redis.get(counterKey), 10) || 0;
    console.log(`Current value: ${value} for process ${process}`);
    const newValue = value + 1;
    await redis.set(counterKey, newValue);
    console.log(`New value: ${newValue} for process ${process}`);
  } finally {
    if (lock) {
      await releaseLock(lock); // Release the shared lock
    }
  }
};

const start = async () => {
  console.log("running lock");
  await redis.set("counter", 0); // Initialize the counter

  // Run 10 processes competing for the shared lock
  const processes = Array.from({ length: 10 }, (_, i) =>
    increment(`process-${i}`),
  );

  await Promise.all(processes);
};

module.exports = {
  start,
};
