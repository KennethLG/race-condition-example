const race = require("./race");
const lock = require("./lock");

const init = async () => {
  await race.start();
  await lock.start();

  process.exit(0);
};

init();
