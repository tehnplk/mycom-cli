const { printHelp, printSkillManual } = require("./features/manual");
const { handlePwd } = require("./features/pwd");
const { handleCreate } = require("./features/create");
const { handleRead } = require("./features/read");
const { handleFind } = require("./features/find");
const { handleText } = require("./features/text");
const { handleCopy } = require("./features/copy");
const { handleMove } = require("./features/move");
const { handleDelete } = require("./features/delete");
const { handleRename } = require("./features/rename");

async function runCli(argv) {
  const [, , command, ...args] = argv;

  if (!command || command === "-h" || command === "--help" || command === "help") {
    printHelp();
    return;
  }

  if (command === "--skill" || command === "skill") {
    printSkillManual();
    return;
  }

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  switch (command) {
    case "pwd":
      handlePwd();
      return;
    case "create":
      await handleCreate(args);
      return;
    case "read":
      await handleRead(args);
      return;
    case "find":
      await handleFind(args);
      return;
    case "text":
      await handleText(args);
      return;
    case "copy":
      await handleCopy(args);
      return;
    case "move":
      await handleMove(args);
      return;
    case "delete":
      await handleDelete(args);
      return;
    case "rename":
      await handleRename(args);
      return;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

module.exports = {
  runCli,
};

