const Redis = require("ioredis");
const Redlock = require("redlock").default;
const redis = new Redis({
  port: 6379,
  host: "redis",
});

const redlock = new Redlock([redis], {
  driftFactor: 0.01,
  retryCount: 20,
  retryDelay: 500,
  retryJitter: 300,
  automaticExtensionThreshold: 500,
});

module.exports = {
  redis,
  redlock,
};
