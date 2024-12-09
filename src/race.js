const { redis } = require("./redis");

const increment = async (process) => {
  const counterKey = "counter";
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
  const redisValue = await redis.get(counterKey);
  console.log(process, redisValue);

  await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
  const value = parseInt(redisValue, 10) || 0;
  console.log(`Current value: ${value} process ${process}`);
  const newValue = value + 1;
  await redis.set(counterKey, newValue);

  console.log(`New value: ${newValue} process ${process}`);
};

const start = async () => {
  console.log("running race condition");
  await redis.set("counter", 0);
  const processes = Array.from({ length: 10 }, (_, i) =>
    increment(`process-${i}`),
  );

  await Promise.all(processes);
};

module.exports = {
  start,
};
