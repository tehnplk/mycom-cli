#!/usr/bin/env node

const { runCli } = require("../lib/cli");

runCli(process.argv).catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

